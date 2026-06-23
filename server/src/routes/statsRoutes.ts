import { Router } from "express"
import { getStats } from "../controllers/statsController"

export const statsRouter = Router()

statsRouter.get("/", getStats)
