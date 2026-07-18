import { z } from "zod"

export const createUserSchema = z
  .object({
    email: z.string().email("email must be valid"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(1, "name is required"),
    role: z.enum(["admin", "student", "agency"]),
  })
  .strict()

export const updateUserSchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().min(1).optional(),
    role: z.enum(["admin", "student", "agency"]).optional(),
  })
  .strict()
