import { Schema, model, type Document } from "mongoose"

export interface ICity {
  readonly name: string
  readonly country: string
  readonly population?: number
  readonly isCapital: boolean
  readonly averageRentSingle: number
  readonly averageRentShared: number
  readonly monthlyLivingCost: number
  readonly qualityOfLifeScore: number
  readonly safetyScore: number
  readonly publicTransportScore: number
  readonly studentFriendliness: number
  readonly internetSpeed?: number
  readonly language: string
  readonly englishFriendliness: number
  readonly climate: string
  readonly pros: readonly string[]
  readonly cons: readonly string[]
  readonly notes?: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface ICityDocument extends ICity, Document {}

const citySchema = new Schema<ICityDocument>(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    population: { type: Number },
    isCapital: { type: Boolean, default: false },
    averageRentSingle: { type: Number, required: true },
    averageRentShared: { type: Number, required: true },
    monthlyLivingCost: { type: Number, required: true },
    qualityOfLifeScore: { type: Number, required: true },
    safetyScore: { type: Number, required: true },
    publicTransportScore: { type: Number, required: true },
    studentFriendliness: { type: Number, required: true },
    internetSpeed: { type: Number },
    language: { type: String, required: true },
    englishFriendliness: { type: Number, required: true },
    climate: { type: String, required: true },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    notes: { type: String },
  },
  { timestamps: true }
)

citySchema.index({ name: 1, country: 1 }, { unique: true })

export const City = model<ICityDocument>("City", citySchema)
