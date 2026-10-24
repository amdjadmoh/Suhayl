import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { getStats } from "../controllers/statsController"

export const statsRouter = Router()

// Figures are about the caller's own applications, so anonymous callers get nothing
statsRouter.get("/", authenticate, getStats)
