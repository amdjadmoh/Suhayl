import type { Request, Response } from "express"
import { agencyScope } from "../middleware/auth"
import { Application } from "../models/Application"
import { Program } from "../models/Program"
import { Student } from "../models/Student"
import { Notification } from "../models/Notification"
import { buildApplicationCalendar } from "../services/calendar"
import { logActivity } from "../services/activity"
import { canViewProgram, findVisibleProgram } from "../services/visibility"
import { containsText, paging } from "../services/query"

const POPULATE_PROGRAM = {
  path: "programId",
  populate: { path: "universityId", select: "name country city ranking" },
}

/**
 * An application can point at a program the caller may no longer see (made before
 * visibility was checked, or since made private). Then only its name goes out: none
 * of another account's private requirements, fees or notes.
 */
function withVisibleProgram(application: InstanceType<typeof Application>, viewer: Request["user"]): Record<string, unknown> {
  const json = application.toJSON() as unknown as Record<string, unknown>
  const program = json["programId"] as { _id?: unknown; name?: string; isOfficial?: boolean; createdBy?: unknown } | null
  if (program && typeof program === "object" && "_id" in program && !canViewProgram(viewer, program)) {
    json["programId"] = { _id: program._id, name: program.name, hidden: true }
  }
  return json
}

function buildApplicationFilter(user?: Request["user"]): Record<string, unknown> {
  const filter: Record<string, unknown> = {}
  if (user) {
    if (user.role === "student") {
      filter["createdBy"] = user._id
    } else if (user.role === "agency") {
      filter["agencyId"] = user.agencyId ?? user._id
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

  const search = containsText(query["search"])
  if (search) filter["studentName"] = search

  const { limit, skip } = paging(req.query as Record<string, unknown>, { limit: 1000, max: 1000 })
  const [applications, total] = await Promise.all([
    Application.find(filter).populate(POPULATE_PROGRAM).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Application.countDocuments(filter),
  ])
  res.json({ applications: applications.map((a) => withVisibleProgram(a, req.user)), total })
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
      application.agencyId?.toString() === agencyScope(req)

    if (!isAdmin && !isOwner && !isAgencyOfApp) {
      res.status(403).json({ message: "Forbidden" })
      return
    }
  }

  res.json(withVisibleProgram(application, req.user))
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

  // The program must exist and be one the caller may see: someone else's private program is "not found"
  const program = await findVisibleProgram(req.user, programId)
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
      payload["agencyId"] = agencyScope(req)
      if (studentId) {
        const student = await Student.findOne({
          _id: studentId,
          agencyId: agencyScope(req),
        })
        if (student) {
          payload["studentId"] = student._id
          payload["studentName"] = student.name
          payload["studentEmail"] = student.email
        }
      }
    }
  }

  // An agency managing many files shouldn't open the same program twice for one student
  // while the first is still in play; reapplying after a decision is still allowed.
  const duplicate = payload["studentId"]
    ? await Application.exists({
        agencyId: payload["agencyId"],
        studentId: payload["studentId"],
        programId,
        applicationStatus: { $in: ["Preparing", "Applied", "Waitlisted"] },
      } as Record<string, unknown>)
    : null
  if (duplicate) {
    res.status(409).json({ message: "There's already an application for this program", applicationId: duplicate._id })
    return
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

  await logActivity(req, application.studentId, "Started an application to {program}", { program: program.name })
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
      existing.agencyId?.toString() === agencyScope(req)

    if (!isAdmin && !isOwner && !isAgencyOfApp) {
      res.status(403).json({ message: "Forbidden" })
      return
    }
  }

  // Moving an application to another program needs that program to be visible too
  const newProgramId = req.body["programId"] as string | undefined
  if (newProgramId !== undefined && newProgramId !== String(existing.programId) && !(await findVisibleProgram(req.user, newProgramId))) {
    res.status(404).json({ message: "Program not found" })
    return
  }

  const newStatus = req.body["applicationStatus"] as string | undefined

  // req.body is pre-validated by validate(updateApplicationSchema, "body").
  // Progress is merged field by field, so a partial update (or a stale client)
  // can't wipe what it didn't send.
  const { applicationProgress, ...rest } = req.body as Record<string, unknown>
  const set: Record<string, unknown> = { ...rest }
  for (const [key, value] of Object.entries((applicationProgress ?? {}) as Record<string, unknown>)) {
    set[`applicationProgress.${key}`] = value
  }
  const application = await Application.findByIdAndUpdate(
    req.params["id"],
    { $set: set },
    { new: true, runValidators: true }
  )
  if (!application) {
    res.status(404).json({ message: "Application not found" })
    return
  }

  // Create notification if status actually changed
  const recipient = existing.createdBy ?? existing.agencyId
  if (newStatus && newStatus !== existing.applicationStatus && recipient) {
    const prog = await Program.findById(existing.programId).select("name")
    const programName = prog?.name ?? "Unknown Program"

    await Notification.create({
      userId: recipient,
      type: "status_change",
      title: `Application status: ${newStatus}`,
      message: `Your application to "${programName}" is now ${newStatus}.`,
      link: `/applications/${application._id}`,
    })
    await logActivity(req, existing.studentId, "Moved {program} to {status}", { program: programName, status: newStatus })
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
      existing.agencyId?.toString() === agencyScope(req)

    if (!isAdmin && !isOwner && !isAgencyOfApp) {
      res.status(403).json({ message: "Forbidden" })
      return
    }
  }

  await Application.findByIdAndDelete(req.params["id"])
  const prog = await Program.findById(existing.programId).select("name")
  await logActivity(req, existing.studentId, "Deleted the application to {program}", { program: prog?.name ?? "?" })
  res.json({ message: "Application deleted" })
}

export async function getCalendar(req: Request, res: Response): Promise<void> {
  const user = req.user!
  const icsString = await buildApplicationCalendar(
    user.role === "agency" ? agencyScope(req) : user._id,
    user.role as "student" | "agency" | "admin",
  )
  res.setHeader("Content-Type", "text/calendar; charset=utf-8")
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="wannaout-deadlines.ics"',
  )
  res.send(icsString)
}
