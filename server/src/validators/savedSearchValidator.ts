import { z } from "zod"

export const createSavedSearchSchema = z
  .object({
    name: z.string().min(1, "name is required"),
    entityType: z.enum(["program", "university"]),
    filters: z.any().optional(),
  })
  .strict()
