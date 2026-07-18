import { z } from "zod"

export const createStudentSchema = z
  .object({
    name: z.string().min(1, "name is required"),
    email: z.string().email("email must be valid"),
    phone: z.string().optional(),
    notes: z.string().optional(),
  })
  .strict()

export const updateStudentSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  })
  .strict()
