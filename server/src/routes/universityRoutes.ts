import { Router } from "express"
import {
  getAll,
  getById,
  create,
  update,
  remove,
  getCountries,
  toggleOfficial,
} from "../controllers/universityController"
import { authenticate, authorize, optionalAuth } from "../middleware/auth"

export const universityRouter = Router()

// GET routes are public
universityRouter.get("/countries", getCountries)
universityRouter.get("/", optionalAuth, getAll)
universityRouter.get("/:id", optionalAuth, getById)

// Write operations
universityRouter.post("/", authenticate, create)
// PUT authorizes per-resource inside the controller: admin OR (creator AND custom).
universityRouter.put("/:id", authenticate, update)
universityRouter.put("/:id/toggle-official", authenticate, authorize("admin"), toggleOfficial)
universityRouter.delete("/:id", authenticate, authorize("admin"), remove)
