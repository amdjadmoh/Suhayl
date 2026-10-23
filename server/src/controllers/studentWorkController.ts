import type { Request, Response } from "express"
import { agencyScope } from "../middleware/auth"
import { Types } from "mongoose"
import { Student } from "../models/Student"
import { DocumentRequest } from "../models/DocumentRequest"

/*
 * The agency's own work on a student: follow-ups to do and money received,
 * plus asking many students for the same document at once.
 */

function agencyOf(req: Request): Types.ObjectId {
  return new Types.ObjectId(agencyScope(req))
}

async function ownStudent(req: Request, res: Response) {
  const student = await Student.findOne({ _id: String(req.params["id"]), agencyId: agencyOf(req) })
  if (!student) res.status(404).json({ message: "Student not found" })
  return student
}

/** POST /api/students/:id/tasks — body { text, dueDate? } */
export async function addTask(req: Request, res: Response): Promise<void> {
  const student = await ownStudent(req, res)
  if (!student) return
  const { text, dueDate } = req.body as { text: string; dueDate?: string }
  student.tasks.push({ text, ...(dueDate ? { dueDate: new Date(dueDate) } : {}), done: false, createdAt: new Date() } as never)
  await student.save()
  res.status(201).json(student)
}

/** PUT /api/students/:id/tasks/:taskId — body { done?, text?, dueDate? (null clears) } */
export async function updateTask(req: Request, res: Response): Promise<void> {
  const student = await ownStudent(req, res)
  if (!student) return
  const task = student.tasks.find((t) => String(t._id) === req.params["taskId"])
  if (!task) {
    res.status(404).json({ message: "Follow-up not found" })
    return
  }
  const { done, text, dueDate } = req.body as { done?: boolean; text?: string; dueDate?: string | null }
  if (text !== undefined) task.text = text
  if (dueDate !== undefined) (task as unknown as { set: (k: string, v: unknown) => void }).set("dueDate", dueDate ? new Date(dueDate) : undefined)
  if (done !== undefined) {
    task.done = done
    ;(task as unknown as { set: (k: string, v: unknown) => void }).set("doneAt", done ? new Date() : undefined)
  }
  await student.save()
  res.json(student)
}

/** DELETE /api/students/:id/tasks/:taskId */
export async function removeTask(req: Request, res: Response): Promise<void> {
  const student = await ownStudent(req, res)
  if (!student) return
  student.tasks = student.tasks.filter((t) => String(t._id) !== req.params["taskId"]) as never
  await student.save()
  res.json(student)
}

/** POST /api/students/:id/payments — body { amount, paidAt, method?, note? } */
export async function addPayment(req: Request, res: Response): Promise<void> {
  const student = await ownStudent(req, res)
  if (!student) return
  const { amount, paidAt, method, note } = req.body as { amount: number; paidAt: string; method?: string; note?: string }
  student.payments.push({ amount, paidAt: new Date(paidAt), ...(method ? { method } : {}), ...(note ? { note } : {}) } as never)
  await student.save()
  res.status(201).json(student)
}

/** DELETE /api/students/:id/payments/:paymentId */
export async function removePayment(req: Request, res: Response): Promise<void> {
  const student = await ownStudent(req, res)
  if (!student) return
  student.payments = student.payments.filter((p) => String(p._id) !== req.params["paymentId"]) as never
  await student.save()
  res.json(student)
}

/**
 * POST /api/students/bulk/documents — body { studentIds, title, note?, dueDate? }
 * Skips students who already have an open request with the same title.
 */
export async function bulkRequestDocument(req: Request, res: Response): Promise<void> {
  const agencyId = agencyOf(req)
  const { studentIds, title, note, dueDate } = req.body as { studentIds: string[]; title: string; note?: string; dueDate?: string }
  const students = await Student.find({ _id: { $in: studentIds }, agencyId }).select("_id")
  const ids = students.map((s) => s._id)
  const already = await DocumentRequest.find({
    agencyId,
    studentId: { $in: ids },
    title: { $regex: `^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    status: { $ne: "rejected" },
  }).select("studentId")
  const skip = new Set(already.map((d) => String(d.studentId)))
  const fresh = ids.filter((id) => !skip.has(String(id)))
  if (fresh.length) {
    await DocumentRequest.insertMany(
      fresh.map((studentId) => ({
        agencyId,
        studentId,
        title,
        ...(note ? { note } : {}),
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      })),
    )
  }
  res.status(201).json({ requested: fresh.length, alreadyAsked: skip.size, notFound: studentIds.length - ids.length })
}
