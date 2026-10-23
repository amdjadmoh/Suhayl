import type { Request } from "express"
import { Types } from "mongoose"
import { Activity } from "../models/Activity"
import { User } from "../models/User"

/*
 * Records what happened on an agency's students, so a team can see who did what.
 * Never throws: a missing log line must not break the action itself.
 */

/** Something an agency member did. Only agency users are recorded. */
export async function logActivity(req: Request, studentId: Types.ObjectId | string | undefined | null, action: string): Promise<void> {
  if (req.user?.role !== "agency" || !req.user.agencyId) return
  try {
    const actor = await User.findById(req.user._id).select("name")
    await Activity.create({
      agencyId: new Types.ObjectId(req.user.agencyId),
      ...(studentId ? { studentId: new Types.ObjectId(String(studentId)) } : {}),
      actorId: new Types.ObjectId(req.user._id),
      actorName: actor?.name ?? "Someone",
      action,
    })
  } catch (err: unknown) {
    console.error("Couldn't record activity:", err instanceof Error ? err.message : err)
  }
}

/** Something the family did through their private link. */
export async function logFamilyActivity(agencyId: Types.ObjectId, studentId: Types.ObjectId, action: string): Promise<void> {
  try {
    await Activity.create({ agencyId, studentId, actorName: "Family", action })
  } catch (err: unknown) {
    console.error("Couldn't record activity:", err instanceof Error ? err.message : err)
  }
}
