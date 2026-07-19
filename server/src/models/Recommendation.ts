import { Schema, model, type Document, Types } from "mongoose"
import crypto from "crypto"

// ── Types ────────────────────────────────────────────────────────────────────

export type RecommendationStatus = "invited" | "submitted" | "declined"

export interface IRecommendation {
  applicationId: Types.ObjectId
  studentName: string
  studentEmail: string
  programName: string
  recommenderName: string
  recommenderEmail: string
  status: RecommendationStatus
  token: string
  letterText: string
  submittedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IRecommendationDocument
  extends IRecommendation,
    Document {}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// ── Schema ───────────────────────────────────────────────────────────────────

const recommendationSchema = new Schema<IRecommendationDocument>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    programName: { type: String, required: true },
    recommenderName: { type: String, required: true },
    recommenderEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ["invited", "submitted", "declined"] as RecommendationStatus[],
      default: "invited",
    },
    token: {
      type: String,
      required: true,
      unique: true,
      default: generateToken,
    },
    letterText: { type: String, default: "" },
    submittedAt: { type: Date },
  },
  { timestamps: true }
)

// ── Indexes ──────────────────────────────────────────────────────────────────

recommendationSchema.index({ applicationId: 1 })
recommendationSchema.index({ token: 1 }, { unique: true })

// ── Exports ──────────────────────────────────────────────────────────────────

export const Recommendation = model<IRecommendationDocument>(
  "Recommendation",
  recommendationSchema
)
