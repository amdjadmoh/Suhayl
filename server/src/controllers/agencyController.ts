import type { Request, Response } from "express"
import "../middleware/auth"
import { Student } from "../models/Student"
import { University } from "../models/University"
import { Application } from "../models/Application"

export async function getMyStudents(req: Request, res: Response): Promise<void> {
  const students = await Student.find({ agencyId: req.user!._id }).sort({ name: 1 })
  res.json(students)
}

export async function getUniversities(_req: Request, res: Response): Promise<void> {
  const universities = await University.find().sort({ name: 1 })
  res.json(universities)
}

export async function getApplications(req: Request, res: Response): Promise<void> {
  const applications = await Application.find({ agencyId: req.user!._id })
    .populate({
      path: "programId",
      populate: { path: "universityId", select: "name country city ranking" },
    })
    .sort({ createdAt: -1 })
  res.json(applications)
}
