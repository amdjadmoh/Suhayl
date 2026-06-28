import { Router } from "express"
import { authenticate, authorize } from "../middleware/auth"
import { getUsers, deleteUser, getStats, createUser, updateUser } from "../controllers/adminController"

export const adminRouter = Router()

adminRouter.use(authenticate, authorize("admin"))

adminRouter.get("/stats", getStats)
adminRouter.get("/users", getUsers)
adminRouter.post("/users", createUser)
adminRouter.put("/users/:id", updateUser)
adminRouter.delete("/users/:id", deleteUser)
