import dotenv from "dotenv"
dotenv.config()

import express, { type Request, type Response, type NextFunction } from "express"
import cors from "cors"
import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { universityRouter } from "./routes/universityRoutes"
import { statsRouter } from "./routes/statsRoutes"

const app = express()
const PORT = process.env["PORT"] ?? "5000"
const MONGODB_URI =
  process.env["MONGODB_URI"] ?? "mongodb://localhost:27017/wannaout"

app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

app.use("/api/universities", universityRouter)
app.use("/api/stats", statsRouter)

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
    console.log("Local MongoDB not available, starting in-memory server...")
    const memServer = await MongoMemoryServer.create()
    uri = memServer.getUri()
    await mongoose.connect(uri)
    console.log("Connected to in-memory MongoDB at", uri)
  }

  app.listen(parseInt(PORT, 10), () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

start()
