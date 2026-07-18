import { Router } from "express"
import { register, login, getMe, getPreferences, updatePreferences } from "../controllers/authController"
import { authenticate } from "../middleware/auth"

export const authRouter = Router()

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.get("/me", authenticate, getMe)
authRouter.get("/preferences", authenticate, getPreferences)
authRouter.put("/preferences", authenticate, updatePreferences)
