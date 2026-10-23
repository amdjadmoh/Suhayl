export type DocumentStatus = "requested" | "uploaded" | "accepted" | "rejected"

export interface StoredFile {
  originalName: string
  size: number
  uploadedAt: string
  mimeType?: string
}

/** A document an agency asked a student for, and what the family sent back. */
export interface DocumentRequest {
  _id: string
  studentId: string | { _id: string; name: string; email: string }
  title: string
  note?: string
  dueDate?: string
  status: DocumentStatus
  rejectReason?: string
  file?: StoredFile
  createdAt: string
  updatedAt: string
}

/** What the family portal shows for one application. */
export interface PortalApplication {
  _id: string
  program: string
  degreeLevel?: string
  university?: string
  city?: string
  country?: string
  status: "Preparing" | "Applied" | "Accepted" | "Rejected" | "Waitlisted" | "Enrolled"
  deadline?: string
  submittedAt?: string
  documentsReady: number
  documentsNeeded: number
  visaApplied: boolean
  visaApproved?: boolean | null
  interviewAt?: string
  updatedAt: string
}

export interface PortalData {
  student: { name: string; targetIntake?: string }
  agency: { name: string; email: string } | null
  applications: PortalApplication[]
  documents: Omit<DocumentRequest, "studentId" | "createdAt" | "updatedAt">[]
}
