import { z } from "zod"

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(1, "Name is required"),
    role: z.enum(["student", "agency"]),
  })
  .strict()

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
  })
  .strict()

export const updatePreferencesSchema = z
  .object({
    preferredMonthlyBudget: z.number().nonnegative().optional(),
    gpa: z.number().nonnegative().optional(),
    ieltsScore: z.number().nonnegative().optional(),
    preferredCountries: z.array(z.string()).optional(),
    preferredCurrency: z.string().optional(),
  })
  .strict()
