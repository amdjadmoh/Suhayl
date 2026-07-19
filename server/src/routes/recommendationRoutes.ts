import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { inviteSchema, submitSchema } from "../validators/recommendationValidator"
import {
  invite,
  listByApplication,
  getByToken,
  submit,
  remove,
} from "../controllers/recommendationController"

export const recommendationRouter = Router()

// Authenticated routes
recommendationRouter.post("/", authenticate, validate(inviteSchema, "body"), invite)
recommendationRouter.get("/application/:applicationId", authenticate, listByApplication)
recommendationRouter.delete("/:id", authenticate, remove)

// Public routes (no auth)
recommendationRouter.get("/public/:token", getByToken)
recommendationRouter.post("/public/submit", validate(submitSchema, "body"), submit)
