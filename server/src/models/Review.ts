import { Schema, model, type Document, Types } from "mongoose"

const TARGET_TYPES = ["university", "program"] as const
export type ReviewTargetType = (typeof TARGET_TYPES)[number]

export interface IReview {
  targetType: ReviewTargetType
  targetId: Types.ObjectId
  userId: Types.ObjectId
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

export interface IReviewDocument extends IReview, Document {}

const reviewSchema = new Schema<IReviewDocument>(
  {
    targetType: { type: String, enum: TARGET_TYPES, required: true },
    // Plain ObjectId — the target collection is resolved via targetType.
    targetId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
)

// One review per user per target
reviewSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true })
reviewSchema.index({ targetType: 1, targetId: 1, createdAt: -1 })

export const Review = model<IReviewDocument>("Review", reviewSchema)
