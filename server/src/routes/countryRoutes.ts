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

export const countryRouter = Router()

countryRouter.get("/", getAll)
countryRouter.get("/:id", getById)
countryRouter.get("/:id/universities", getWithUniversities)
countryRouter.post("/", authenticate, authorize("admin"), create)
countryRouter.put("/:id", authenticate, authorize("admin"), update)
countryRouter.delete("/:id", authenticate, authorize("admin"), remove)
