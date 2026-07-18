import { Router } from "express"
import { authenticate, authorize } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { createStudentSchema, updateStudentSchema } from "../validators/studentValidator"
import { getAll, getById, create, update, remove } from "../controllers/studentController"

export const studentRouter = Router()

studentRouter.use(authenticate, authorize("agency"))

studentRouter.get("/", getAll)
studentRouter.get("/:id", getById)
studentRouter.post("/", validate(createStudentSchema, "body"), create)
studentRouter.put("/:id", validate(updateStudentSchema, "body"), update)
studentRouter.delete("/:id", remove)
