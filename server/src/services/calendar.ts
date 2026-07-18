import ical from "ical-generator"
import type { Types } from "mongoose"
import { Application } from "../models/Application"

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

const POPULATE_PROGRAM = {
  path: "programId",
  populate: { path: "universityId", select: "name country city ranking" },
}

/**
 * buildApplicationCalendar — returns an .ics string containing VEVENT entries
 * for all applications the given user is allowed to see.
 *
 * - Students: own applications
 * - Agencies: their students' applications
 * - Admins: all applications
 *
 * Each event uses the applicationDeadline as an all-day date.
 * Applications without a deadline are skipped.
 */
export async function buildApplicationCalendar(
  userId: string,
  role: "student" | "agency" | "admin",
): Promise<string> {
  const filter: Record<string, unknown> = {}

  if (role === "student") {
    filter["createdBy"] = userId
  } else if (role === "agency") {
    filter["agencyId"] = userId
  }
  // admin sees all

  const applications = await Application.find(filter)
    .populate(POPULATE_PROGRAM)

  const cal = ical({ name: "WannaOut Deadlines" })

  for (const app of applications) {
    if (!app.applicationDeadline) continue

    const program =
      app.programId && typeof app.programId === "object"
        ? (app.programId as unknown as PopulatedProgram)
        : null
    const university =
      program && typeof program.universityId === "object"
        ? (program.universityId as unknown as PopulatedUniversity)
        : null

    const programName = program?.name ?? "Unknown Program"
    const universityName = university?.name ?? ""
    const country = university?.country ?? ""
    const city = university?.city ?? ""

    const descriptionParts: string[] = [`Program: ${programName}`]
    if (universityName) descriptionParts.push(`University: ${universityName}`)
    if (city && country) descriptionParts.push(`Location: ${city}, ${country}`)
    else if (country) descriptionParts.push(`Country: ${country}`)
    if (app.notes) descriptionParts.push(`Notes: ${app.notes}`)

    cal.createEvent({
      id: `${String(app._id)}@wannaout.app`,
      start: app.applicationDeadline,
      allDay: true,
      summary: programName,
      description: descriptionParts.join("\\n"),
      url: `/applications/${String(app._id)}`,
    })
  }

  return cal.toString()
}
