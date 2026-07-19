import type { Request, Response } from "express"
import { Program } from "../models/Program"
import { University } from "../models/University"
import { Country } from "../models/Country"
import { City } from "../models/City"

const DEGREE_DURATION: Record<string, number> = {
  Bachelor: 4,
  Master: 2,
  PhD: 3,
  Diploma: 1,
}

const DEFAULT_YEARS = 1

interface BudgetBreakdown {
  label: string
  amount: number
  description: string
}

interface BudgetResult {
  tuition: number
  livingCost: number
  visaFees: number
  insurance: number
  total: number
  currency: string
  breakdown: BudgetBreakdown[]
}

export async function calculateBudget(req: Request, res: Response): Promise<void> {
  const programId = (req.query["programId"] as string) ?? req.body?.["programId"]

  if (!programId) {
    res.status(400).json({ message: "programId is required" })
    return
  }

  const program = await Program.findById(programId)
  if (!program) {
    res.status(404).json({ message: "Program not found" })
    return
  }

  const university = await University.findById(program.universityId)
  if (!university) {
    res.status(404).json({ message: "University not found" })
    return
  }

  const country = await Country.findOne({ name: university.country })
  if (!country) {
    res.status(404).json({ message: "Country data not found" })
    return
  }

  const city = await City.findOne({ name: university.city, country: university.country })

  const years = DEGREE_DURATION[program.degreeLevel] ?? DEFAULT_YEARS
  const tuitionPerYear = program.tuitionFee
  const tuition = tuitionPerYear * years

  const monthlyLivingCost = city?.monthlyLivingCost ?? country.livingCostEstimate
  const livingCost = monthlyLivingCost * 12 * years

  const visaFees = country.visaBankAccountAmount

  const annualInsurance = Math.round(tuitionPerYear * 0.05)
  const insurance = annualInsurance * years

  const total = tuition + livingCost + visaFees + insurance
  const currency = country.currency

  const breakdown: BudgetBreakdown[] = [
    {
      label: "Tuition Fees",
      amount: tuition,
      description: `${tuitionPerYear} ${currency}/year × ${years} year${years > 1 ? "s" : ""}`,
    },
    {
      label: "Living Costs",
      amount: livingCost,
      description: `${monthlyLivingCost} ${currency}/month × 12 months × ${years} year${years > 1 ? "s" : ""}`,
    },
    {
      label: country.visaBankAccountLocked ? "Visa Bank Deposit (refundable)" : "Visa Fees",
      amount: visaFees,
      description: country.visaBankAccountLocked
        ? "Required bank deposit for visa application"
        : "Non-refundable visa fee",
    },
    {
      label: "Health Insurance (estimated)",
      amount: insurance,
      description: `5% of annual tuition (${annualInsurance} ${currency}/year) × ${years} year${years > 1 ? "s" : ""}`,
    },
  ]

  const result: BudgetResult = {
    tuition,
    livingCost,
    visaFees,
    insurance,
    total,
    currency,
    breakdown,
  }

  res.json(result)
}
