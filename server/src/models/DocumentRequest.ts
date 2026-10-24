import { Schema, model, type Document, Types } from "mongoose"

export const DOCUMENT_STATUSES = ["requested", "uploaded", "accepted", "rejected"] as const
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number]

export interface IStoredFile {
  storedName: string
  originalName: string
  mimeType: string
  size: number
  uploadedAt: Date
}

/** A document an agency asked a student for, and the file the family sent back. */
export interface IDocumentRequest {
  agencyId: Types.ObjectId
  studentId: Types.ObjectId
  title: string
  note?: string
  dueDate?: Date
  status: DocumentStatus
  rejectReason?: string
  file?: IStoredFile
  createdAt: Date
  updatedAt: Date
}

export interface IDocumentRequestDocument extends IDocumentRequest, Document {}

const documentRequestSchema = new Schema<IDocumentRequestDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    title: { type: String, required: true, trim: true },
    note: { type: String },
    dueDate: { type: Date },
    status: { type: String, enum: DOCUMENT_STATUSES, default: "requested" },
    rejectReason: { type: String },
    file: {
      type: new Schema<IStoredFile>(
        {
          storedName: { type: String, required: true },
          originalName: { type: String, required: true },
          mimeType: { type: String, required: true },
          size: { type: Number, required: true },
          uploadedAt: { type: Date, required: true },
        },
        {
          _id: false,
          // The storage key never leaves the server; files are fetched through the download routes
          toJSON: { transform: (_doc, ret: Partial<IStoredFile>) => { delete ret.storedName; return ret } },
        },
      ),
    },
  },
  { timestamps: true },
)

documentRequestSchema.index({ agencyId: 1, status: 1 })
documentRequestSchema.index({ studentId: 1, createdAt: 1 })

export const DocumentRequest = model<IDocumentRequestDocument>("DocumentRequest", documentRequestSchema)
