import { Router } from "express"
import { authenticate, authorize, optionalAuth } from "../middleware/auth"
import {
  getAll,
  getById,
  getByUniversity,
  getMatches,
  create,
  update,
  remove,
  toggleOfficial,
} from "../controllers/programController"

export const programRouter = Router()

programRouter.get("/matches", optionalAuth, getMatches)
programRouter.get("/", optionalAuth, getAll)
programRouter.get("/by-university/:universityId", optionalAuth, getByUniversity)
programRouter.get("/:id", optionalAuth, getById)
programRouter.post("/", authenticate, create)
programRouter.put("/:id", authenticate, authorize("admin"), update)
programRouter.put("/:id/toggle-official", authenticate, authorize("admin"), toggleOfficial)
programRouter.delete("/:id", authenticate, authorize("admin"), remove)
