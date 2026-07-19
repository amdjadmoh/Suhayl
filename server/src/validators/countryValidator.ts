import { z } from "zod"

export const createCountrySchema = z
  .object({
    name: z.string().min(1, "name is required"),
    currency: z.string().min(1, "currency is required"),
    livingCostEstimate: z.number().nonnegative(),
    visaBankAccountAmount: z.number().nonnegative(),
    visaBankAccountLocked: z.boolean(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    notes: z.string().optional(),
    visaType: z.string().optional(),
    proofOfFundsMonthly: z.number().optional(),
    whereToApply: z.string().optional(),
    processingTime: z.string().optional(),
    workPermit: z.string().optional(),
    postGraduationVisa: z.string().optional(),
    additionalVisaNotes: z.string().optional(),
    requiredDocuments: z.array(z.string()).optional(),
    verificationStatus: z.enum(["manual", "ai", "none"]),
  })
  .strict()

export const updateCountrySchema = z
  .object({
    name: z.string().min(1).optional(),
    currency: z.string().min(1).optional(),
    livingCostEstimate: z.number().nonnegative().optional(),
    visaBankAccountAmount: z.number().nonnegative().optional(),
    visaBankAccountLocked: z.boolean().optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    notes: z.string().optional(),
    visaType: z.string().optional(),
    proofOfFundsMonthly: z.number().optional(),
    whereToApply: z.string().optional(),
    processingTime: z.string().optional(),
    workPermit: z.string().optional(),
    postGraduationVisa: z.string().optional(),
    additionalVisaNotes: z.string().optional(),
    requiredDocuments: z.array(z.string()).optional(),
    verificationStatus: z.enum(["manual", "ai", "none"]).optional(),
  })
  .strict()
