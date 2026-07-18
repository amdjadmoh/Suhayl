import { Schema, model, type Document, Types } from "mongoose"

export interface INotification {
  userId: Types.ObjectId
  type: "deadline" | "status_change" | "system"
  title: string
  message: string
  link?: string       // e.g. "/applications/abc123"
  read: boolean
  createdAt: Date
  updatedAt: Date
}

export interface INotificationDocument extends INotification, Document {}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["deadline", "status_change", "system"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

export const Notification = model<INotificationDocument>("Notification", notificationSchema)
