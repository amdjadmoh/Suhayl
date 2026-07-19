import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { createSavedSearchSchema } from "../validators/savedSearchValidator"
import { list, create, remove } from "../controllers/savedSearchController"

export const savedSearchRouter = Router()

savedSearchRouter.use(authenticate)

savedSearchRouter.get("/", list)
savedSearchRouter.post("/", validate(createSavedSearchSchema, "body"), create)
savedSearchRouter.delete("/:id", remove)
