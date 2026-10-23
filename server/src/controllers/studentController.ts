import type { Request, Response } from "express"
import { agencyScope } from "../middleware/auth"
import { Types } from "mongoose"
import { Student } from "../models/Student"
import { Application } from "../models/Application"
import { deleteApplications, deleteDocuments } from "../services/accounts"
import { isTeamMember } from "./teamController"
import { logActivity } from "../services/activity"
import { User } from "../models/User"

const DUPLICATE = { message: "You already have a student with that email" }

/** An agency's applications for one student: linked by id, or by email for older records. */
function applicationsOf(student: { _id: unknown; email: string }, agencyId: Types.ObjectId): Record<string, unknown> {
  return { agencyId, $or: [{ studentId: student._id }, { studentId: { $exists: false }, studentEmail: student.email }] }
}

export async function getAll(req: Request, res: Response): Promise<void> {
  const students = await Student.find({ agencyId: new Types.ObjectId(agencyScope(req)) }).sort({ name: 1 })
  res.json(students)
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = req.params["id"]
  if (!id) {
    res.status(400).json({ message: "Missing student ID" })
    return
  }
  const student = await Student.findOne({
    _id: id,
    agencyId: new Types.ObjectId(agencyScope(req)),
  })
  if (!student) {
    res.status(404).json({ message: "Student not found" })
    return
  }
  res.json(student)
}

export async function create(req: Request, res: Response): Promise<void> {
  // req.body is pre-validated by validate(createStudentSchema, "body")
  const agencyId = new Types.ObjectId(agencyScope(req))
  if (await Student.exists({ agencyId, email: req.body.email })) {
    res.status(409).json(DUPLICATE)
    return
  }
  const counsellorId = (req.body.counsellorId as string | null | undefined) ?? (req.user!.isAgencyOwner ? null : req.user!._id)
  if (counsellorId && !(await isTeamMember(String(agencyId), counsellorId))) {
    res.status(400).json({ message: "That person isn't on your team" })
    return
  }
  const { counsellorId: _ignored, ...fields } = req.body as Record<string, unknown>
  const student = await Student.create({ ...fields, ...(counsellorId ? { counsellorId } : {}), agencyId })
  await logActivity(req, student._id, `Added ${student.name}`)
  res.status(201).json(student)
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = req.params["id"]
  if (!id) {
    res.status(400).json({ message: "Missing student ID" })
    return
  }
  const agencyId = new Types.ObjectId(agencyScope(req))
  const before = await Student.findOne({ _id: id, agencyId })
  if (!before) {
    res.status(404).json({ message: "Student not found" })
    return
  }
  const email = req.body.email as string | undefined
  if (email && email !== before.email && (await Student.exists({ agencyId, email, _id: { $ne: before._id } }))) {
    res.status(409).json(DUPLICATE)
    return
  }

  const counsellorId = req.body.counsellorId as string | null | undefined
  if (counsellorId && !(await isTeamMember(String(agencyId), counsellorId))) {
    res.status(400).json({ message: "That person isn't on your team" })
    return
  }
  // req.body is pre-validated by validate(updateStudentSchema, "body"); null clears the counsellor
  const { counsellorId: _c, ...fields } = req.body as Record<string, unknown>
  const change =
    counsellorId === null ? { $set: fields, $unset: { counsellorId: "" } } : { $set: { ...fields, ...(counsellorId ? { counsellorId } : {}) } }
  const student = await Student.findOneAndUpdate({ _id: id, agencyId }, change, { new: true, runValidators: true })
  if (!student) {
    res.status(404).json({ message: "Student not found" })
    return
  }

  // Keep their applications filed under them when the name or email changes
  if (student.email !== before.email || student.name !== before.name) {
    await Application.updateMany(applicationsOf(before, agencyId), {
      $set: { studentId: student._id, studentName: student.name, studentEmail: student.email },
    })
  }
  if (counsellorId !== undefined && String(before.counsellorId ?? "") !== String(counsellorId ?? "")) {
    const to = counsellorId ? await User.findById(counsellorId).select("name") : null
    await logActivity(req, student._id, to ? `Gave the file to ${to.name}` : "Removed the counsellor")
  }
  // Blank and missing are the same thing to a person reading the history
  const norm = (v: unknown): string => JSON.stringify(v === "" || v === undefined || (Array.isArray(v) && v.length === 0) ? null : v)
  const changed = Object.keys(fields).filter((k) => norm((before as unknown as Record<string, unknown>)[k]) !== norm(fields[k]))
  const labels: Record<string, string> = { name: "name", email: "email", phone: "phone", notes: "notes", feeAgreed: "agreed fee" }
  const named = changed.map((k) => labels[k]).filter(Boolean)
  const profile = changed.some((k) => ["gpa", "ieltsScore", "monthlyBudget", "preferredCountries", "degreeLevel", "targetIntake"].includes(k))
  if (named.length || profile) await logActivity(req, student._id, `Updated ${[...named, ...(profile ? ["academic profile"] : [])].join(", ")}`)
  res.json(student)
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = req.params["id"]
  if (!id) {
    res.status(400).json({ message: "Missing student ID" })
    return
  }
  const agencyId = new Types.ObjectId(agencyScope(req))
  const student = await Student.findOne({ _id: id, agencyId })
  if (!student) {
    res.status(404).json({ message: "Student not found" })
    return
  }
  const removed = await deleteApplications(applicationsOf(student, agencyId))
  await deleteDocuments({ studentId: student._id })
  await Student.findByIdAndDelete(student._id)
  await logActivity(req, null, `Deleted ${student.name} and ${removed} application${removed === 1 ? "" : "s"}`)
  res.json({ message: "Student and their applications deleted", applicationsDeleted: removed })
}
