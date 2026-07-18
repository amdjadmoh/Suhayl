import { Router } from "express"
import {
  getAll,
  getById,
  create,
  update,
  remove,
  getCountries,
  toggleOfficial,
  updateRankings,
} from "../controllers/universityController"
import { authenticate, authorize, optionalAuth } from "../middleware/auth"
import { validate } from "../middleware/validate"
import {
  createUniversitySchema,
  updateUniversitySchema,
  updateRankingsSchema,
  listUniversitiesQuerySchema,
} from "../validators/universityValidator"

export const universityRouter = Router()

// GET routes are public
universityRouter.get("/countries", getCountries)
universityRouter.get("/", optionalAuth, validate(listUniversitiesQuerySchema, "query"), getAll)
universityRouter.get("/:id", optionalAuth, getById)

// Write operations
universityRouter.post("/", authenticate, validate(createUniversitySchema, "body"), create)
// PUT authorizes per-resource inside the controller: admin OR (creator AND custom).
universityRouter.put("/:id", authenticate, validate(updateUniversitySchema, "body"), update)
universityRouter.put("/:id/toggle-official", authenticate, authorize("admin"), toggleOfficial)
universityRouter.put("/:id/rankings", authenticate, authorize("admin"), validate(updateRankingsSchema, "body"), updateRankings)
universityRouter.delete("/:id", authenticate, authorize("admin"), remove)
