export interface Program {
  _id: string
  name: string
  universityId: string | { _id: string; name: string; country: string; city: string; ranking?: number }
  degreeLevel: "Bachelor" | "Master" | "PhD" | "Diploma"
  languageOfInstruction: string
  tuitionFee: number
  tuitionCurrency: string
  tuitionPeriod: "Year" | "Semester" | "Total"
  testRequirements: { name: string; minimumScore: number }[]
  scholarshipAvailable: boolean
  scholarshipDetails?: string
  requiresSOP: boolean
  recommendationLetters: number
  applicationFee?: number
  requiredDocuments: string[]
  applicationDeadline?: string
  programUrl?: string
  notes?: string
  createdBy?: string
  isOfficial?: boolean
  verificationStatus: "manual" | "ai" | "none"
  createdAt: string
  updatedAt: string
}

export type ProgramFormData = Omit<Program, "_id" | "createdAt" | "updatedAt">
