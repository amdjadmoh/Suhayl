import type { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { OAuth2Client } from "google-auth-library"
import { User, type IUserDocument } from "../models/User"
import { PasswordResetToken } from "../models/PasswordResetToken"
import { sendEmail } from "../services/email"
import { renderForgotPassword } from "../templates/email/render"

const JWT_SECRET: string = process.env["JWT_SECRET"]!
const GOOGLE_CLIENT_ID: string = process.env["GOOGLE_CLIENT_ID"] ?? ""
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

function signToken(user: IUserDocument): string {
  return jwt.sign(
    { _id: user._id.toString(), role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  )
}

function sanitizeUser(user: IUserDocument) {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
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
  const { email, password, name, role } = req.body as {
    email: string
    password: string
    name: string
    role: "student" | "agency"
  }

  const existing = await User.findOne({ email })
  if (existing) {
    res.status(409).json({ message: "Email already registered" })
    return
  }

  const salt = await bcrypt.genSalt(10)
  const passwordHashValue = await bcrypt.hash(password, salt)

  const user = await User.create({ email, passwordHash: passwordHashValue, name, role })

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

  const user = await User.findOne({ email }).select("+passwordHash")
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

  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404).json({ message: "User not found" })
    return
  }

  res.json({ user: sanitizeUser(user) })
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
  const { preferredMonthlyBudget, gpa, ieltsScore, preferredCountries, preferredCurrency } = req.body
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { preferredMonthlyBudget, gpa, ieltsScore, preferredCountries, preferredCurrency },
    { new: true, runValidators: false }
  )
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
    if (!p?.sub || !p.email || !p.name) throw new Error("Incomplete payload")
    payload = { sub: p.sub, email: p.email, name: p.name }
  } catch {
    res.status(401).json({ message: "Invalid Google credential" })
    return
  }

  // Find by googleId first, then fall back to email
  let user = await User.findOne({ googleId: payload.sub }).select("+googleId")
  if (!user) {
    user = await User.findOne({ email: payload.email }).select("+googleId")
    if (user) {
      // Link existing email account to Google
      user.googleId = payload.sub
      await user.save()
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

  const user = await User.findOne({ email })
  if (!user) {
    res.json({ message: "If that email is registered, a reset link has been sent." })
    return
  }

  // Invalidate any existing tokens for this user
  await PasswordResetToken.deleteMany({ userId: user._id as any })

  const rawToken = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await PasswordResetToken.create({ userId: user._id as any, expiresAt, token: rawToken })

  const appUrl = process.env["APP_URL"] ?? "https://suhayl.online"
  const resetUrl = `${appUrl}/reset-password?token=${rawToken}`

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

  const record = await PasswordResetToken.findOne({ token })
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
  await user.save()

  // Consume the token
  await PasswordResetToken.deleteOne({ _id: record._id })

  res.json({ message: "Password reset successfully. You can now log in." })
}
