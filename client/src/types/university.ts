export interface ApplicationProgress {
  documentsObtained: string[]
  ieltsTaken: boolean
  ieltsScore?: number
  toeflTaken: boolean
  toeflScore?: number
  gpaVerified: boolean
  recommendationsRequested: number
  recommendationsReceived: number
  sopStatus: "not_started" | "draft" | "final"
  applicationFeePaid: boolean
  applicationSubmittedDate?: string
  visaApplied: boolean
  visaApproved?: boolean
  interviewScheduled?: string
  interviewCompleted: boolean
}

export interface University {
  _id: string
  name: string
  country: string
  city: string
  ranking?: number
  program: string
  degreeLevel: "Bachelor" | "Master" | "PhD" | "Diploma"
  languageOfInstruction: string
  tuitionFee: number
  tuitionCurrency: string
  tuitionPeriod: "Year" | "Semester" | "Total"
  livingCostEstimate?: number
  applicationDeadline?: string
  applicationStatus:
    | "Wishlist"
    | "Preparing"
    | "Applied"
    | "Accepted"
    | "Rejected"
    | "Enrolled"
  requiredDocuments: string[]
  gpaRequirement?: number
  ieltsRequirement?: number
  toeflRequirement?: number
  scholarshipAvailable: boolean
  scholarshipDetails?: string
  websiteUrl?: string
  notes?: string
  applicationProgress: ApplicationProgress
  createdAt: string
  updatedAt: string
}

export interface UniversityStats {
  totalUniversities: number
  countriesCount: number
  byCountry: { country: string; count: number }[]
  byStatus: { status: string; count: number }[]
  avgTuition: number
  upcomingDeadlines: University[]
  recentlyAdded: University[]
  scholarshipCount: number
}

export type UniversityFormData = Omit<
  University,
  "_id" | "createdAt" | "updatedAt" | "applicationProgress"
>
