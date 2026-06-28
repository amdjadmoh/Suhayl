export interface Program {
  _id: string
  name: string
  universityId: string | { _id: string; name: string; country: string; city: string; ranking?: number }
  degreeLevel: "Bachelor" | "Master" | "PhD" | "Diploma"
  languageOfInstruction: string
  tuitionFee: number
  tuitionCurrency: string
  tuitionPeriod: "Year" | "Semester" | "Total"
  gpaRequirement?: number
  ieltsRequirement?: number
  toeflRequirement?: number
  scholarshipAvailable: boolean
  scholarshipDetails?: string
  requiredDocuments: string[]
  applicationDeadline?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type ProgramFormData = Omit<Program, "_id" | "createdAt" | "updatedAt">
