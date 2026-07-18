import type { Request, Response } from "express"
import "../middleware/auth"
import { User } from "../models/User"
import { Country } from "../models/Country"
import { City } from "../models/City"
import { University } from "../models/University"
import { Student } from "../models/Student"
import { Application } from "../models/Application"
import { Program } from "../models/Program"
import bcrypt from "bcryptjs"

export async function getUsers(_req: Request, res: Response): Promise<void> {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 })
  res.json(users)
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const id = req.params["id"]
  if (id === req.user!._id) {
    res.status(400).json({ message: "Cannot delete yourself" })
    return
  }
  const user = await User.findByIdAndDelete(id)
  if (!user) {
    res.status(404).json({ message: "User not found" })
    return
  }
  res.json({ message: "User deleted" })
}

export async function getStats(_req: Request, res: Response): Promise<void> {
  const [
    totalUsers,
    totalUniversities,
    totalPrograms,
    totalApplications,
    totalCountries,
    totalCities,
    totalAgencies,
    totalStudents,
    totalStudentsManaged,
    customUniversities,
    customPrograms,
  ] = await Promise.all([
    User.countDocuments(),
    University.countDocuments(),
    Program.countDocuments(),
    Application.countDocuments(),
    Country.countDocuments(),
    City.countDocuments(),
    User.countDocuments({ role: "agency" }),
    Student.countDocuments(),
    User.countDocuments({ role: "student" }),
    University.countDocuments({ isOfficial: false }),
    Program.countDocuments({ isOfficial: false }),
  ])

  const byRole = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
    { $project: { role: "$_id", count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ])

  res.json({
    totalUsers,
    totalUniversities,
    totalPrograms,
    totalApplications,
    totalCountries,
    totalCities,
    totalAgencies,
    totalStudents,
    totalStudentsManaged,
    customUniversities,
    customPrograms,
    byRole,
  })
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const { email, password, name, role } = req.body as Record<string, unknown>

  if (!email || !password || !name || !role) {
    res.status(400).json({ message: "Missing required fields: email, password, name, role" })
    return
  }

  const existing = await User.findOne({ email })
  if (existing) {
    res.status(409).json({ message: "Email already registered" })
    return
  }

  const passwordHash = await bcrypt.hash(password as string, 10)
  const user = await User.create({
    email,
    passwordHash,
    name,
    role,
  } as any)

  res.status(201).json({
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  })
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const id = req.params["id"]
  const { email, name, role } = req.body as Record<string, unknown>

  const updates: Record<string, unknown> = {}
  if (email) updates["email"] = email
  if (name) updates["name"] = name
  if (role) updates["role"] = role

  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true } as any).select("-passwordHash")
  if (!user) {
    res.status(404).json({ message: "User not found" })
    return
  }
  res.json(user)
}
