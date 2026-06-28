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

export const cityRouter = Router()

cityRouter.get("/", getAll)
cityRouter.get("/by-country/:countryName", getByCountry)
cityRouter.get("/:id", getById)
cityRouter.get("/:id/universities", getWithUniversities)
cityRouter.post("/", create)
cityRouter.put("/:id", update)
cityRouter.delete("/:id", remove)
