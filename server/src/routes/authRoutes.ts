import { Router } from "express"
import { register, login, getMe, getPreferences, updatePreferences, googleAuth, forgotPassword, resetPassword } from "../controllers/authController"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { registerSchema, loginSchema, updatePreferencesSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/authValidator"

export const authRouter = Router()

authRouter.post("/register", validate(registerSchema, "body"), register)
authRouter.post("/login", validate(loginSchema, "body"), login)
authRouter.post("/google", googleAuth)
authRouter.get("/me", authenticate, getMe)
authRouter.get("/preferences", authenticate, getPreferences)
authRouter.put("/preferences", authenticate, validate(updatePreferencesSchema, "body"), updatePreferences)
authRouter.post("/forgot-password", validate(forgotPasswordSchema, "body"), forgotPassword)
authRouter.post("/reset-password", validate(resetPasswordSchema, "body"), resetPassword)
