import { Schema, model, type Document } from "mongoose"

export interface IPasswordResetToken extends Document {
  userId: Schema.Types.ObjectId
  token: string
  expiresAt: Date
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
})

// Auto-delete expired tokens via MongoDB TTL index
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const PasswordResetToken = model<IPasswordResetToken>("PasswordResetToken", passwordResetTokenSchema)
