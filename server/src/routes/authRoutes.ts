import { Router } from "express"
import {
  register,
  login,
  getMe,
  getPreferences,
  updatePreferences,
  googleAuth,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/authController"
import { acceptInvite, readInvite } from "../controllers/teamController"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validate"
import {
  registerSchema,
  loginSchema,
  updatePreferencesSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  acceptInviteSchema,
} from "../validators/authValidator"

export const authRouter = Router()

authRouter.post("/register", validate(registerSchema, "body"), register)
authRouter.post("/login", validate(loginSchema, "body"), login)
authRouter.post("/google", googleAuth)
authRouter.get("/me", authenticate, getMe)
authRouter.delete("/me", authenticate, validate(deleteAccountSchema, "body"), deleteAccount)
authRouter.put("/profile", authenticate, validate(updateProfileSchema, "body"), updateProfile)
authRouter.put("/password", authenticate, validate(changePasswordSchema, "body"), changePassword)
authRouter.get("/preferences", authenticate, getPreferences)
authRouter.put("/preferences", authenticate, validate(updatePreferencesSchema, "body"), updatePreferences)
authRouter.post("/forgot-password", validate(forgotPasswordSchema, "body"), forgotPassword)
authRouter.post("/reset-password", validate(resetPasswordSchema, "body"), resetPassword)
authRouter.get("/invite/:token", readInvite)
authRouter.post("/invite/:token", validate(acceptInviteSchema, "body"), acceptInvite)
