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
  country: z.string().max(100).optional(),
  search: z.string().max(100).optional(),
  customOnly: z.string().max(5).optional(),
  limit: z.coerce.number().int().optional(),
  page: z.coerce.number().int().optional(),
})
