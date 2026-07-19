import type { Request, Response } from "express"
import "../middleware/auth"
import multer from "multer"
import papaparse from "papaparse"
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

// ── Multer config for CSV file upload ──────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
})

interface ImportRow {
  name?: string
  email?: string
  phone?: string
  notes?: string
}

interface ImportResult {
  imported: number
  skipped: number
  errors: { row: number; message: string }[]
}

export { upload }

export async function importStudents(req: Request, res: Response): Promise<void> {
  const agencyId = req.user!._id
  const result: ImportResult = { imported: 0, skipped: 0, errors: [] }

  let rows: ImportRow[] = []

  // Check if CSV file was uploaded via multipart/form-data
  const file = req.file
  if (file && file.buffer) {
    const csvString = file.buffer.toString("utf-8")
    const parsed = papaparse.parse<ImportRow>(csvString, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase(),
    })

    if (parsed.errors.length > 0) {
      for (const err of parsed.errors) {
        result.errors.push({ row: (err.row ?? 0) + 1, message: err.message })
      }
    }

    rows = parsed.data
  } else {
    // Fallback: JSON body with { students: [...] }
    const body = req.body as { students?: ImportRow[] }
    rows = body["students"] ?? []
  }

  if (rows.length === 0) {
    res.status(400).json({
      message: "No students provided. Send a CSV file (field: file) or JSON body with { students: [...] }",
    })
    return
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    const name = row["name"]?.trim()
    const email = row["email"]?.trim().toLowerCase()

    if (!name || !email) {
      result.errors.push({ row: i + 1, message: "Missing required fields: name, email" })
      continue
    }

    // Check for duplicate email within this agency
    const existing = await Student.findOne({ email, agencyId })
    if (existing) {
      result.skipped++
      result.errors.push({ row: i + 1, message: `Duplicate email: ${email}` })
      continue
    }

    try {
      const studentPayload: Record<string, unknown> = {
        name,
        email,
        agencyId,
      }
      const phoneVal = row["phone"]?.trim()
      if (phoneVal) studentPayload["phone"] = phoneVal
      const notesVal = row["notes"]?.trim()
      if (notesVal) studentPayload["notes"] = notesVal

      await Student.create(studentPayload)
      result.imported++
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err)
      result.errors.push({ row: i + 1, message: errMsg })
    }
  }

  res.json(result)
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
