import { Types } from "mongoose"
import { Program } from "../models/Program"
import { University } from "../models/University"

/*
 * Who may see a catalogue record. Programs and universities are either official
 * (everyone) or custom: private to the account that made it, and for agencies to
 * the whole agency. Admins see everything. Every catalogue read goes through here.
 */

export interface Viewer {
  _id: string
  role: string
  agencyId?: string
}

interface CatalogueRecord {
  isOfficial?: boolean | null
  createdBy?: unknown
}

/** Accounts whose custom records this viewer may see. */
function ownerIds(viewer: Viewer): string[] {
  return [...new Set([viewer._id, viewer.agencyId].filter((id): id is string => !!id))]
}

/** A query filter for the programs or universities this viewer may see. Records saved before isOfficial existed count as official. */
export function visibleFilter(viewer: Viewer | undefined): Record<string, unknown> {
  if (viewer?.role === "admin") return {}
  const official = { isOfficial: { $ne: false } }
  if (!viewer) return official
  return { $or: [official, { createdBy: { $in: ownerIds(viewer).map((id) => new Types.ObjectId(id)) } }] }
}

function canView(viewer: Viewer | undefined, record: CatalogueRecord | null | undefined): boolean {
  if (!record) return false
  if (record.isOfficial !== false) return true
  if (!viewer) return false
  if (viewer.role === "admin") return true
  const owner = record.createdBy && typeof record.createdBy === "object" && "_id" in record.createdBy
    ? String((record.createdBy as { _id: unknown })._id)
    : String(record.createdBy ?? "")
  return ownerIds(viewer).includes(owner)
}

export const canViewProgram = canView
export const canViewUniversity = canView

/** The program, if this viewer may see it; otherwise null (callers answer 404, never 403, so private records stay unconfirmed). */
export async function findVisibleProgram(viewer: Viewer | undefined, id: unknown) {
  if (!Types.ObjectId.isValid(String(id))) return null
  const program = await Program.findById(String(id))
  return canViewProgram(viewer, program) ? program : null
}

export async function findVisibleUniversity(viewer: Viewer | undefined, id: unknown) {
  if (!Types.ObjectId.isValid(String(id))) return null
  const university = await University.findById(String(id))
  return canViewUniversity(viewer, university) ? university : null
}
