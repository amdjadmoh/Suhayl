import { Router } from "express"
import { authenticate, optionalAuth } from "../middleware/auth"
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../controllers/applicationController"

export const applicationRouter = Router()

applicationRouter.get("/", optionalAuth, getAll)
applicationRouter.get("/:id", optionalAuth, getById)
applicationRouter.post("/", authenticate, create)
applicationRouter.put("/:id", authenticate, update)
applicationRouter.delete("/:id", authenticate, remove)
