import { Schema, model, type Document, Types } from "mongoose"

export type FavoriteType = "country" | "city" | "university" | "program"

export interface IFavorite {
  userId: Types.ObjectId
  type: FavoriteType
  itemId: Types.ObjectId  // the _id of the favorited entity
  createdAt: Date
  updatedAt: Date
}

export interface IFavoriteDocument extends IFavorite, Document {}

const favoriteSchema = new Schema<IFavoriteDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["country", "city", "university", "program"], required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
)

favoriteSchema.index({ userId: 1, type: 1, itemId: 1 }, { unique: true })

export const Favorite = model<IFavoriteDocument>("Favorite", favoriteSchema)
