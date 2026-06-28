import { Router } from "express"
import {
  getAll,
  getById,
  create,
  update,
  remove,
  getCountries,
} from "../controllers/universityController"
import { authenticate, authorize } from "../middleware/auth"

export const universityRouter = Router()

// GET routes are public
universityRouter.get("/countries", getCountries)
universityRouter.get("/", getAll)
universityRouter.get("/:id", getById)

// Write operations: admin only
universityRouter.post("/", authenticate, authorize("admin"), create)
universityRouter.put("/:id", authenticate, authorize("admin"), update)
universityRouter.delete("/:id", authenticate, authorize("admin"), remove)
