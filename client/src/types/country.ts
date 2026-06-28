export interface Country {
  _id: string
  name: string
  currency: string
  livingCostEstimate: number
  visaRequirements: string
  visaAcceptanceRate: number
  visaBankAccountAmount: number
  visaBankAccountLocked: boolean
  pros: string[]
  cons: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CountryWithUniversities {
  country: Country
  universities: import("./university").University[]
  cities: import("./city").City[]
}
