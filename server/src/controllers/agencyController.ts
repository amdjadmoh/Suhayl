import type { Request, Response } from "express"
import "../middleware/auth"
import { Student } from "../models/Student"
import { University } from "../models/University"
import { Application } from "../models/Application"
import { applicationsToCsv } from "../services/csv"

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

const POPULATE_PROGRAM = {
  path: "programId",
  populate: { path: "universityId", select: "name country city ranking" },
}

export async function exportApplicationsCsv(
  req: Request,
  res: Response,
): Promise<void> {
  const user = req.user!

  let filter: Record<string, unknown> = {}
  if (user.role === "agency") {
    filter = { agencyId: user._id }
  }
  // admin sees all

  const applications = await Application.find(filter).populate(POPULATE_PROGRAM)

  const csv = applicationsToCsv(applications)

  const dateStr = new Date().toISOString().split("T")[0] ?? ""
  res.setHeader("Content-Type", "text/csv; charset=utf-8")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="agency-applications-${dateStr}.csv"`,
  )
  res.send(csv)
}
