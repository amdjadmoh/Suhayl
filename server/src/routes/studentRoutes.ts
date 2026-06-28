import { Router } from "express"
import { authenticate, authorize } from "../middleware/auth"
import { getAll, getById, create, update, remove } from "../controllers/studentController"

export const studentRouter = Router()

studentRouter.use(authenticate, authorize("agency"))

studentRouter.get("/", getAll)
studentRouter.get("/:id", getById)
studentRouter.post("/", create)
studentRouter.put("/:id", update)
studentRouter.delete("/:id", remove)
