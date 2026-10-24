import type { Request } from "express"
import { Types } from "mongoose"
import { Activity } from "../models/Activity"
import { User } from "../models/User"

/*
 * Records what happened on an agency's students, so a team can see who did what.
 * Each line is an English template with {placeholders} plus its values; the client
 * translates the template, so every reader sees the history in their own language.
 * Never throws: a missing log line must not break the action itself.
 */

type Vars = Record<string, string | number>

function fill(template: string, vars: Vars = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m))
}

function stringify(vars: Vars = {}): Record<string, string> {
  return Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, String(v)]))
}

/** Something an agency member did. Only agency users are recorded. */
export async function logActivity(
  req: Request,
  studentId: Types.ObjectId | string | undefined | null,
  template: string,
  vars?: Vars,
): Promise<void> {
  if (req.user?.role !== "agency" || !req.user.agencyId) return
  try {
    const actor = await User.findById(req.user._id).select("name")
    await Activity.create({
      agencyId: new Types.ObjectId(req.user.agencyId),
      ...(studentId ? { studentId: new Types.ObjectId(String(studentId)) } : {}),
      actorId: new Types.ObjectId(req.user._id),
      actorName: actor?.name ?? "Someone",
      action: fill(template, vars),
      template,
      vars: stringify(vars),
    })
  } catch (err: unknown) {
    console.error("Couldn't record activity:", err instanceof Error ? err.message : err)
  }
}

/** Something the family did through their private link. */
export async function logFamilyActivity(agencyId: Types.ObjectId, studentId: Types.ObjectId, template: string, vars?: Vars): Promise<void> {
  try {
    await Activity.create({ agencyId, studentId, actorName: "Family", action: fill(template, vars), template, vars: stringify(vars) })
  } catch (err: unknown) {
    console.error("Couldn't record activity:", err instanceof Error ? err.message : err)
  }
}
