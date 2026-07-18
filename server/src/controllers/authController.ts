import type { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User, type IUserDocument } from "../models/User"

const JWT_SECRET: string = process.env["JWT_SECRET"]!

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
  if (!user) {
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
