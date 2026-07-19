import { z } from "zod"

const degreeLevelEnum = z.enum(["Bachelor", "Master", "PhD", "Diploma"])
const tuitionPeriodEnum = z.enum(["Year", "Semester", "Total"])

export const createProgramSchema = z
  .object({
    name: z.string().min(1, "name is required"),
    universityId: z.string().min(1, "universityId is required"),
    degreeLevel: degreeLevelEnum,
    tuitionFee: z.coerce.number().nonnegative("tuitionFee must be non-negative"),
    languageOfInstruction: z.string().optional(),
    tuitionCurrency: z.string().optional(),
    tuitionPeriod: tuitionPeriodEnum.optional(),
    testRequirements: z
      .array(
        z.object({ name: z.string(), minimumScore: z.number() }).strict()
      )
      .optional(),
    scholarshipAvailable: z.boolean().optional(),
    scholarshipDetails: z.string().optional(),
    requiredDocuments: z.array(z.string()).optional(),
    requiresSOP: z.boolean().optional(),
    recommendationLetters: z.coerce.number().optional(),
    applicationFee: z.coerce.number().optional(),
    applicationDeadline: z.union([z.string().datetime(), z.string().date()]).optional(),
    programUrl: z.string().optional(),
    notes: z.string().optional(),
  })
  .strict()

export const updateProgramSchema = z
  .object({
    name: z.string().min(1).optional(),
    universityId: z.string().min(1).optional(),
    degreeLevel: degreeLevelEnum.optional(),
    tuitionFee: z.coerce.number().nonnegative().optional(),
    languageOfInstruction: z.string().optional(),
    tuitionCurrency: z.string().optional(),
    tuitionPeriod: tuitionPeriodEnum.optional(),
    testRequirements: z
      .array(
        z.object({ name: z.string(), minimumScore: z.number() }).strict()
      )
      .optional(),
    scholarshipAvailable: z.boolean().optional(),
    scholarshipDetails: z.string().optional(),
    requiredDocuments: z.array(z.string()).optional(),
    requiresSOP: z.boolean().optional(),
    recommendationLetters: z.coerce.number().optional(),
    applicationFee: z.coerce.number().optional(),
    applicationDeadline: z.union([z.string().datetime(), z.string().date()]).optional(),
    programUrl: z.string().optional(),
    notes: z.string().optional(),
  })
  .strict()

export const listProgramsQuerySchema = z.object({
  universityId: z.string().optional(),
  degreeLevel: z.string().optional(),
  search: z.string().optional(),
  field: z.string().optional(),
  country: z.string().optional(),
  minTuition: z.coerce.number().optional(),
  maxTuition: z.coerce.number().optional(),
  minGpa: z.coerce.number().optional(),
  maxIelts: z.coerce.number().optional(),
  scholarshipOnly: z.string().optional(),
  city: z.string().optional(),
  customOnly: z.string().optional(),
})
