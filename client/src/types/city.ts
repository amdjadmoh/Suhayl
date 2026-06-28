export interface City {
  _id: string
  name: string
  country: string
  population?: number
  isCapital: boolean
  averageRentSingle: number
  averageRentShared: number
  monthlyLivingCost: number
  qualityOfLifeScore: number
  safetyScore: number
  publicTransportScore: number
  studentFriendliness: number
  internetSpeed?: number
  language: string
  englishFriendliness: number
  climate: string
  pros: string[]
  cons: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CityWithUniversities {
  city: City
  universities: import("./university").University[]
}

export type CityFormData = Omit<City, "_id" | "createdAt" | "updatedAt">
