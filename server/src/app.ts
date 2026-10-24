/*
 * The Express app: security headers, CORS, rate limits, routes and the error handler.
 * Built by a function so tests run against exactly what production serves.
 */
import express, { type Request, type Response, type NextFunction } from "express"
import helmet from "helmet"
import cors from "cors"
import { ZodError } from "zod"
import path from "path"
import multer from "multer"
import { universityRouter } from "./routes/universityRoutes"
import { statsRouter } from "./routes/statsRoutes"
import { countryRouter } from "./routes/countryRoutes"
import { cityRouter } from "./routes/cityRoutes"
import { authRouter } from "./routes/authRoutes"
import { agencyRouter } from "./routes/agencyRoutes"
import { studentRouter } from "./routes/studentRoutes"
import { adminRouter } from "./routes/adminRoutes"
import { applicationRouter } from "./routes/applicationRoutes"
import { programRouter } from "./routes/programRoutes"
import favoriteRoutes from "./routes/favoriteRoutes"
import notificationRoutes from "./routes/notificationRoutes"
import { budgetRouter } from "./routes/budgetRoutes"
import { savedSearchRouter } from "./routes/savedSearchRoutes"
import { recommendationRouter } from "./routes/recommendationRoutes"
import { reviewRouter } from "./routes/reviewRoutes"
import { documentRouter } from "./routes/documentRoutes"
import { portalRouter } from "./routes/portalRoutes"
import { isProduction } from "./config"
import mongoose from "mongoose"
import { createLimiters } from "./middleware/limits"

export function createApp(): express.Express {
  const app = express()
  // Behind a host's proxy (Render, Railway, Fly, nginx) the client's real IP is in
  // X-Forwarded-For; rate limits need it, so trust the first proxy in production.
  if (isProduction || process.env["TRUST_PROXY"]) app.set("trust proxy", 1)

  // ── CORS ───────────────────────────────────────────────────────────────────
  // The env var is a comma-separated list of allowed origins (e.g. web app +
  // chrome-extension://<id> for the unpacked dev extension).
  //   Dev:   .env.example includes chrome-extension://cgahnajflkjbbbpnmennbfpojdpahfdg
  //   Prod:  Replace the dev extension ID with the Chrome Web Store ID.
  const corsOrigins = process.env["CORS_ORIGINS"]
    ? process.env["CORS_ORIGINS"].split(",").map((s) => s.trim())
    : ["http://localhost:5173"]

  // A missing CORS_ORIGINS in production is reported by checkConfig() with the other settings

  // ── Security headers (before CORS so helmet sets headers first) ─────────
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: "unsafe-none" },
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'", "https://accounts.google.com"],
          "frame-src": ["'self'", "https://accounts.google.com"],
          "connect-src": ["'self'", "https://accounts.google.com", "https://*.sentry.io", "https://*.ingest.sentry.io"],
          "img-src": ["'self'", "data:", "blob:", "https://*.googleusercontent.com", "https://accounts.google.com"],
          "style-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://fonts.googleapis.com"],
          "font-src": ["'self'", "https://fonts.gstatic.com"],
        },
      },
    })
  )
  app.use(cors({ origin: corsOrigins }))
  app.use(express.json({ limit: "1mb" }))

  // ── Rate limiting ─────────────────────────────────────────────────────────
  // Keys come from verified sessions only; see middleware/limits.ts
  const limits = createLimiters()
  app.use("/api/", limits.globalLimiter)
  app.use("/api/auth/login", limits.credentialLimiter)
  app.use("/api/auth/register", limits.credentialLimiter)
  app.use("/api/auth/google", limits.googleLimiter)
  app.use("/api/auth/forgot-password", limits.forgotPasswordLimiter, limits.forgotPasswordPerEmail)
  app.use("/api/auth/reset-password", limits.resetPasswordLimiter)
  app.use("/api/auth/invite", limits.inviteLimiter)
  app.use("/api/recommendations/public", limits.recommendationPublicLimiter)
  app.post("/api/recommendations", limits.recommendationInviteLimiter)
  app.use("/api/portal", limits.portalLimiter)

  // For uptime monitors and the host's health check
  app.get("/api/health", (_req: Request, res: Response) => {
    const dbUp = mongoose.connection.readyState === 1
    res.status(dbUp ? 200 : 503).json({ ok: dbUp, db: dbUp ? "up" : "down", uptime: Math.round(process.uptime()) })
  })

  app.use("/api/universities", universityRouter)
  app.use("/api/stats", statsRouter)
  app.use("/api/countries", countryRouter)
  app.use("/api/cities", cityRouter)
  app.use("/api/auth", authRouter)
  app.use("/api/agency", agencyRouter)
  app.use("/api/students", studentRouter)
  app.use("/api/admin", adminRouter)
  app.use("/api/applications", applicationRouter)
  app.use("/api/programs", programRouter)
  app.use("/api/favorites", favoriteRoutes)
  app.use("/api/notifications", notificationRoutes)
  app.use("/api/budget", budgetRouter)
  app.use("/api/saved-searches", savedSearchRouter)
  app.use("/api/recommendations", recommendationRouter)
  app.use("/api/reviews", reviewRouter)
  app.use("/api/documents", documentRouter)
  app.use("/api/portal", portalRouter)

  if (process.env["NODE_ENV"] === "production") {
    const clientDist = path.join(__dirname, "../../client/dist")
    app.use(express.static(clientDist))
    app.get("/{*splat}", (_req: Request, res: Response) => {
      res.sendFile(path.join(clientDist, "index.html"))
    })
  }

  app.use(
    (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
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
      // Upload limits (size, number of parts) are the sender's mistake, not a server fault
      if (err instanceof multer.MulterError) {
        res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ message: err.code === "LIMIT_FILE_SIZE" ? "That file is over 10 MB" : "That upload isn't in the expected shape" })
        return
      }
      // A malformed id in the URL is a missing record, not a server fault
      if (err.name === "CastError") {
        res.status(404).json({ message: "Not found" })
        return
      }
      if ((err as { code?: number }).code === 11000) {
        res.status(409).json({ message: "That already exists" })
        return
      }
      console.error("Unhandled error:", err.message)
      res.status(500).json({ message: "Internal server error" })
    }
  )

  return app
}
