import { Schema, model, type Document, Types } from "mongoose"

const DEGREE_LEVELS = ["Bachelor", "Master", "PhD", "Diploma"] as const
const TUITION_PERIODS = ["Year", "Semester", "Total"] as const

export interface IProgram {
  name: string
  universityId: Types.ObjectId
  degreeLevel: (typeof DEGREE_LEVELS)[number]
  languageOfInstruction: string
  tuitionFee: number
  tuitionCurrency: string
  tuitionPeriod: (typeof TUITION_PERIODS)[number]
  gpaRequirement?: number
  ieltsRequirement?: number
  toeflRequirement?: number
  scholarshipAvailable: boolean
  scholarshipDetails?: string
  requiredDocuments: string[]
  applicationDeadline?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface IProgramDocument extends IProgram, Document {}

const programSchema = new Schema<IProgramDocument>(
  {
    name: { type: String, required: true },
    universityId: { type: Schema.Types.ObjectId, ref: "University", required: true },
    degreeLevel: { type: String, enum: DEGREE_LEVELS, required: true },
    languageOfInstruction: { type: String, default: "English" },
    tuitionFee: { type: Number, required: true },
    tuitionCurrency: { type: String, default: "EUR" },
    tuitionPeriod: { type: String, enum: TUITION_PERIODS, default: "Year" },
    gpaRequirement: { type: Number },
    ieltsRequirement: { type: Number },
    toeflRequirement: { type: Number },
    scholarshipAvailable: { type: Boolean, default: false },
    scholarshipDetails: { type: String },
    requiredDocuments: { type: [String], default: [] },
    applicationDeadline: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
)

export const Program = model<IProgramDocument>("Program", programSchema)
