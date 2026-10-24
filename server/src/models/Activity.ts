import { Schema, model, type Document, Types } from "mongoose"

/** One thing someone did in an agency: who, to which student, what. */
export interface IActivity {
  agencyId: Types.ObjectId
  studentId?: Types.ObjectId
  /** Empty when the family did it through their link */
  actorId?: Types.ObjectId
  actorName: string
  /** The line in English, for exports and older readers */
  action: string
  /** The same line as an English template plus its values, so each reader sees it in their language */
  template?: string
  vars?: Record<string, string>
  createdAt: Date
}

export interface IActivityDocument extends IActivity, Document {}

const activitySchema = new Schema<IActivityDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student" },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    actorName: { type: String, required: true },
    action: { type: String, required: true },
    template: { type: String },
    vars: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

activitySchema.index({ agencyId: 1, createdAt: -1 })
activitySchema.index({ studentId: 1, createdAt: -1 })

export const Activity = model<IActivityDocument>("Activity", activitySchema)
