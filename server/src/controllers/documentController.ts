import type { Request, Response } from "express"
import { agencyScope } from "../middleware/auth"
import crypto from "crypto"
import { Types } from "mongoose"
import { Student } from "../models/Student"
import { DocumentRequest } from "../models/DocumentRequest"
import { Activity } from "../models/Activity"
import { removeFile, sendStoredFile } from "../services/files"
import { notifyFamily } from "../services/familyEmail"
import { logActivity } from "../services/activity"

function agencyOf(req: Request): Types.ObjectId {
  return new Types.ObjectId(agencyScope(req))
}

async function findOwnStudent(req: Request, res: Response) {
  const student = await Student.findOne({ _id: String(req.params["id"]), agencyId: agencyOf(req) })
  if (!student) res.status(404).json({ message: "Student not found" })
  return student
}

/** GET /api/students/:id/documents */
export async function listForStudent(req: Request, res: Response): Promise<void> {
  const student = await findOwnStudent(req, res)
  if (!student) return
  const documents = await DocumentRequest.find({ studentId: student._id }).sort({ createdAt: 1 }).limit(500)
  res.json(documents)
}

/** POST /api/students/:id/documents — ask the student for a document */
export async function createRequest(req: Request, res: Response): Promise<void> {
  const student = await findOwnStudent(req, res)
  if (!student) return
  const { title, note, dueDate } = req.body as { title: string; note?: string; dueDate?: string }
  const document = await DocumentRequest.create({
    agencyId: agencyOf(req),
    studentId: student._id,
    title,
    ...(note ? { note } : {}),
    ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
  })
  const emailSent = await notifyFamily(student, [title], dueDate ? new Date(dueDate) : undefined)
  await logActivity(req, student._id, "Asked for {doc}", { doc: title })
  res.status(201).json({ ...document.toObject(), emailSent })
}

/** GET /api/documents?status=uploaded — the agency's requests across all students */
export async function listForAgency(req: Request, res: Response): Promise<void> {
  const filter: Record<string, unknown> = { agencyId: agencyOf(req) }
  const status = req.query["status"]
  if (typeof status === "string" && status) filter["status"] = status
  const documents = await DocumentRequest.find(filter).sort({ updatedAt: -1 }).limit(1000).populate("studentId", "name email")
  res.json(documents)
}

/** PUT /api/documents/:id — accept the file, or send it back with a reason */
export async function review(req: Request, res: Response): Promise<void> {
  const document = await DocumentRequest.findOne({ _id: String(req.params["id"]), agencyId: agencyOf(req) })
  if (!document) {
    res.status(404).json({ message: "Document not found" })
    return
  }
  if (!document.file) {
    res.status(400).json({ message: "Nothing has been uploaded yet" })
    return
  }
  const { status, rejectReason } = req.body as { status: "accepted" | "rejected"; rejectReason?: string }
  document.status = status
  document.set("rejectReason", status === "rejected" && rejectReason ? rejectReason : undefined)
  await document.save()
  await logActivity(
    req,
    document.studentId,
    status === "accepted" ? "Accepted {doc}" : rejectReason ? "Sent back {doc}: {reason}" : "Sent back {doc}",
    { doc: document.title, ...(rejectReason ? { reason: rejectReason } : {}) },
  )
  res.json(document)
}

/** DELETE /api/documents/:id */
export async function remove(req: Request, res: Response): Promise<void> {
  const document = await DocumentRequest.findOneAndDelete({ _id: String(req.params["id"]), agencyId: agencyOf(req) })
  if (!document) {
    res.status(404).json({ message: "Document not found" })
    return
  }
  await removeFile(document.file?.storedName)
  await logActivity(req, document.studentId, "Removed the request for {doc}", { doc: document.title })
  res.json({ message: "Request removed" })
}

/** GET /api/documents/:id/file */
export async function download(req: Request, res: Response): Promise<void> {
  const document = await DocumentRequest.findOne({ _id: String(req.params["id"]), agencyId: agencyOf(req) })
  if (!document?.file) {
    res.status(404).json({ message: "File not found" })
    return
  }
  await sendStoredFile(res, document.file)
}

// How long a family link works before the agency has to extend it
const PORTAL_LINK_DAYS = Number(process.env["PORTAL_LINK_DAYS"] ?? 180)
const linkExpiry = (): Date => new Date(Date.now() + PORTAL_LINK_DAYS * 24 * 60 * 60 * 1000)

/** POST /api/students/:id/portal — turn on the family link, or replace it with a new one */
export async function enablePortal(req: Request, res: Response): Promise<void> {
  const student = await findOwnStudent(req, res)
  if (!student) return
  student.portalToken = crypto.randomBytes(24).toString("base64url")
  student.portalEnabledAt = new Date()
  student.portalExpiresAt = linkExpiry()
  await student.save()
  await logActivity(req, student._id, "Made a new family link")
  res.json(student)
}

/** DELETE /api/students/:id/portal — the old link stops working straight away */
export async function disablePortal(req: Request, res: Response): Promise<void> {
  const student = await findOwnStudent(req, res)
  if (!student) return
  student.set("portalToken", undefined)
  student.set("portalEnabledAt", undefined)
  student.set("portalExpiresAt", undefined)
  await student.save()
  await logActivity(req, student._id, "Turned off the family link")
  res.json(student)
}

/** PUT /api/students/:id/portal/extend — keep the same link working for another period */
export async function extendPortal(req: Request, res: Response): Promise<void> {
  const student = await findOwnStudent(req, res)
  if (!student) return
  if (!student.portalToken) {
    res.status(400).json({ message: "The family link is off" })
    return
  }
  student.portalExpiresAt = linkExpiry()
  await student.save()
  res.json(student)
}

/** GET /api/students/:id/activity — the last 100 things done on this student */
export async function studentActivity(req: Request, res: Response): Promise<void> {
  const student = await findOwnStudent(req, res)
  if (!student) return
  const items = await Activity.find({ studentId: student._id, agencyId: agencyOf(req) }).sort({ createdAt: -1 }).limit(100)
  res.json(items)
}

/** GET /api/agency/activity — recent activity across the agency, newest first */
export async function agencyActivity(req: Request, res: Response): Promise<void> {
  const items = await Activity.find({ agencyId: agencyOf(req) }).sort({ createdAt: -1 }).limit(100).populate("studentId", "name")
  res.json(items)
}
