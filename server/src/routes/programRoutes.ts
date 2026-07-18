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
// PUT authorizes per-resource inside the controller: admin OR (creator AND custom).
programRouter.put("/:id", authenticate, update)
programRouter.put("/:id/toggle-official", authenticate, authorize("admin"), toggleOfficial)
programRouter.delete("/:id", authenticate, authorize("admin"), remove)
