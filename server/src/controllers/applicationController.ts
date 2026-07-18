import type { Request, Response } from "express"
import "../middleware/auth"
import { Application } from "../models/Application"
import { Program } from "../models/Program"
import { Student } from "../models/Student"
import { buildApplicationCalendar } from "../services/calendar"

const POPULATE_PROGRAM = {
  path: "programId",
  populate: { path: "universityId", select: "name country city ranking" },
}

function buildApplicationFilter(user?: Request["user"]): Record<string, unknown> {
  const filter: Record<string, unknown> = {}
  if (user) {
    if (user.role === "student") {
      filter["createdBy"] = user._id
    } else if (user.role === "agency") {
      filter["agencyId"] = user._id
    }
    // admin sees all
  }
  return filter
}

export async function getAll(req: Request, res: Response): Promise<void> {
  const filter = buildApplicationFilter(req.user)

  const query = req.query as { status?: string; search?: string }
  if (query["status"] != null && query["status"].length > 0) {
    filter["applicationStatus"] = query["status"]
  }

  if (query["search"] != null && query["search"].length > 0) {
    filter["studentName"] = { $regex: query["search"], $options: "i" }
  }

  const [applications, total] = await Promise.all([
    Application.find(filter).populate(POPULATE_PROGRAM).sort({ createdAt: -1 }),
    Application.countDocuments(filter),
  ])
  res.json({ applications, total })
}

export async function getById(req: Request, res: Response): Promise<void> {
  const application = await Application.findById(req.params["id"]).populate(
    POPULATE_PROGRAM
  )
  if (!application) {
    res.status(404).json({ message: "Application not found" })
    return
  }

  // Permission check
  if (req.user) {
    const isAdmin = req.user.role === "admin"
    const isOwner =
      req.user.role === "student" &&
      application.createdBy?.toString() === req.user._id
    const isAgencyOfApp =
      req.user.role === "agency" &&
      application.agencyId?.toString() === req.user._id

    if (!isAdmin && !isOwner && !isAgencyOfApp) {
      res.status(403).json({ message: "Forbidden" })
      return
    }
  }

  res.json(application)
}

export async function create(req: Request, res: Response): Promise<void> {
  const body = req.body as {
    programId: string
    studentName: string
    studentEmail: string
    studentId?: string
    notes?: string
  }
  const { programId, studentName, studentEmail, studentId } = body

  // Verify program exists
  const program = await Program.findById(programId)
  if (!program) {
    res.status(404).json({ message: "Program not found" })
    return
  }

  const payload: Record<string, unknown> = {
    programId,
    studentName,
    studentEmail,
    notes: body["notes"],
    applicationProgress: {},
  }

  // Auto-populate testScores from program's testRequirements if not provided
  const appProgress = payload["applicationProgress"] as Record<string, unknown>
  appProgress["testScores"] = (program.testRequirements || []).map(
    (t: { name: string }) => ({ name: t.name, taken: false })
  )

  // Auto-populate SOP status if program requires it
  if (program.requiresSOP) {
    appProgress["sopStatus"] = "not_started"
  }

  // Auto-populate recommendation letters count if program requires them
  if (program.recommendationLetters > 0) {
    appProgress["recommendationsRequested"] = program.recommendationLetters
  }

  if (req.user) {
    if (req.user.role === "student") {
      payload["createdBy"] = req.user._id
    } else if (req.user.role === "agency") {
      payload["agencyId"] = req.user._id
      if (studentId) {
        const student = await Student.findOne({
          _id: studentId,
          agencyId: req.user._id,
        })
        if (student) {
          payload["studentName"] = student.name
          payload["studentEmail"] = student.email
        }
      }
    }
  }

  const application = await Application.create(payload)

  // Auto-fill deadline from program if not provided
  if (!application.applicationDeadline) {
    const prog = await Program.findById(programId).select("applicationDeadline")
    if (prog?.applicationDeadline) {
      application.set("applicationDeadline", prog.applicationDeadline)
      await application.save()
    }
  }

  res.status(201).json(application)
}

export async function update(req: Request, res: Response): Promise<void> {
  const existing = await Application.findById(req.params["id"])
  if (!existing) {
    res.status(404).json({ message: "Application not found" })
    return
  }

  // Permission check
  if (req.user) {
    const isAdmin = req.user.role === "admin"
    const isOwner =
      req.user.role === "student" &&
      existing.createdBy?.toString() === req.user._id
    const isAgencyOfApp =
      req.user.role === "agency" &&
      existing.agencyId?.toString() === req.user._id

    if (!isAdmin && !isOwner && !isAgencyOfApp) {
      res.status(403).json({ message: "Forbidden" })
      return
    }
  }

  // req.body is pre-validated by validate(updateApplicationSchema, "body")
  const application = await Application.findByIdAndUpdate(
    req.params["id"],
    req.body,
    { new: true, runValidators: true }
  )
  if (!application) {
    res.status(404).json({ message: "Application not found" })
    return
  }
  res.json(application)
}

export async function remove(req: Request, res: Response): Promise<void> {
  const existing = await Application.findById(req.params["id"])
  if (!existing) {
    res.status(404).json({ message: "Application not found" })
    return
  }

  // Permission check
  if (req.user) {
    const isAdmin = req.user.role === "admin"
    const isOwner =
      req.user.role === "student" &&
      existing.createdBy?.toString() === req.user._id
    const isAgencyOfApp =
      req.user.role === "agency" &&
      existing.agencyId?.toString() === req.user._id

    if (!isAdmin && !isOwner && !isAgencyOfApp) {
      res.status(403).json({ message: "Forbidden" })
      return
    }
  }

  await Application.findByIdAndDelete(req.params["id"])
  res.json({ message: "Application deleted" })
}

export async function getCalendar(req: Request, res: Response): Promise<void> {
  const user = req.user!
  const icsString = await buildApplicationCalendar(
    user._id,
    user.role as "student" | "agency" | "admin",
  )
  res.setHeader("Content-Type", "text/calendar; charset=utf-8")
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="wannaout-deadlines.ics"',
  )
  res.send(icsString)
}
