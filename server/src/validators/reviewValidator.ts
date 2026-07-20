import { z } from "zod"

const targetTypeEnum = z.enum(["university", "program"])

export const upsertReviewSchema = z
  .object({
    targetType: targetTypeEnum,
    targetId: z.string().min(1, "targetId is required"),
    rating: z
      .number()
      .int("Rating must be a whole number")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    comment: z
      .string()
      .min(3, "Review must be at least 3 characters")
      .max(2000, "Review must be at most 2000 characters"),
  })
  .strict()

export const listReviewsQuerySchema = z.object({
  targetType: targetTypeEnum,
  targetId: z.string().min(1, "targetId is required"),
})
