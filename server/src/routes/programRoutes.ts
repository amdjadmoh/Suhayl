import { Router } from "express"
import { authenticate, authorize } from "../middleware/auth"
import {
  getAll,
  getById,
  getByUniversity,
  create,
  update,
  remove,
} from "../controllers/programController"

export const programRouter = Router()

programRouter.get("/", getAll)
programRouter.get("/by-university/:universityId", getByUniversity)
programRouter.get("/:id", getById)
programRouter.post("/", authenticate, authorize("admin"), create)
programRouter.put("/:id", authenticate, authorize("admin"), update)
programRouter.delete("/:id", authenticate, authorize("admin"), remove)
