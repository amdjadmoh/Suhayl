import { Schema, model, type Document } from "mongoose"

export type UserRole = "admin" | "student" | "agency"

export interface IUser {
  email: string
  passwordHash: string
  name: string
  role: UserRole
  preferredMonthlyBudget?: number
  gpa?: number
  ieltsScore?: number
  preferredCountries?: string[]
  preferredCurrency?: string
  createdAt: Date
  updatedAt: Date
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
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
  },
  { timestamps: true }
)

export const User = model<IUserDocument>("User", userSchema)
