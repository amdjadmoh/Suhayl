import { Schema, model, type Document } from "mongoose"

export interface ICountry {
  readonly name: string
  readonly currency: string
  readonly livingCostEstimate: number
  readonly visaBankAccountAmount: number
  readonly visaBankAccountLocked: boolean
  readonly pros: readonly string[]
  readonly cons: readonly string[]
  readonly notes?: string
  readonly visaType?: string
  readonly proofOfFundsMonthly?: number
  readonly whereToApply?: string
  readonly processingTime?: string
  readonly workPermit?: string
  readonly postGraduationVisa?: string
  readonly additionalVisaNotes?: string
  readonly requiredDocuments: readonly string[]
  readonly verificationStatus: "manual" | "ai" | "none"
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface ICountryDocument extends ICountry, Document {}

const countrySchema = new Schema<ICountryDocument>(
  {
    name: { type: String, required: true, unique: true },
    currency: { type: String, required: true, default: "EUR" },
    livingCostEstimate: { type: Number, required: true },
    visaBankAccountAmount: { type: Number, required: true },
    visaBankAccountLocked: { type: Boolean, required: true },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    notes: { type: String },
    visaType: { type: String },
    proofOfFundsMonthly: { type: Number },
    whereToApply: { type: String },
    processingTime: { type: String },
    workPermit: { type: String },
    postGraduationVisa: { type: String },
    additionalVisaNotes: { type: String },
    requiredDocuments: { type: [String], default: [] },
    verificationStatus: { type: String, enum: ["manual", "ai", "none"], default: "ai" },
  },
  { timestamps: true }
)

export const Country = model<ICountryDocument>("Country", countrySchema)
