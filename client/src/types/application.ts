export interface ApplicationProgress {
  documentsObtained: string[]
  testScores: { name: string; taken: boolean; score?: number }[]
  recommendationsRequested: number
  recommendationsReceived: number
  sopStatus: "not_started" | "draft" | "final"
  applicationFeePaid: boolean
  applicationSubmittedDate?: string
  visaApplied: boolean
  visaApproved?: boolean
  interviewScheduled?: string
  interviewCompleted: boolean
  visaDocumentsObtained: string[]
  visaDocumentsPending: string[]
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
    | "Preparing"
    | "Applied"
    | "Accepted"
    | "Rejected"
    | "Waitlisted"
    | "Enrolled"
  applicationDeadline?: string
  applicationProgress: ApplicationProgress
  notes?: string
  createdAt: string
  updatedAt: string
}

export type ApplicationFormData = Omit<
  Application,
  "_id" | "createdAt" | "updatedAt" | "applicationProgress"
> & {
  applicationProgress?: Partial<ApplicationProgress>
}
