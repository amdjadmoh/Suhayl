import papaparse from "papaparse"
import type { Types } from "mongoose"

interface PopulatedProgram {
  _id: Types.ObjectId
  name: string
  universityId: PopulatedUniversity | Types.ObjectId
  [key: string]: unknown
}

interface PopulatedUniversity {
  _id: Types.ObjectId
  name: string
  country: string
  city: string
  [key: string]: unknown
}

interface CsvRow {
  id: string
  programName: string
  universityName: string
  country: string
  city: string
  studentName: string
  studentEmail: string
  status: string
  deadline: string
  createdAt: string
  notes: string
}

/**
 * applicationsToCsv — converts an array of populated application objects
 * (returned by Application.find().populate(POPULATE_PROGRAM)) into a CSV string.
 *
 * Columns (in order): id, programName, universityName, country, city,
 * studentName, studentEmail, status, deadline, createdAt, notes.
 */
export function applicationsToCsv(applications: unknown[]): string {
  const rows: CsvRow[] = applications.map((app) => {
    const a = app as Record<string, unknown>

    const program =
      a["programId"] && typeof a["programId"] === "object"
        ? (a["programId"] as unknown as PopulatedProgram)
        : null
    const university =
      program && typeof program.universityId === "object"
        ? (program.universityId as unknown as PopulatedUniversity)
        : null

    const deadlineVal = a["applicationDeadline"]
    const deadline: string = deadlineVal
      ? (new Date(deadlineVal as string | Date).toISOString().split("T")[0] ?? "")
      : ""

    const createdAtVal = a["createdAt"]
    const createdAt: string = createdAtVal
      ? new Date(createdAtVal as string | Date).toISOString()
      : ""

    return {
      id: String(a["_id"] ?? ""),
      programName: program?.name ?? "",
      universityName: university?.name ?? "",
      country: university?.country ?? "",
      city: university?.city ?? "",
      studentName: String(a["studentName"] ?? ""),
      studentEmail: String(a["studentEmail"] ?? ""),
      status: String(a["applicationStatus"] ?? ""),
      deadline,
      createdAt,
      notes: String(a["notes"] ?? ""),
    }
  })

  return papaparse.unparse(rows, { header: true })
}
