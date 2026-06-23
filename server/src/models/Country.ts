import { Schema, model, type Document } from "mongoose"

export interface ICountry {
  readonly name: string
  readonly currency: string
  readonly livingCostEstimate: number
  readonly visaRequirements: string
  readonly visaAcceptanceRate: number
  readonly visaBankAccountAmount: number
  readonly visaBankAccountLocked: boolean
  readonly pros: readonly string[]
  readonly cons: readonly string[]
  readonly notes?: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface ICountryDocument extends ICountry, Document {}

const countrySchema = new Schema<ICountryDocument>(
  {
    name: { type: String, required: true, unique: true },
    currency: { type: String, required: true, default: "EUR" },
    livingCostEstimate: { type: Number, required: true },
    visaRequirements: { type: String, required: true },
    visaAcceptanceRate: { type: Number, required: true },
    visaBankAccountAmount: { type: Number, required: true },
    visaBankAccountLocked: { type: Boolean, required: true },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    notes: { type: String },
  },
  { timestamps: true }
)

export const Country = model<ICountryDocument>("Country", countrySchema)
