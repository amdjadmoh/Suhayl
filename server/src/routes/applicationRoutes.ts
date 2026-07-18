import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validate"
import {
  createApplicationSchema,
  updateApplicationSchema,
  listApplicationsQuerySchema,
} from "../validators/applicationValidator"
import {
  getAll,
  getById,
  create,
  update,
  remove,
  getCalendar,
} from "../controllers/applicationController"

export const applicationRouter = Router()

applicationRouter.get("/calendar.ics", authenticate, getCalendar)
applicationRouter.get("/", authenticate, validate(listApplicationsQuerySchema, "query"), getAll)
applicationRouter.get("/:id", authenticate, getById)
applicationRouter.post("/", authenticate, validate(createApplicationSchema, "body"), create)
applicationRouter.put("/:id", authenticate, validate(updateApplicationSchema, "body"), update)
applicationRouter.delete("/:id", authenticate, remove)
