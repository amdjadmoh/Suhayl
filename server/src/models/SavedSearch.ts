import { Schema, model, type Document, Types } from "mongoose"

export type SavedSearchEntity = "program" | "university"

export interface ISavedSearch {
  userId: Types.ObjectId
  name: string
  entityType: SavedSearchEntity
  filters: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface ISavedSearchDocument extends ISavedSearch, Document {}

const savedSearchSchema = new Schema<ISavedSearchDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    entityType: {
      type: String,
      enum: ["program", "university"],
      required: true,
    },
    filters: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

savedSearchSchema.index({ userId: 1 })

export const SavedSearch = model<ISavedSearchDocument>(
  "SavedSearch",
  savedSearchSchema
)
