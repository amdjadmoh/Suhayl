import type { Request, Response } from "express"
import "../middleware/auth"
import { Types } from "mongoose"
import { Student } from "../models/Student"
import { University } from "../models/University"

export async function getAll(req: Request, res: Response): Promise<void> {
  const students = await Student.find({ agencyId: new Types.ObjectId(req.user!._id) }).sort({ name: 1 })
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
    agencyId: new Types.ObjectId(req.user!._id),
  })
  if (!student) {
    res.status(404).json({ message: "Student not found" })
    return
  }
  res.json(student)
}

export async function create(req: Request, res: Response): Promise<void> {
  const { name, email } = req.body as Record<string, unknown>
  if (!name || !email) {
    res.status(400).json({ message: "Name and email are required" })
    return
  }
  const student = await Student.create({ ...req.body, agencyId: new Types.ObjectId(req.user!._id) })
  res.status(201).json(student)
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = req.params["id"]
  if (!id) {
    res.status(400).json({ message: "Missing student ID" })
    return
  }
  const student = await Student.findOneAndUpdate(
    { _id: id, agencyId: new Types.ObjectId(req.user!._id) },
    req.body,
    { new: true, runValidators: true }
  )
  if (!student) {
    res.status(404).json({ message: "Student not found" })
    return
  }
  res.json(student)
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = req.params["id"]
  if (!id) {
    res.status(400).json({ message: "Missing student ID" })
    return
  }
  const student = await Student.findOne({
    _id: id,
    agencyId: new Types.ObjectId(req.user!._id),
  })
  if (!student) {
    res.status(404).json({ message: "Student not found" })
    return
  }
  // Delete student's universities
  await University.deleteMany({ studentId: student._id, agencyId: new Types.ObjectId(req.user!._id) })
  await Student.findByIdAndDelete(student._id)
  res.json({ message: "Student and their applications deleted" })
}
