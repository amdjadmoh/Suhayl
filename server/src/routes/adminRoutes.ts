import { Router } from "express"
import { authenticate, authorize } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { createUserSchema, updateUserSchema } from "../validators/adminValidator"
import { getUsers, deleteUser, getStats, createUser, updateUser } from "../controllers/adminController"

export const adminRouter = Router()

adminRouter.use(authenticate, authorize("admin"))

adminRouter.get("/stats", getStats)
adminRouter.get("/users", getUsers)
adminRouter.post("/users", validate(createUserSchema, "body"), createUser)
adminRouter.put("/users/:id", validate(updateUserSchema, "body"), updateUser)
adminRouter.delete("/users/:id", deleteUser)
