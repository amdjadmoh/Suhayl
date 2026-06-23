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
  readonly visaRequirements?: string
  readonly requiredDocuments: readonly string[]
  readonly gpaRequirement?: number
  readonly ieltsRequirement?: number
  readonly toeflRequirement?: number
  readonly scholarshipAvailable: boolean
  readonly scholarshipDetails?: string
  readonly websiteUrl?: string
  readonly notes?: string
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
    visaRequirements: { type: String },
    requiredDocuments: { type: [String], default: [] },
    gpaRequirement: { type: Number },
    ieltsRequirement: { type: Number },
    toeflRequirement: { type: Number },
    scholarshipAvailable: { type: Boolean, default: false },
    scholarshipDetails: { type: String },
    websiteUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
)

export const University = model<IUniversityDocument>(
  "University",
  universitySchema
)
