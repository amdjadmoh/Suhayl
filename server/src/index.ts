import dotenv from "dotenv"
dotenv.config()

import express, { type Request, type Response, type NextFunction } from "express"
import cors from "cors"
import path from "path"
import fs from "fs"
import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { universityRouter } from "./routes/universityRoutes"
import { statsRouter } from "./routes/statsRoutes"
import { countryRouter } from "./routes/countryRoutes"
import { cityRouter } from "./routes/cityRoutes"
import { seedIfEmpty } from "./seed"
import { authRouter } from "./routes/authRoutes"
import { agencyRouter } from "./routes/agencyRoutes"
import { studentRouter } from "./routes/studentRoutes"
import { adminRouter } from "./routes/adminRoutes"
import { applicationRouter } from "./routes/applicationRoutes"
import { programRouter } from "./routes/programRoutes"
import favoriteRoutes from "./routes/favoriteRoutes"
import notificationRoutes from "./routes/notificationRoutes"
import { Application } from "./models/Application"
import { Notification } from "./models/Notification"

const app = express()
const PORT = process.env["PORT"] ?? "5000"
const MONGODB_URI =
  process.env["MONGODB_URI"] ?? "mongodb://localhost:27017/wannaout"

// Persistent storage location for the in-memory MongoDB fallback. Resolved
// relative to the compiled file so the path is stable regardless of the
// process's working directory.
//   Dev  (ts-node-dev): __dirname = <repo>/server/src  → ../.. → <repo>
//   Prod (tsc):         __dirname = <repo>/server/dist → ../.. → <repo>
const DATA_DIR = path.resolve(__dirname, "..", "..", "data", "db")

app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

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

if (process.env["NODE_ENV"] === "production") {
  const clientDist = path.join(__dirname, "../../client/dist")
  app.use(express.static(clientDist))
  app.get("/{*splat}", (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDist, "index.html"))
  })
}

app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error("Unhandled error:", err.message)
    res.status(500).json({ message: "Internal server error" })
  }
)

async function start(): Promise<void> {
  let uri = MONGODB_URI

  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB at", MONGODB_URI)
  } catch {
    console.log("Local MongoDB not available, starting persistent in-memory server...")
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

  app.listen(parseInt(PORT, 10), () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })

  // Deadline checker — runs 5s after startup and every 24h
  async function checkDeadlines(): Promise<void> {
    const now = new Date()
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const apps = await Application.find({
      applicationDeadline: { $gte: now, $lte: thirtyDays },
    }).populate("programId", "name")

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
      }
    }
    console.log(`Checked deadlines: ${apps.length} upcoming`)
  }

  setTimeout(checkDeadlines, 5000)
  setInterval(checkDeadlines, 24 * 60 * 60 * 1000)
}

start()
