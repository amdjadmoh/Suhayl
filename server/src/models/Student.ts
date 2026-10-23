import { Schema, model, type Document, Types } from "mongoose"

/** Something a counsellor has to do for this student, e.g. "Call the parents about the deposit". */
export interface IStudentTask {
  _id: Types.ObjectId
  text: string
  dueDate?: Date
  done: boolean
  doneAt?: Date
  createdAt: Date
}

/** Money the family has paid the agency. */
export interface IStudentPayment {
  _id: Types.ObjectId
  amount: number
  paidAt: Date
  method?: string
  note?: string
}

export interface IStudent {
  name: string
  email: string
  phone?: string
  notes?: string
  // Academic profile, used to match programs to the student
  gpa?: number
  ieltsScore?: number
  monthlyBudget?: number
  preferredCountries?: string[]
  degreeLevel?: string
  targetIntake?: string
  // Private link the student and family use to follow progress and upload documents
  portalToken?: string
  portalEnabledAt?: Date
  // The link stops working after this; agencies can extend it
  portalExpiresAt?: Date
  // The agency's own work and money for this student
  tasks: IStudentTask[]
  feeAgreed?: number
  feeCurrency: string
  payments: IStudentPayment[]
  // The counsellor looking after this student; unassigned when empty
  counsellorId?: Types.ObjectId
  agencyId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface IStudentDocument extends IStudent, Document {}

const studentSchema = new Schema<IStudentDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    notes: { type: String },
    gpa: { type: Number },
    ieltsScore: { type: Number },
    monthlyBudget: { type: Number },
    preferredCountries: { type: [String], default: undefined },
    degreeLevel: { type: String },
    targetIntake: { type: String },
    portalToken: { type: String },
    portalEnabledAt: { type: Date },
    portalExpiresAt: { type: Date },
    tasks: {
      type: [
        new Schema<IStudentTask>({
          text: { type: String, required: true, trim: true },
          dueDate: { type: Date },
          done: { type: Boolean, default: false },
          doneAt: { type: Date },
          createdAt: { type: Date, default: Date.now },
        }),
      ],
      default: [],
    },
    feeAgreed: { type: Number, min: 0 },
    feeCurrency: { type: String, default: "DZD" },
    payments: {
      type: [
        new Schema<IStudentPayment>({
          amount: { type: Number, required: true, min: 0 },
          paidAt: { type: Date, required: true },
          method: { type: String, trim: true },
          note: { type: String, trim: true },
        }),
      ],
      default: [],
    },
    counsellorId: { type: Schema.Types.ObjectId, ref: "User" },
    agencyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
)

studentSchema.index({ email: 1, agencyId: 1 }, { unique: true })
studentSchema.index({ portalToken: 1 }, { unique: true, sparse: true })

export const Student = model<IStudentDocument>("Student", studentSchema)
