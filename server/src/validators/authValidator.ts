import { z } from "zod"

export const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(1, "Name is required"),
    role: z.enum(["student", "agency"]),
    // The sign-up form only submits once the box is ticked
    acceptTerms: z.literal(true).optional(),
  })
  .strict()

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1, "Password is required"),
  })
  .strict()

export const updatePreferencesSchema = z
  .object({
    preferredMonthlyBudget: z.number().nonnegative().nullable().optional(),
    gpa: z.number().min(0).max(4).nullable().optional(),
    ieltsScore: z.number().min(0).max(9).nullable().optional(),
    preferredCountries: z.array(z.string()).optional(),
    preferredCurrency: z.string().nullable().optional(),
  })
  .strict()

export const forgotPasswordSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
  })
  .strict()

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .strict()

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
  })
  .strict()

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .strict()

export const deleteAccountSchema = z
  .object({
    password: z.string().optional(),
    confirmEmail: z.string().optional(),
  })
  .strict()

export const acceptInviteSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .strict()

export const inviteMemberSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
    email: z.string().trim().toLowerCase().email(),
  })
  .strict()
