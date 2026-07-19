import { Router } from "express"
import { optionalAuth } from "../middleware/auth"
import { calculateBudget } from "../controllers/budgetController"

export const budgetRouter = Router()

// GET /api/budget?programId=...
// Optional auth — budget data is useful even without login
budgetRouter.get("/", optionalAuth, calculateBudget)
