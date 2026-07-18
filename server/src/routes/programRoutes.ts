import { Router } from "express"
import { authenticate, authorize, optionalAuth } from "../middleware/auth"
import { validate } from "../middleware/validate"
import {
  createProgramSchema,
  updateProgramSchema,
  listProgramsQuerySchema,
} from "../validators/programValidator"
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
programRouter.get("/", optionalAuth, validate(listProgramsQuerySchema, "query"), getAll)
programRouter.get("/by-university/:universityId", optionalAuth, getByUniversity)
programRouter.get("/:id", optionalAuth, getById)
programRouter.post("/", authenticate, validate(createProgramSchema, "body"), create)
// PUT authorizes per-resource inside the controller: admin OR (creator AND custom).
programRouter.put("/:id", authenticate, validate(updateProgramSchema, "body"), update)
programRouter.put("/:id/toggle-official", authenticate, authorize("admin"), toggleOfficial)
programRouter.delete("/:id", authenticate, authorize("admin"), remove)
