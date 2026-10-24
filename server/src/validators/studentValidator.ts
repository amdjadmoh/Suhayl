import { z } from "zod"

const profileFields = {
  phone: z.string().optional(),
  notes: z.string().optional(),
  gpa: z.number().min(0).max(4).nullable().optional(),
  ieltsScore: z.number().min(0).max(9).nullable().optional(),
  monthlyBudget: z.number().nonnegative().nullable().optional(),
  preferredCountries: z.array(z.string()).optional(),
  degreeLevel: z.string().optional(),
  targetIntake: z.string().max(40).optional(),
  feeAgreed: z.number().nonnegative().nullable().optional(),
  feeCurrency: z.string().trim().length(3).toUpperCase().optional(),
  counsellorId: z.string().nullable().optional(),
}

export const createStudentSchema = z
  .object({
    name: z.string().trim().min(1, "name is required"),
    email: z.string().trim().toLowerCase().email("email must be valid"),
    ...profileFields,
  })
  .strict()

export const updateStudentSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    ...profileFields,
  })
  .strict()

const dateSchema = z.union([z.string().datetime(), z.string().date()])

export const createTaskSchema = z
  .object({
    text: z.string().trim().min(1, "Say what needs doing").max(300),
    dueDate: dateSchema.optional(),
  })
  .strict()

export const updateTaskSchema = z
  .object({
    text: z.string().trim().min(1).max(300).optional(),
    dueDate: dateSchema.nullable().optional(),
    done: z.boolean().optional(),
  })
  .strict()

export const createPaymentSchema = z
  .object({
    amount: z.number().positive("Enter an amount above zero"),
    paidAt: dateSchema,
    method: z.string().trim().max(40).optional(),
    note: z.string().trim().max(200).optional(),
  })
  .strict()

export const bulkDocumentSchema = z
  .object({
    studentIds: z.array(z.string().regex(/^[a-f0-9]{24}$/i, "Not a student id")).min(1).max(500),
    title: z.string().trim().min(1).max(120),
    note: z.string().trim().max(500).optional(),
    dueDate: dateSchema.optional(),
  })
  .strict()

export const bulkAssignSchema = z
  .object({
    studentIds: z.array(z.string().regex(/^[a-f0-9]{24}$/i, "Not a student id")).min(1).max(500),
    counsellorId: z.string().regex(/^[a-f0-9]{24}$/i, "Not a team member id").nullable(),
  })
  .strict()
