import { Schema, model, type Document } from "mongoose"

const DEGREE_LEVELS = ["Bachelor", "Master", "PhD", "Diploma"] as const
type DegreeLevel = (typeof DEGREE_LEVELS)[number]

const TUITION_PERIODS = ["Year", "Semester", "Total"] as const
type TuitionPeriod = (typeof TUITION_PERIODS)[number]

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

export interface IUniversity {
  readonly name: string
  readonly country: string
  readonly city: string
  readonly ranking?: number
  readonly program: string
  readonly degreeLevel: DegreeLevel
  readonly languageOfInstruction: string
  readonly tuitionFee: number
  readonly tuitionCurrency: string
  readonly tuitionPeriod: TuitionPeriod
  readonly livingCostEstimate?: number
  readonly applicationDeadline?: Date
  readonly applicationStatus: ApplicationStatus
  readonly requiredDocuments: readonly string[]
  readonly gpaRequirement?: number
  readonly ieltsRequirement?: number
  readonly toeflRequirement?: number
  readonly scholarshipAvailable: boolean
  readonly scholarshipDetails?: string
  readonly websiteUrl?: string
  readonly notes?: string
  readonly applicationProgress: IApplicationProgress
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface IUniversityDocument extends IUniversity, Document {}

const universitySchema = new Schema<IUniversityDocument>(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    ranking: { type: Number },
    program: { type: String, required: true },
    degreeLevel: {
      type: String,
      enum: DEGREE_LEVELS,
      required: true,
    },
    languageOfInstruction: { type: String, default: "English" },
    tuitionFee: { type: Number, required: true },
    tuitionCurrency: { type: String, default: "EUR" },
    tuitionPeriod: {
      type: String,
      enum: TUITION_PERIODS,
      default: "Year",
    },
    livingCostEstimate: { type: Number },
    applicationDeadline: { type: Date },
    applicationStatus: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "Wishlist",
    },
    requiredDocuments: { type: [String], default: [] },
    gpaRequirement: { type: Number },
    ieltsRequirement: { type: Number },
    toeflRequirement: { type: Number },
    scholarshipAvailable: { type: Boolean, default: false },
    scholarshipDetails: { type: String },
    websiteUrl: { type: String },
    notes: { type: String },
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
  },
  { timestamps: true }
)

export const University = model<IUniversityDocument>(
  "University",
  universitySchema
)
