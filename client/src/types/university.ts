export interface University {
  _id: string
  name: string
  country: string
  city: string
  ranking?: number
  websiteUrl?: string
  notes?: string
  createdBy?: string
  isOfficial?: boolean
  createdAt: string
  updatedAt: string
}

export interface UniversityStats {
  totalUniversities: number
  totalPrograms: number
  totalApplications: number
  countriesCount: number
  citiesCount: number
  byCountry: { country: string; count: number }[]
  avgTuition: number
  scholarshipCount: number
}

export type UniversityFormData = Omit<
  University,
  "_id" | "createdAt" | "updatedAt"
>
