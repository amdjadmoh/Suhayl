import { Schema, model, type Document, Types } from "mongoose"

const APPLICATION_STATUSES = [
  "Wishlist",
  "Preparing",
  "Applied",
  "Accepted",
  "Rejected",
  "Enrolled",
] as const
type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

const SOP_STATUSES = ["not_started", "draft", "final"] as const
type SopStatus = (typeof SOP_STATUSES)[number]

export interface IApplicationProgress {
  documentsObtained: readonly string[]
  ieltsTaken: boolean
  ieltsScore?: number
  toeflTaken: boolean
  toeflScore?: number
  gpaVerified: boolean
  recommendationsRequested: number
  recommendationsReceived: number
  sopStatus: SopStatus
  applicationFeePaid: boolean
  applicationSubmittedDate?: Date
  visaApplied: boolean
  visaApproved?: boolean
  interviewScheduled?: Date
  interviewCompleted: boolean
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
  readonly livingCostEstimate?: number
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
      default: "Wishlist",
    },
    applicationDeadline: { type: Date },
    applicationProgress: {
      type: new Schema<IApplicationProgress>(
        {
          documentsObtained: { type: [String], default: [] },
          ieltsTaken: { type: Boolean, default: false },
          ieltsScore: { type: Number },
          toeflTaken: { type: Boolean, default: false },
          toeflScore: { type: Number },
          gpaVerified: { type: Boolean, default: false },
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
        },
        { _id: false }
      ),
      default: {},
    },
    notes: { type: String },
    livingCostEstimate: { type: Number },
  },
  { timestamps: true }
)

export const Application = model<IApplicationDocument>(
  "Application",
  applicationSchema
)
