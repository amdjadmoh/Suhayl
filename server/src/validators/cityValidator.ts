import { z } from "zod"

export const createCitySchema = z
  .object({
    name: z.string().min(1, "name is required"),
    country: z.string().min(1, "country is required"),
    population: z.number().optional(),
    isCapital: z.boolean().optional(),
    averageRentSingle: z.number().nonnegative(),
    averageRentShared: z.number().nonnegative(),
    monthlyLivingCost: z.number().nonnegative(),
    qualityOfLifeScore: z.number().nonnegative(),
    safetyScore: z.number().nonnegative(),
    publicTransportScore: z.number().nonnegative(),
    studentFriendliness: z.number().nonnegative(),
    internetSpeed: z.number().optional(),
    language: z.string().min(1, "language is required"),
    englishFriendliness: z.number().nonnegative(),
    climate: z.string().min(1, "climate is required"),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    notes: z.string().optional(),
  })
  .strict()

export const updateCitySchema = z
  .object({
    name: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
    population: z.number().optional(),
    isCapital: z.boolean().optional(),
    averageRentSingle: z.number().nonnegative().optional(),
    averageRentShared: z.number().nonnegative().optional(),
    monthlyLivingCost: z.number().nonnegative().optional(),
    qualityOfLifeScore: z.number().nonnegative().optional(),
    safetyScore: z.number().nonnegative().optional(),
    publicTransportScore: z.number().nonnegative().optional(),
    studentFriendliness: z.number().nonnegative().optional(),
    internetSpeed: z.number().optional(),
    language: z.string().min(1).optional(),
    englishFriendliness: z.number().nonnegative().optional(),
    climate: z.string().min(1).optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    notes: z.string().optional(),
  })
  .strict()

export const listCitiesQuerySchema = z.object({
  country: z.string().optional(),
})
