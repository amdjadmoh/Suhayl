import { Router } from "express"
import {
  getAll,
  getById,
  getWithUniversities,
  create,
  update,
  remove,
} from "../controllers/countryController"
import { authenticate, authorize } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { createCountrySchema, updateCountrySchema } from "../validators/countryValidator"

export const countryRouter = Router()

countryRouter.get("/", getAll)
countryRouter.get("/:id", getById)
countryRouter.get("/:id/universities", getWithUniversities)
countryRouter.post("/", authenticate, authorize("admin"), validate(createCountrySchema, "body"), create)
countryRouter.put("/:id", authenticate, authorize("admin"), validate(updateCountrySchema, "body"), update)
countryRouter.delete("/:id", authenticate, authorize("admin"), remove)
