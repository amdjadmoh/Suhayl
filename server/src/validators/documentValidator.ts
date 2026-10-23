import { z } from "zod"

const dateSchema = z.union([z.string().datetime(), z.string().date()])

export const createDocumentRequestSchema = z
  .object({
    title: z.string().trim().min(1, "Say which document you need").max(120),
    note: z.string().trim().max(500).optional(),
    dueDate: dateSchema.optional(),
  })
  .strict()

export const reviewDocumentSchema = z
  .object({
    status: z.enum(["accepted", "rejected"]),
    rejectReason: z.string().trim().max(300).optional(),
  })
  .strict()
