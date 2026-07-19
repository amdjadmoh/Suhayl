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
  testRequirements: { name: string; minimumScore: number }[]
  scholarshipAvailable: boolean
  scholarshipDetails?: string
  requiredDocuments: string[]
  requiresSOP: boolean
  recommendationLetters: number
  applicationFee?: number
  applicationDeadline?: Date
  programUrl?: string
  notes?: string
  createdBy?: Types.ObjectId
  isOfficial: boolean
  verificationStatus: "manual" | "ai" | "none"
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
    testRequirements: {
      type: [{ _id: false, name: String, minimumScore: Number }],
      default: [],
    },
    scholarshipAvailable: { type: Boolean, default: false },
    scholarshipDetails: { type: String },
    requiredDocuments: { type: [String], default: [] },
    requiresSOP: { type: Boolean, default: false },
    recommendationLetters: { type: Number, default: 0 },
    applicationFee: { type: Number },
    applicationDeadline: { type: Date },
    programUrl: { type: String },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isOfficial: { type: Boolean, default: true },
    verificationStatus: { type: String, enum: ["manual", "ai", "none"], default: "ai" },
  },
  { timestamps: true }
)

programSchema.index({ name: "text", notes: "text" })
programSchema.index({ degreeLevel: 1 })
programSchema.index({ isOfficial: 1 })
programSchema.index({ universityId: 1 })

export const Program = model<IProgramDocument>("Program", programSchema)
