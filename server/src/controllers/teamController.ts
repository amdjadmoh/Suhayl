import type { Request, Response } from "express"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { Types } from "mongoose"
import { agencyScope } from "../middleware/auth"
import { User } from "../models/User"
import { Student } from "../models/Student"
import { Notification } from "../models/Notification"

/*
 * An agency is its owner's account plus any counsellors the owner invites.
 * Everyone sees the agency's students; only the owner manages the team.
 * Email isn't always set up, so an invite is a link the owner sends on WhatsApp.
 */

const ANY_CASE = { locale: "en", strength: 2 }

function newInviteToken(): string {
  return crypto.randomBytes(24).toString("base64url")
}

function requireOwner(req: Request, res: Response): boolean {
  if (!req.user?.isAgencyOwner) {
    res.status(403).json({ message: "Only the agency owner can manage the team" })
    return false
  }
  return true
}

/** GET /api/agency/team — the owner and every counsellor, with how many students each looks after */
export async function listTeam(req: Request, res: Response): Promise<void> {
  const agencyId = new Types.ObjectId(agencyScope(req))
  const [owner, members, counts] = await Promise.all([
    User.findById(agencyId).select("name email createdAt"),
    User.find({ agencyOwnerId: agencyId }).select("+inviteToken name email invitedAt createdAt").sort({ name: 1 }),
    Student.aggregate<{ _id: Types.ObjectId | null; n: number }>([
      { $match: { agencyId } },
      { $group: { _id: "$counsellorId", n: { $sum: 1 } } },
    ]),
  ])
  const studentsOf = (id: unknown): number => counts.find((c) => String(c._id) === String(id))?.n ?? 0
  res.json({
    members: [
      ...(owner ? [{ _id: owner._id, name: owner.name, email: owner.email, isOwner: true, joined: true, students: studentsOf(owner._id) }] : []),
      ...members.map((m) => ({
        _id: m._id,
        name: m.name,
        email: m.email,
        isOwner: false,
        joined: !m.inviteToken,
        invitedAt: m.invitedAt,
        students: studentsOf(m._id),
      })),
    ],
    unassigned: counts.find((c) => c._id === null || c._id === undefined)?.n ?? 0,
  })
}

/** POST /api/agency/team — body { name, email }; returns the invite code for the join link */
export async function inviteMember(req: Request, res: Response): Promise<void> {
  if (!requireOwner(req, res)) return
  const { name, email } = req.body as { name: string; email: string }
  if (await User.findOne({ email }).collation(ANY_CASE)) {
    res.status(409).json({ message: "Someone already has an account with that email" })
    return
  }
  const inviteToken = newInviteToken()
  const member = await User.create({
    name,
    email,
    role: "agency",
    agencyOwnerId: new Types.ObjectId(agencyScope(req)),
    inviteToken,
    invitedAt: new Date(),
  })
  res.status(201).json({ _id: member._id, name: member.name, email: member.email, inviteToken })
}

/** POST /api/agency/team/:id/invite — a fresh join link; also how a counsellor resets a forgotten password */
export async function renewInvite(req: Request, res: Response): Promise<void> {
  if (!requireOwner(req, res)) return
  const member = await User.findOne({ _id: String(req.params["id"]), agencyOwnerId: agencyScope(req) })
  if (!member) {
    res.status(404).json({ message: "Team member not found" })
    return
  }
  const inviteToken = newInviteToken()
  member.inviteToken = inviteToken
  member.invitedAt = new Date()
  await member.save()
  res.json({ _id: member._id, inviteToken })
}

/** DELETE /api/agency/team/:id — their students go back to unassigned */
export async function removeMember(req: Request, res: Response): Promise<void> {
  if (!requireOwner(req, res)) return
  const member = await User.findOne({ _id: String(req.params["id"]), agencyOwnerId: agencyScope(req) })
  if (!member) {
    res.status(404).json({ message: "Team member not found" })
    return
  }
  const released = await Student.updateMany({ agencyId: agencyScope(req), counsellorId: member._id }, { $unset: { counsellorId: "" } })
  await Notification.deleteMany({ userId: member._id })
  await User.findByIdAndDelete(member._id)
  res.json({ message: "Removed from the team", studentsUnassigned: released.modifiedCount })
}

/** GET /api/auth/invite/:token — who the invite is for, so the join page can greet them */
export async function readInvite(req: Request, res: Response): Promise<void> {
  const member = await User.findOne({ inviteToken: String(req.params["token"]) }).select("name email agencyOwnerId")
  const owner = member?.agencyOwnerId ? await User.findById(member.agencyOwnerId).select("name") : null
  if (!member || !owner) {
    res.status(404).json({ message: "This invite has been used or replaced. Ask your agency for a new link." })
    return
  }
  res.json({ name: member.name, email: member.email, agencyName: owner.name })
}

/** POST /api/auth/invite/:token — body { name, password }; signs the counsellor in */
export async function acceptInvite(req: Request, res: Response): Promise<void> {
  const member = await User.findOne({ inviteToken: String(req.params["token"]) }).select("+inviteToken")
  if (!member) {
    res.status(404).json({ message: "This invite has been used or replaced. Ask your agency for a new link." })
    return
  }
  const { name, password } = req.body as { name: string; password: string }
  member.name = name
  member.passwordHash = await bcrypt.hash(password, 10)
  member.set("inviteToken", undefined)
  await member.save()
  const token = jwt.sign({ _id: member._id.toString(), role: member.role }, process.env["JWT_SECRET"]!, { expiresIn: "7d" })
  res.json({
    token,
    user: { _id: member._id, email: member.email, name: member.name, role: member.role, agencyRole: "counsellor", agencyOwnerId: member.agencyOwnerId },
  })
}

/** Whether `counsellorId` is the owner or a counsellor of this agency. */
export async function isTeamMember(agencyId: string, counsellorId: string): Promise<boolean> {
  if (counsellorId === agencyId) return true
  return !!(await User.exists({ _id: counsellorId, agencyOwnerId: agencyId }))
}

/** POST /api/students/bulk/assign — body { studentIds, counsellorId | null } */
export async function bulkAssign(req: Request, res: Response): Promise<void> {
  const agencyId = agencyScope(req)
  const { studentIds, counsellorId } = req.body as { studentIds: string[]; counsellorId: string | null }
  if (counsellorId && !(await isTeamMember(agencyId, counsellorId))) {
    res.status(400).json({ message: "That person isn't on your team" })
    return
  }
  const result = await Student.updateMany(
    { _id: { $in: studentIds }, agencyId },
    counsellorId ? { $set: { counsellorId: new Types.ObjectId(counsellorId) } } : { $unset: { counsellorId: "" } },
  )
  res.json({ updated: result.modifiedCount })
}
