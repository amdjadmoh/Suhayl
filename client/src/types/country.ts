export interface Country {
  _id: string
  name: string
  currency: string
  livingCostEstimate: number
  visaBankAccountAmount: number
  visaBankAccountLocked: boolean
  pros: string[]
  cons: string[]
  requiredDocuments: string[]
  visaType?: string
  proofOfFundsMonthly?: number
  whereToApply?: string
  processingTime?: string
  workPermit?: string
  postGraduationVisa?: string
  additionalVisaNotes?: string
  notes?: string
  verificationStatus: "manual" | "ai" | "none"
  createdAt: string
  updatedAt: string
}

export interface CountryWithUniversities {
  country: Country
  universities: import("./university").University[]
  cities: import("./city").City[]
}
