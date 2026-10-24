import type { Request, Response } from "express"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { hashToken, signSession } from "../services/tokens"
import { Types } from "mongoose"
import { agencyScope } from "../middleware/auth"
import { User, type IUserDocument } from "../models/User"
import { PasswordResetToken } from "../models/PasswordResetToken"
import { Student } from "../models/Student"
import { Notification } from "../models/Notification"
import { isEmailEnabled, sendEmail } from "../services/email"
import { simpleEmail } from "../services/emailTemplates"
import { appUrl } from "../config"
import { logActivity } from "../services/activity"

/*
 * An agency is its owner's account plus any counsellors the owner invites.
 * Everyone sees the agency's students; only the owner manages the team.
 * Email isn't always set up, so an invite is a link the owner sends on WhatsApp.
 */

const ANY_CASE = { locale: "en", strength: 2 }

function newInviteToken(): string {
  return crypto.randomBytes(24).toString("base64url")
}

const INVITE_DAYS = Number(process.env["INVITE_LINK_DAYS"] ?? 7)
const inviteExpiry = (): Date => new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000)
const RESET_LINK_HOURS = 24

/** A pending invite for this code, or why there isn't one. */
async function pendingInvite(token: string): Promise<{ member: IUserDocument } | { status: 404 | 410 }> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return { status: 404 }
  const member = await User.findOne({ inviteToken: token }).select("+inviteToken +passwordHash +googleId")
  if (!member || !member.agencyOwnerId) return { status: 404 }
  // Someone who already signs in can't be "invited" into their own account again
  if (member.passwordHash || member.googleId) {
    member.set("inviteToken", undefined)
    member.set("inviteExpiresAt", undefined)
    await member.save()
    return { status: 404 }
  }
  const expires = member.inviteExpiresAt?.getTime() ?? (member.invitedAt?.getTime() ?? 0) + INVITE_DAYS * 24 * 60 * 60 * 1000
  if (expires < Date.now()) return { status: 410 }
  return { member }
}

const INVITE_GONE: Record<404 | 410, string> = {
  404: "This invite has been used or replaced. Ask your agency for a new link.",
  410: "This invite has expired. Ask your agency for a new link.",
}

/** Emails the join link when email is set up; the owner always gets the link to share too. */
async function emailInvite(to: string, name: string, agencyName: string, inviteToken: string): Promise<boolean> {
  if (!isEmailEnabled()) return false
  const url = `${appUrl()}/join/${inviteToken}`
  const { html, text } = simpleEmail({
    heading: `Join ${agencyName} on Suhayl`,
    lines: [`Hi ${name},`, `${agencyName} invited you to help manage their students on Suhayl: applications, deadlines and documents in one place.`],
    buttonText: "Join the team",
    url,
    footer: `This link works once and expires in ${INVITE_DAYS} days. If you weren't expecting it, you can ignore this email.`,
  })
  return (await sendEmail({ to, subject: `${agencyName} invited you to Suhayl`, html, text })).ok
}

/** Emails a counsellor their password reset link when email is set up. */
async function emailReset(to: string, name: string, agencyName: string, url: string): Promise<boolean> {
  if (!isEmailEnabled()) return false
  const { html, text } = simpleEmail({
    heading: "Choose a new password",
    lines: [`Hi ${name},`, `${agencyName} sent you a link to choose a new password for Suhayl.`],
    buttonText: "Choose a password",
    url,
    footer: `This link works once and expires in ${RESET_LINK_HOURS} hours. If you didn't ask for it, tell your agency.`,
  })
  return (await sendEmail({ to, subject: "Your Suhayl password", html, text })).ok
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
    inviteExpiresAt: inviteExpiry(),
  })
  const owner = await User.findById(agencyScope(req)).select("name")
  const emailSent = await emailInvite(member.email, member.name, owner?.name ?? "Your agency", inviteToken)
  await logActivity(req, null, "Invited {name} to the team", { name: member.name })
  res.status(201).json({ _id: member._id, name: member.name, email: member.email, inviteToken, emailSent })
}

/** POST /api/agency/team/:id/invite — a fresh join link, for someone who hasn't joined yet */
export async function renewInvite(req: Request, res: Response): Promise<void> {
  if (!requireOwner(req, res)) return
  const member = await User.findOne({ _id: String(req.params["id"]), agencyOwnerId: agencyScope(req) }).select("+passwordHash +googleId")
  if (!member) {
    res.status(404).json({ message: "Team member not found" })
    return
  }
  // An invite sets a password with no questions asked, so it is only for people who have none
  if (member.passwordHash || member.googleId) {
    res.status(409).json({ message: "They have already joined. Send them a password reset link instead." })
    return
  }
  const inviteToken = newInviteToken()
  member.inviteToken = inviteToken
  member.invitedAt = new Date()
  member.inviteExpiresAt = inviteExpiry()
  await member.save()
  const owner = await User.findById(agencyScope(req)).select("name")
  const emailSent = await emailInvite(member.email, member.name, owner?.name ?? "Your agency", inviteToken)
  res.json({ _id: member._id, inviteToken, emailSent })
}

/**
 * POST /api/agency/team/:id/password-reset — for a counsellor who has joined and forgot
 * their password. A normal single-use reset link (stored hashed, valid 24 hours); using
 * it ends every session they have open. The owner gets the link to pass on, since email
 * isn't always set up.
 */
export async function resetMemberPassword(req: Request, res: Response): Promise<void> {
  if (!requireOwner(req, res)) return
  const member = await User.findOne({ _id: String(req.params["id"]), agencyOwnerId: agencyScope(req) }).select("+passwordHash +googleId")
  if (!member) {
    res.status(404).json({ message: "Team member not found" })
    return
  }
  if (!member.passwordHash && !member.googleId) {
    res.status(409).json({ message: "They haven't joined yet. Send them a new invite link instead." })
    return
  }
  await PasswordResetToken.deleteMany({ userId: member._id as never })
  const raw = crypto.randomBytes(32).toString("hex")
  await PasswordResetToken.create({ userId: member._id as never, token: hashToken(raw), expiresAt: new Date(Date.now() + RESET_LINK_HOURS * 60 * 60 * 1000) })
  const owner = await User.findById(agencyScope(req)).select("name")
  const resetUrl = `${appUrl()}/reset-password?token=${raw}`
  const emailSent = await emailReset(member.email, member.name, owner?.name ?? "Your agency", resetUrl)
  await logActivity(req, null, "Sent {name} a password reset link", { name: member.name })
  res.json({ _id: member._id, resetUrl, emailSent })
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
  // Their sessions end with the account: authenticate finds no user for the token
  await User.findByIdAndDelete(member._id)
  await logActivity(req, null, "Removed {name} from the team", { name: member.name })
  res.json({ message: "Removed from the team", studentsUnassigned: released.modifiedCount })
}

/** GET /api/auth/invite/:token — who the invite is for, so the join page can greet them */
export async function readInvite(req: Request, res: Response): Promise<void> {
  const found = await pendingInvite(String(req.params["token"]))
  if (!("member" in found)) {
    res.status(found.status).json({ message: INVITE_GONE[found.status] })
    return
  }
  const owner = await User.findById(found.member.agencyOwnerId).select("name")
  if (!owner) {
    res.status(404).json({ message: INVITE_GONE[404] })
    return
  }
  res.json({ name: found.member.name, email: found.member.email, agencyName: owner.name })
}

/** POST /api/auth/invite/:token — body { name, password }; signs the counsellor in */
export async function acceptInvite(req: Request, res: Response): Promise<void> {
  const found = await pendingInvite(String(req.params["token"]))
  if (!("member" in found)) {
    res.status(found.status).json({ message: INVITE_GONE[found.status] })
    return
  }
  const { member } = found
  const { name, password } = req.body as { name: string; password: string }
  member.name = name
  member.passwordHash = await bcrypt.hash(password, 10)
  member.acceptedTermsAt = new Date()
  member.set("inviteToken", undefined)
  member.set("inviteExpiresAt", undefined)
  await member.save()
  const token = signSession(member)
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
  const to = counsellorId ? await User.findById(counsellorId).select("name") : null
  for (const id of studentIds) await logActivity(req, id, to ? "Gave the file to {name}" : "Removed the counsellor", to ? { name: to.name } : {})
  res.json({ updated: result.modifiedCount })
}
