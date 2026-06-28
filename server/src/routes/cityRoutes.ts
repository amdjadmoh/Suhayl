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

export const cityRouter = Router()

cityRouter.get("/", getAll)
cityRouter.get("/by-country/:countryName", getByCountry)
cityRouter.get("/:id", getById)
cityRouter.get("/:id/universities", getWithUniversities)
cityRouter.post("/", authenticate, authorize("admin"), create)
cityRouter.put("/:id", authenticate, authorize("admin"), update)
cityRouter.delete("/:id", authenticate, authorize("admin"), remove)
