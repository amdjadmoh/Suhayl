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

export interface Application {
  _id: string
  programId:
    | string
    | {
        _id: string
        name: string
        universityId: {
          _id: string
          name: string
          country: string
          city: string
        }
      }
  studentName: string
  studentEmail: string
  agencyId?: string
  createdBy?: string
  applicationStatus:
    | "Wishlist"
    | "Preparing"
    | "Applied"
    | "Accepted"
    | "Rejected"
    | "Enrolled"
  applicationDeadline?: string
  applicationProgress: ApplicationProgress
  notes?: string
  livingCostEstimate?: number
  createdAt: string
  updatedAt: string
}

export type ApplicationFormData = Omit<
  Application,
  "_id" | "createdAt" | "updatedAt" | "applicationProgress"
> & {
  applicationProgress?: Partial<ApplicationProgress>
}
