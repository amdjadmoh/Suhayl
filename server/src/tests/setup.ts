import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import type { Request, Response, NextFunction } from "express"
import express from "express"
import helmet from "helmet"
import cors from "cors"
import rateLimit from "express-rate-limit"
import { ZodError } from "zod"
import bcrypt from "bcryptjs"

// ── Mongoose helpers ──────────────────────────────────────────────────────────
// Vitest uses a separate module graph per test file, but mongoose stores models
// globally in the process. We must clear them before each file to avoid
// "Cannot overwrite model" errors.

function clearMongooseModels(): void {
  const names = Object.keys(mongoose.models)
  for (const name of names) {
    delete mongoose.models[name]
  }
}

let _mongoServer: MongoMemoryServer | null = null

export async function startMemoryServer(): Promise<MongoMemoryServer> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  clearMongooseModels()
  _mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(_mongoServer.getUri())
  return _mongoServer
}

export async function stopMemoryServer(): Promise<void> {
  await mongoose.disconnect()
  if (_mongoServer) {
    await _mongoServer.stop()
    _mongoServer = null
  }
}

// ── Seed data ─────────────────────────────────────────────────────────────────

export interface TestSeed {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export async function seedTestData(): Promise<TestSeed> {
  // Dynamic imports to register models in the fresh global state.
  // Note: .js extensions required for ECMAScript dynamic imports with moduleResolution node16.
  const { User } = await import("../models/User.js")
  const { Country } = await import("../models/Country.js")
  const { City } = await import("../models/City.js")
  const { University } = await import("../models/University.js")
  const { Program } = await import("../models/Program.js")

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash("password123", salt)

  const user = await User.create({
    email: "test@example.com",
    passwordHash: hash,
    name: "Test User",
    role: "student",
  })

  await Country.create({
    name: "Test Country",
    currency: "USD",
    livingCostEstimate: 1000,
    visaBankAccountAmount: 10000,
    visaBankAccountLocked: false,
    pros: [],
    cons: [],
    requiredDocuments: [],
  })

  await City.create({
    name: "Test City",
    country: "Test Country",
    averageRentSingle: 500,
    averageRentShared: 300,
    monthlyLivingCost: 800,
    qualityOfLifeScore: 70,
    safetyScore: 80,
    publicTransportScore: 75,
    studentFriendliness: 80,
    language: "English",
    englishFriendliness: 90,
    climate: "Temperate",
    pros: [],
    cons: [],
  })

  const university = await University.create({
    name: "Test University",
    country: "Test Country",
    city: "Test City",
  })

  const program = await Program.create({
    name: "Computer Science",
    universityId: university._id,
    degreeLevel: "Master",
    tuitionFee: 10000,
    testRequirements: [
      { name: "GPA", minimumScore: 3.0 },
      { name: "IELTS", minimumScore: 6.5 },
    ],
    isOfficial: true,
  })

  return {
    user: user.toObject(),
    university: university.toObject(),
    program: program.toObject(),
  }
}

// ── Express app factory (async — routes are imported dynamically) ─────────────

export async function createTestApp(): Promise<express.Application> {
  const app = express()
  app.use(helmet())

  const corsOrigins = process.env["CORS_ORIGINS"]
    ? process.env["CORS_ORIGINS"].split(",").map((s) => s.trim())
    : ["http://localhost:5173"]
  app.use(cors({ origin: corsOrigins }))
  app.use(express.json())

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { message: "Too many requests, please try again later." },
  })
  app.use("/api/auth/login", authLimiter)
  app.use("/api/auth/register", authLimiter)

  // Patch: Express 5 defines req.query as a getter-only property on a prototype
  // 2 levels up from the instance. The validate middleware tries to assign
  // req[target] = result.data which throws. This middleware shadows the
  // prototype getter with a writable instance property.
  app.use((req: Request, _res: Response, next: NextFunction): void => {
    try {
      const current = req.query
      Object.defineProperty(req, "query", {
        value: current,
        writable: true,
        configurable: true,
      })
    } catch {
      // If it fails, the validate middleware will also fail — nothing we can do
    }
    next()
  })

  // Dynamic imports — models are already registered by seedTestData()
  const { authRouter } = await import("../routes/authRoutes.js")
  const { applicationRouter } = await import("../routes/applicationRoutes.js")
  const { programRouter } = await import("../routes/programRoutes.js")

  app.use("/api/auth", authRouter)
  app.use("/api/applications", applicationRouter)
  app.use("/api/programs", programRouter)

  // Error handler (Zod + fallback)
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: err.issues.map((i) => ({
          path: i.path,
          message: i.message,
        })),
      })
      return
    }
    console.error("Test error:", err.message)
    res.status(500).json({ message: "Internal server error" })
  })

  return app
}
