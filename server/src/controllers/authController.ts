import type { Request, Response } from "express"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { OAuth2Client } from "google-auth-library"
import { revokeSessions } from "../middleware/auth"
import { hashToken, signSession } from "../services/tokens"
import { User, type IUserDocument } from "../models/User"
import { Application } from "../models/Application"
import { PasswordResetToken } from "../models/PasswordResetToken"
import { sendEmail } from "../services/email"
import { deleteUserData } from "../services/accounts"
import { appUrl } from "../config"
import { renderForgotPassword } from "../templates/email/render"

const GOOGLE_CLIENT_ID: string = process.env["GOOGLE_CLIENT_ID"] ?? ""
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

function signToken(user: IUserDocument): string {
  return signSession(user)
}

// Emails match regardless of case, including accounts saved before they were lowercased
const ANY_CASE = { locale: "en", strength: 2 }

function sanitizeUser(user: IUserDocument) {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    ...(user.role === "agency"
      ? { agencyRole: user.agencyOwnerId ? "counsellor" : "owner", agencyOwnerId: user.agencyOwnerId }
      : {}),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

/**
 * POST /api/auth/register
 * Only allows student and agency registration.
 * Body is pre-validated by validate(registerSchema, "body") middleware.
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, name, role, acceptTerms } = req.body as {
    email: string
    password: string
    name: string
    role: "student" | "agency"
    acceptTerms?: true
  }

  const existing = await User.findOne({ email }).collation(ANY_CASE)
  if (existing) {
    res.status(409).json({ message: "Email already registered" })
    return
  }

  const salt = await bcrypt.genSalt(10)
  const passwordHashValue = await bcrypt.hash(password, salt)

  const user = await User.create({ email, passwordHash: passwordHashValue, name, role, ...(acceptTerms ? { acceptedTermsAt: new Date() } : {}) })

  const token = signToken(user)
  res.status(201).json({ token, user: sanitizeUser(user) })
}

/**
 * POST /api/auth/login
 * Body is pre-validated by validate(loginSchema, "body") middleware.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as {
    email: string
    password: string
  }

  const user = await User.findOne({ email }).collation(ANY_CASE).select("+passwordHash")
  if (!user || !user.passwordHash) {
    res.status(401).json({ message: "Invalid email or password" })
    return
  }

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) {
    res.status(401).json({ message: "Invalid email or password" })
    return
  }

  const token = signToken(user)
  res.json({ token, user: sanitizeUser(user) })
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's info (fresh from DB, no password).
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" })
    return
  }

  const user = await User.findById(req.user._id).select("+passwordHash")
  if (!user) {
    res.status(404).json({ message: "User not found" })
    return
  }

  // hasPassword tells Google-only accounts apart, so settings can offer "set a password"
  const agency = user.agencyOwnerId ? await User.findById(user.agencyOwnerId).select("name") : null
  res.json({ user: { ...sanitizeUser(user), hasPassword: !!user.passwordHash, ...(agency ? { agencyName: agency.name } : {}) } })
}

// GET /api/auth/preferences — returns the user's preferences
export async function getPreferences(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ message: "Authentication required" }); return }
  const user = await User.findById(req.user._id)
  if (!user) { res.status(404).json({ message: "User not found" }); return }
  res.json({
    preferredMonthlyBudget: user.preferredMonthlyBudget,
    gpa: user.gpa,
    ieltsScore: user.ieltsScore,
    preferredCountries: user.preferredCountries,
    preferredCurrency: user.preferredCurrency,
  })
}

// PUT /api/auth/preferences — updates the user's preferences
export async function updatePreferences(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ message: "Authentication required" }); return }
  // Fields left out stay as they are; null clears one
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, ""> = {}
  for (const key of ["preferredMonthlyBudget", "gpa", "ieltsScore", "preferredCountries", "preferredCurrency"]) {
    if (!(key in req.body)) continue
    if (req.body[key] === null) $unset[key] = ""
    else $set[key] = req.body[key]
  }
  const user = await User.findByIdAndUpdate(req.user._id, { $set, $unset }, { new: true })
  if (!user) { res.status(404).json({ message: "User not found" }); return }
  res.json({
    preferredMonthlyBudget: user.preferredMonthlyBudget,
    gpa: user.gpa,
    ieltsScore: user.ieltsScore,
    preferredCountries: user.preferredCountries,
    preferredCurrency: user.preferredCurrency,
  })
}

/**
 * POST /api/auth/google
 * Verifies a Google ID token (from Google Identity Services).
 * Finds or creates the user (role defaults to "student").
 * Body: { credential: string }
 */
export async function googleAuth(req: Request, res: Response): Promise<void> {
  if (!GOOGLE_CLIENT_ID) {
    res.status(501).json({ message: "Google OAuth not configured on this server" })
    return
  }

  const { credential } = req.body as { credential?: string }
  if (!credential) {
    res.status(400).json({ message: "credential is required" })
    return
  }

  let payload: { sub: string; email: string; name: string } | undefined
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    })
    const p = ticket.getPayload()
    // Google must vouch for the address itself, or anyone could claim someone else's email
    if (!p?.sub || !p.email || p.email_verified !== true) throw new Error("Incomplete payload")
    payload = { sub: p.sub, email: p.email.toLowerCase(), name: (p.name ?? p.email.split("@")[0] ?? "").slice(0, 120) }
  } catch {
    res.status(401).json({ message: "Invalid Google credential" })
    return
  }

  // Find by googleId first, then fall back to email
  let user = await User.findOne({ googleId: payload.sub }).select("+googleId")
  if (!user) {
    const existing = await User.findOne({ email: payload.email }).collation(ANY_CASE).select("+googleId +passwordHash +inviteToken")
    if (existing?.passwordHash || existing?.googleId) {
      // A verified Google address isn't proof of owning an account that signs in another way
      res.status(409).json({ message: "An account with this email already exists. Sign in with your password instead." })
      return
    }
    if (existing) {
      // An invited counsellor who never set a password: the verified address is theirs, and the invite link is spent
      existing.googleId = payload.sub
      existing.set("inviteToken", undefined)
      existing.set("inviteExpiresAt", undefined)
      existing.acceptedTermsAt ??= new Date()
      await existing.save()
      user = existing
    } else {
      // New user — create with student role
      user = await User.create({
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
        role: "student",
      })
    }
  }

  const token = signToken(user)
  res.json({ token, user: sanitizeUser(user) })
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Always returns 200 to avoid user enumeration.
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email: string }

  const user = await User.findOne({ email }).collation(ANY_CASE)
  if (!user) {
    res.json({ message: "If that email is registered, a reset link has been sent." })
    return
  }

  // Invalidate any existing tokens for this user
  await PasswordResetToken.deleteMany({ userId: user._id as any })

  const rawToken = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await PasswordResetToken.create({ userId: user._id as any, expiresAt, token: hashToken(rawToken) })

  const resetUrl = `${appUrl()}/reset-password?token=${rawToken}`

  const { html, text } = await renderForgotPassword({ name: user.name, resetUrl })
  await sendEmail({ to: user.email, subject: "Reset your Suhayl password", html, text })

  res.json({ message: "If that email is registered, a reset link has been sent." })
}

/**
 * POST /api/auth/reset-password
 * Body: { token, password }
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body as { token: string; password: string }

  // Single use: the record is taken in the same step it is read, so a link can't be replayed
  const record = await PasswordResetToken.findOneAndDelete({ token: hashToken(token) })
  if (!record || record.expiresAt < new Date()) {
    res.status(400).json({ message: "Reset link is invalid or has expired." })
    return
  }

  const user = await User.findById(record.userId)
  if (!user) {
    res.status(400).json({ message: "User not found." })
    return
  }

  user.passwordHash = await bcrypt.hash(password, 10)
  // A pending team invite is a second way in; a reset closes it, and ends every session
  user.set("inviteToken", undefined)
  user.set("inviteExpiresAt", undefined)
  user.tokenVersion = (user.tokenVersion ?? 0) + 1
  await user.save()
  await PasswordResetToken.deleteMany({ userId: user._id as any })

  res.json({ message: "Password reset successfully. You can now log in." })
}

/**
 * PUT /api/auth/profile
 * Body: { name }
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { name } = req.body as { name: string }
  const user = await User.findByIdAndUpdate(req.user!._id, { $set: { name } }, { new: true })
  if (!user) {
    res.status(404).json({ message: "User not found" })
    return
  }
  // A student's own applications carry their name (recommenders see it too)
  if (user.role === "student") await Application.updateMany({ createdBy: user._id }, { $set: { studentName: name } })
  res.json({ user: sanitizeUser(user) })
}

/**
 * PUT /api/auth/password
 * Body: { currentPassword?, newPassword }. Accounts made with Google have no
 * password yet, so they can set one without the current one.
 */
export async function changePassword(req: Request, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword: string }
  const user = await User.findById(req.user!._id).select("+passwordHash")
  if (!user) {
    res.status(404).json({ message: "User not found" })
    return
  }
  if (user.passwordHash && !(currentPassword && (await bcrypt.compare(currentPassword, user.passwordHash)))) {
    res.status(400).json({ message: "Your current password isn't right" })
    return
  }
  user.passwordHash = await bcrypt.hash(newPassword, 10)
  // Every other session ends; this one carries on with the token returned here
  user.tokenVersion = (user.tokenVersion ?? 0) + 1
  await user.save()
  await PasswordResetToken.deleteMany({ userId: user._id as any })
  res.json({ message: "Password updated", token: signToken(user) })
}

/**
 * DELETE /api/auth/me
 * Body: { password? , confirmEmail? }. Removes the account and everything in it.
 * Admin accounts are removed by another admin instead.
 */
export async function deleteAccount(req: Request, res: Response): Promise<void> {
  const { password, confirmEmail } = req.body as { password?: string; confirmEmail?: string }
  const user = await User.findById(req.user!._id).select("+passwordHash")
  if (!user) {
    res.status(404).json({ message: "User not found" })
    return
  }
  if (user.role === "admin") {
    res.status(400).json({ message: "Ask another admin to remove an admin account" })
    return
  }
  const confirmed = user.passwordHash
    ? !!password && (await bcrypt.compare(password, user.passwordHash))
    : confirmEmail?.trim().toLowerCase() === user.email.toLowerCase()
  if (!confirmed) {
    res.status(400).json({ message: user.passwordHash ? "That password isn't right" : "Type your email to confirm" })
    return
  }
  await revokeSessions(user._id)
  await deleteUserData(String(user._id))
  await User.findByIdAndDelete(user._id)
  res.json({ message: "Account deleted" })
}
