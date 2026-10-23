import { Schema, model, type Document, Types } from "mongoose"

export type UserRole = "admin" | "student" | "agency"

export interface IUser {
  email: string
  passwordHash?: string
  googleId?: string
  name: string
  role: UserRole
  preferredMonthlyBudget?: number
  gpa?: number
  ieltsScore?: number
  preferredCountries?: string[]
  preferredCurrency?: string
  // Set on counsellors: the agency owner whose students they work on
  agencyOwnerId?: Types.ObjectId
  // One-time code a new counsellor uses to set their password
  inviteToken?: string
  invitedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false, select: false },
    googleId: { type: String, select: false },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "student", "agency"],
      required: true,
    },
    preferredMonthlyBudget: { type: Number },
    gpa: { type: Number },
    ieltsScore: { type: Number },
    preferredCountries: { type: [String] },
    preferredCurrency: { type: String },
    agencyOwnerId: { type: Schema.Types.ObjectId, ref: "User" },
    inviteToken: { type: String, select: false },
    invitedAt: { type: Date },
  },
  { timestamps: true }
)

userSchema.index({ agencyOwnerId: 1 })
userSchema.index({ inviteToken: 1 }, { sparse: true })

export const User = model<IUserDocument>("User", userSchema)
