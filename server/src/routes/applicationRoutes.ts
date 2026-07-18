import { Router } from "express"
import { authenticate } from "../middleware/auth"
import {
  getAll,
  getById,
  create,
  update,
  remove,
} from "../controllers/applicationController"

export const applicationRouter = Router()

applicationRouter.get("/", authenticate, getAll)
applicationRouter.get("/:id", authenticate, getById)
applicationRouter.post("/", authenticate, create)
applicationRouter.put("/:id", authenticate, update)
applicationRouter.delete("/:id", authenticate, remove)
