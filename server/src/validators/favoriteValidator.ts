import { z } from "zod"

export const createFavoriteSchema = z
  .object({
    type: z.enum(["country", "city", "university", "program"]),
    itemId: z.string().min(1, "itemId is required"),
  })
  .strict()
