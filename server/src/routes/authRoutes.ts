import { Router } from "express"
import { register, login, getMe, getPreferences, updatePreferences, googleAuth } from "../controllers/authController"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { registerSchema, loginSchema, updatePreferencesSchema } from "../validators/authValidator"

export const authRouter = Router()

authRouter.post("/register", validate(registerSchema, "body"), register)
authRouter.post("/login", validate(loginSchema, "body"), login)
authRouter.post("/google", googleAuth)
authRouter.get("/me", authenticate, getMe)
authRouter.get("/preferences", authenticate, getPreferences)
authRouter.put("/preferences", authenticate, validate(updatePreferencesSchema, "body"), updatePreferences)
