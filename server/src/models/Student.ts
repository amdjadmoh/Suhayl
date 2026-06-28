import { Schema, model, type Document, Types } from "mongoose"

export interface IStudent {
  name: string
  email: string
  phone?: string
  notes?: string
  agencyId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface IStudentDocument extends IStudent, Document {}

const studentSchema = new Schema<IStudentDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    notes: { type: String },
    agencyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
)

studentSchema.index({ email: 1, agencyId: 1 }, { unique: true })

export const Student = model<IStudentDocument>("Student", studentSchema)
