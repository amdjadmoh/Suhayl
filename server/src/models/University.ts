import { Schema, model, type Document, Types } from "mongoose"

export interface IUniversity {
  readonly name: string
  readonly country: string
  readonly city: string
  readonly ranking?: number
  readonly websiteUrl?: string
  readonly notes?: string
  readonly createdBy?: Types.ObjectId
  readonly isOfficial: boolean
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
    websiteUrl: { type: String },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isOfficial: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const University = model<IUniversityDocument>(
  "University",
  universitySchema
)
