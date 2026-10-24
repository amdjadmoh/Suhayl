import dotenv from "dotenv"
dotenv.config()
import path from "path"
import fs from "fs"
import mongoose from "mongoose"
import { bootstrapAdmin, seedIfEmpty } from "./seed"
import { Application } from "./models/Application"
import { Notification } from "./models/Notification"
import { sendEmail, isEmailEnabled } from "./services/email"
import { renderDeadlineReminder } from "./templates/email/render"
import { initSentry } from "./services/sentry"
import { checkConfig, describeMongoUri, isProduction } from "./config"
import { createApp } from "./app"

// In-memory email dedup — tracks (userId, applicationId) combos that have
// received a deadline email. Resets on server restart (acceptable for MVP).
const emailedDeadlines = new Set<string>()

const app = createApp()
const PORT = process.env["PORT"] ?? "5000"
const MONGODB_URI =
  process.env["MONGODB_URI"] ?? "mongodb://localhost:27017/wannaout"

// Persistent storage location for the in-memory MongoDB fallback. Resolved
// relative to the compiled file so the path is stable regardless of the
// process's working directory.
//   Dev  (ts-node-dev): __dirname = <repo>/server/src  -> ../.. -> <repo>
//   Prod (tsc):         __dirname = <repo>/server/dist -> ../.. -> <repo>
const DATA_DIR = path.resolve(__dirname, "..", "..", "data", "db")

async function start(): Promise<void> {
  // ── Sentry initialization ──────────────────────────────────────────────
  initSentry()

  // ── Settings fail-fast check ────────────────────────────────────────────
  checkConfig()

  let uri = MONGODB_URI

  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB at", describeMongoUri(MONGODB_URI))
  } catch (err: unknown) {
    // Production never falls back to a local copy: losing real data silently is worse than not starting
    if (isProduction) throw err
    console.log("Local MongoDB not available, starting persistent in-memory server...")
    // Dev-only dependency, so it's loaded only here and never in the production image
    const { MongoMemoryServer } = await import("mongodb-memory-server")
    // Persist the in-memory database to disk so it survives restarts.
    // mongodb-memory-server requires the directory to exist.
    fs.mkdirSync(DATA_DIR, { recursive: true })
    const memServer = await MongoMemoryServer.create({
      instance: { dbPath: DATA_DIR, dbName: "wannaout" },
    })
    uri = memServer.getUri()
    await mongoose.connect(uri)
    console.log("Connected to persistent in-memory MongoDB at", uri)
    console.log("Data stored in:", DATA_DIR)
  }

  await seedIfEmpty()
  await bootstrapAdmin()

  const server = app.listen(parseInt(PORT, 10), () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })

  // Hosts send SIGTERM on every deploy: finish in-flight requests, then close the database
  const shutdown = (signal: string): void => {
    console.log(`${signal} received, shutting down`)
    server.close(() => {
      mongoose.connection.close().finally(() => process.exit(0))
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }
  process.once("SIGTERM", () => shutdown("SIGTERM"))
  process.once("SIGINT", () => shutdown("SIGINT"))

  // Deadline checker — runs 5s after startup and every 24h
  async function checkDeadlines(): Promise<void> {
    const now = new Date()
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const apps = await Application.find({
      applicationDeadline: { $gte: now, $lte: thirtyDays },
    })
      .populate("programId", "name")
      .populate("createdBy", "email name")

    for (const app of apps) {
      if (!app.createdBy) continue
      const deadline = new Date(app.applicationDeadline!)
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const progName = (app.programId as any)?.name ?? "a program"
      const title = daysLeft <= 7
        ? `⚠️ Deadline in ${daysLeft} days!`
        : `Deadline in ${daysLeft} days`
      const message = `"${progName}" application is due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`

      // Check if notification already exists for this app deadline within 24h
      const exists = await Notification.findOne({
        userId: app.createdBy as any,
        type: "deadline",
        message,
        createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      })
      if (!exists) {
        await Notification.create({
          userId: app.createdBy as any,
          type: "deadline",
          title,
          message,
          link: `/applications/${app._id}`,
        })

        // ── Email reminder (only for urgent deadlines) ─────────
        if (daysLeft <= 7 && isEmailEnabled()) {
          const userObj = app.createdBy as { email?: string; name?: string } | null
          const userEmail = userObj?.email
          if (userEmail) {
            const dedupKey = `${String(app._id)}_${String((app.createdBy as any)?._id ?? app.createdBy)}`
            if (!emailedDeadlines.has(dedupKey)) {
              try {
                // Build props conditionally to satisfy exactOptionalPropertyTypes
                const reminderProps: Parameters<typeof renderDeadlineReminder>[0] = {
                  programName: progName,
                  daysLeft,
                  applicationUrl: `/applications/${app._id}`,
                }
                if (userObj?.name) {
                  reminderProps.studentName = userObj.name
                }
                const { html, text } = await renderDeadlineReminder(reminderProps)
                const emailMsg: { to: string; subject: string; html: string; text?: string } = {
                  to: userEmail,
                  subject: title,
                  html,
                }
                if (text) {
                  emailMsg.text = text
                }
                const result = await sendEmail(emailMsg)
                if (result.ok) {
                  emailedDeadlines.add(dedupKey)
                } else {
                  console.error(`Deadline email failed for app ${app._id}:`, result.error)
                }
              } catch (err: unknown) {
                const errMsg = err instanceof Error ? err.message : String(err)
                console.error(`Deadline email threw for app ${app._id}:`, errMsg)
              }
            }
          }
        }
      }
    }
    // ── Visa application deadlines (in-app notifications) ─────────
    const visaApps = await Application.find({
      "applicationProgress.visaDeadline": { $gte: now, $lte: thirtyDays },
    }).populate("programId", "name")

    for (const app of visaApps) {
      if (!app.createdBy) continue
      const visaDeadline = app.applicationProgress?.visaDeadline
      if (!visaDeadline) continue
      const daysLeft = Math.ceil(
        (new Date(visaDeadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      const progName = (app.programId as any)?.name ?? "a program"
      const title = daysLeft <= 7
        ? `⚠️ Visa deadline in ${daysLeft} days!`
        : `Visa deadline in ${daysLeft} days`
      const message = `"${progName}" visa application is due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`

      const exists = await Notification.findOne({
        userId: app.createdBy as any,
        type: "deadline",
        message,
        createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      })
      if (!exists) {
        await Notification.create({
          userId: app.createdBy as any,
          type: "deadline",
          title,
          message,
          link: `/applications/${app._id}`,
        })
      }
    }

    console.log(`Checked deadlines: ${apps.length} upcoming, ${visaApps.length} visa`)
  }

  setTimeout(checkDeadlines, 5000)
  setInterval(checkDeadlines, 24 * 60 * 60 * 1000)
}

start().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
