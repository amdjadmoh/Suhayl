import { Router } from "express"
import {
  getAll,
  getById,
  getByCountry,
  getWithUniversities,
  create,
  update,
  remove,
} from "../controllers/cityController"
import { authenticate, authorize } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { createCitySchema, updateCitySchema, listCitiesQuerySchema } from "../validators/cityValidator"

export const cityRouter = Router()

cityRouter.get("/", validate(listCitiesQuerySchema, "query"), getAll)
cityRouter.get("/by-country/:countryName", getByCountry)
cityRouter.get("/:id", getById)
cityRouter.get("/:id/universities", getWithUniversities)
cityRouter.post("/", authenticate, authorize("admin"), validate(createCitySchema, "body"), create)
cityRouter.put("/:id", authenticate, authorize("admin"), validate(updateCitySchema, "body"), update)
cityRouter.delete("/:id", authenticate, authorize("admin"), remove)
