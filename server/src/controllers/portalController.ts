import type { Request, Response } from "express"
import { Student } from "../models/Student"
import { User } from "../models/User"
import { Application } from "../models/Application"
import { DocumentRequest } from "../models/DocumentRequest"
import { Notification } from "../models/Notification"
import { logFamilyActivity } from "../services/activity"
import { isAllowedFile, removeFile, sendStoredFile, storeFile } from "../services/files"

/*
 * The family portal. Anyone holding a student's private link can see that
 * student's progress and upload what the agency asked for, without an account.
 * Only what a family needs is returned: no agency notes, no other students.
 */

async function studentForToken(req: Request, res: Response) {
  const token = String(req.params["token"] ?? "")
  const student = token.length >= 20 ? await Student.findOne({ portalToken: token }) : null
  // Links made before expiry existed have no date and keep working until replaced
  if (!student || (student.portalExpiresAt && student.portalExpiresAt.getTime() < Date.now())) {
    res.status(404).json({ message: "This link isn't active. Ask your agency for a new one." })
    return null
  }
  return student
}

function publicDocument(d: InstanceType<typeof DocumentRequest>) {
  return {
    _id: d._id,
    title: d.title,
    note: d.note,
    dueDate: d.dueDate,
    status: d.status,
    rejectReason: d.rejectReason,
    file: d.file ? { originalName: d.file.originalName, size: d.file.size, uploadedAt: d.file.uploadedAt } : undefined,
  }
}

interface PopulatedProgram {
  name?: string
  degreeLevel?: string
  requiredDocuments?: string[]
  universityId?: { name?: string; city?: string; country?: string }
}

/** GET /api/portal/:token */
export async function getPortal(req: Request, res: Response): Promise<void> {
  const student = await studentForToken(req, res)
  if (!student) return

  const [agency, applications, documents] = await Promise.all([
    User.findById(student.agencyId).select("name email"),
    Application.find({
      agencyId: student.agencyId,
      $or: [{ studentId: student._id }, { studentId: { $exists: false }, studentEmail: student.email }],
    })
      .populate({
        path: "programId",
        select: "name degreeLevel requiredDocuments",
        populate: { path: "universityId", select: "name city country" },
      })
      .sort({ applicationDeadline: 1 }),
    DocumentRequest.find({ studentId: student._id }).sort({ createdAt: 1 }),
  ])

  res.json({
    student: { name: student.name, targetIntake: student.targetIntake },
    agency: agency ? { name: agency.name, email: agency.email } : null,
    applications: applications.map((a) => {
      const program = a.programId as unknown as PopulatedProgram | null
      const p = a.applicationProgress
      return {
        _id: a._id,
        program: program?.name ?? "Program",
        degreeLevel: program?.degreeLevel,
        university: program?.universityId?.name,
        city: program?.universityId?.city,
        country: program?.universityId?.country,
        status: a.applicationStatus,
        deadline: a.applicationDeadline,
        submittedAt: p?.applicationSubmittedDate,
        documentsReady: p?.documentsObtained?.length ?? 0,
        documentsNeeded: program?.requiredDocuments?.length ?? 0,
        visaApplied: p?.visaApplied ?? false,
        visaApproved: p?.visaApproved,
        interviewAt: p?.interviewScheduled,
        updatedAt: a.updatedAt,
      }
    }),
    documents: documents.map(publicDocument),
  })
}

/** POST /api/portal/:token/documents/:docId (multipart field "file") */
export async function upload(req: Request, res: Response): Promise<void> {
  const student = await studentForToken(req, res)
  if (!student) return
  const document = await DocumentRequest.findOne({ _id: String(req.params["docId"]), studentId: student._id })
  if (!document) {
    res.status(404).json({ message: "Document not found" })
    return
  }
  if (document.status === "accepted") {
    res.status(400).json({ message: "Your agency already accepted this document" })
    return
  }
  const file = req.file
  if (!file) {
    res.status(400).json({ message: "Choose a file to send" })
    return
  }
  if (!isAllowedFile(file.mimetype, file.buffer)) {
    res.status(400).json({ message: "Send a PDF or a photo (JPG, PNG or WebP)" })
    return
  }

  const previous = document.file?.storedName
  const storedName = await storeFile(file.buffer, file.mimetype)
  document.file = {
    storedName,
    // Browsers send the name as latin1; keep accented names readable
    originalName: Buffer.from(file.originalname, "latin1").toString("utf8").slice(0, 200),
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  }
  document.status = "uploaded"
  document.set("rejectReason", undefined)
  await document.save()
  await removeFile(previous)

  await Notification.create({
    userId: student.counsellorId ?? student.agencyId,
    type: "system",
    title: `${student.name} sent ${document.title}`,
    message: `${document.title} is ready for you to check.`,
    link: `/agency/students/${student._id}`,
  })

  await logFamilyActivity(student.agencyId, student._id, `Sent ${document.title}`)
  res.json(publicDocument(document))
}

/** GET /api/portal/:token/documents/:docId/file */
export async function download(req: Request, res: Response): Promise<void> {
  const student = await studentForToken(req, res)
  if (!student) return
  const document = await DocumentRequest.findOne({ _id: String(req.params["docId"]), studentId: student._id })
  if (!document?.file) {
    res.status(404).json({ message: "File not found" })
    return
  }
  await sendStoredFile(res, document.file)
}
