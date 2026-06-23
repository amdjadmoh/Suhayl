import { Router } from "express"
import {
  getAll,
  getById,
  create,
  update,
  remove,
  getCountries,
} from "../controllers/universityController"

export const universityRouter = Router()

universityRouter.get("/countries", getCountries)
universityRouter.get("/", getAll)
universityRouter.get("/:id", getById)
universityRouter.post("/", create)
universityRouter.put("/:id", update)
universityRouter.delete("/:id", remove)
