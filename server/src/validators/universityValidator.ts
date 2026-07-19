import { z } from "zod"

export const createUniversitySchema = z
  .object({
    name: z.string().min(1, "name is required"),
    country: z.string().min(1, "country is required"),
    city: z.string().min(1, "city is required"),
    ranking: z.coerce.number().optional(),
    qsRank: z.coerce.number().int().positive().nullable().optional(),
    theRank: z.coerce.number().int().positive().nullable().optional(),
    arwuRank: z.coerce.number().int().positive().nullable().optional(),
    websiteUrl: z.string().optional(),
    notes: z.string().optional(),
  })
  .strict()

export const updateUniversitySchema = z
  .object({
    name: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    ranking: z.coerce.number().optional(),
    qsRank: z.coerce.number().int().positive().nullable().optional(),
    theRank: z.coerce.number().int().positive().nullable().optional(),
    arwuRank: z.coerce.number().int().positive().nullable().optional(),
    websiteUrl: z.string().optional(),
    notes: z.string().optional(),
  })
  .strict()

export const updateRankingsSchema = z
  .object({
    qsRank: z.coerce.number().int().positive().nullable().optional(),
    theRank: z.coerce.number().int().positive().nullable().optional(),
    arwuRank: z.coerce.number().int().positive().nullable().optional(),
  })
  .strict()

export const listUniversitiesQuerySchema = z.object({
  country: z.string().optional(),
  search: z.string().optional(),
  customOnly: z.string().optional(),
})
