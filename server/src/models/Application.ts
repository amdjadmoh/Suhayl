import { Schema, model, type Document, Types } from "mongoose"

const APPLICATION_STATUSES = [
  "Preparing",
  "Applied",
  "Accepted",
  "Rejected",
  "Waitlisted",
  "Enrolled",
] as const
type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

const SOP_STATUSES = ["not_started", "draft", "final"] as const
type SopStatus = (typeof SOP_STATUSES)[number]

export interface IApplicationProgress {
  documentsObtained: readonly string[]
  testScores: { name: string; taken: boolean; score?: number }[]
  recommendationsRequested: number
  recommendationsReceived: number
  sopStatus: SopStatus
  applicationFeePaid: boolean
  applicationSubmittedDate?: Date
  visaApplied: boolean
  visaApproved?: boolean
  interviewScheduled?: Date
  interviewCompleted: boolean
  visaDocumentsObtained: readonly string[]
  visaDocumentsPending: readonly string[]
}

export interface IApplication {
  readonly programId: Types.ObjectId
  readonly studentName: string
  readonly studentEmail: string
  readonly agencyId?: Types.ObjectId
  readonly createdBy?: Types.ObjectId
  readonly applicationStatus: ApplicationStatus
  readonly applicationDeadline?: Date
  readonly applicationProgress: IApplicationProgress
  readonly notes?: string
  readonly personalStatement?: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface IApplicationDocument extends IApplication, Document {}

const applicationSchema = new Schema<IApplicationDocument>(
  {
    programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    agencyId: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    applicationStatus: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "Preparing",
    },
    applicationDeadline: { type: Date },
    applicationProgress: {
      type: new Schema<IApplicationProgress>(
        {
          documentsObtained: { type: [String], default: [] },
          testScores: {
            type: [{ _id: false, name: String, taken: { type: Boolean, default: false }, score: Number }],
            default: [],
          },
          recommendationsRequested: { type: Number, default: 0 },
          recommendationsReceived: { type: Number, default: 0 },
          sopStatus: {
            type: String,
            enum: SOP_STATUSES,
            default: "not_started",
          },
          applicationFeePaid: { type: Boolean, default: false },
          applicationSubmittedDate: { type: Date },
          visaApplied: { type: Boolean, default: false },
          visaApproved: { type: Boolean },
          interviewScheduled: { type: Date },
          interviewCompleted: { type: Boolean, default: false },
          visaDocumentsObtained: { type: [String], default: [] },
          visaDocumentsPending: { type: [String], default: [] },
        },
        { _id: false }
      ),
      default: {},
    },
    notes: { type: String },
    personalStatement: { type: String, default: "" },
  },
  { timestamps: true }
)

applicationSchema.index({ applicationDeadline: 1 })
applicationSchema.index({ applicationStatus: 1 })
applicationSchema.index({ agencyId: 1 })
applicationSchema.index({ createdBy: 1 })

export const Application = model<IApplicationDocument>(
  "Application",
  applicationSchema
)
