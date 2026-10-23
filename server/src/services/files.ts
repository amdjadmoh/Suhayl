import crypto from "crypto"
import fs from "fs/promises"
import path from "path"
import type { Readable } from "stream"
import type { Response } from "express"
import multer from "multer"
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

/*
 * Where uploaded documents are kept. Two drivers:
 *  - "local" (default): a folder on this server. Fine for development or a single
 *    server with a persistent volume mounted at UPLOAD_DIR.
 *  - "s3": any S3-compatible bucket (AWS S3, Cloudflare R2, Backblaze B2, MinIO),
 *    so files survive redeploys and server moves.
 */

const UPLOAD_DIR = process.env["UPLOAD_DIR"] ?? path.join(__dirname, "../../../data/uploads")
const DRIVER = process.env["STORAGE_DRIVER"] === "s3" ? "s3" : "local"
const BUCKET = process.env["S3_BUCKET"] ?? ""
const PREFIX = (process.env["S3_PREFIX"] ?? "documents/").replace(/^\/+/, "")

let s3: S3Client | null = null
function bucket(): S3Client {
  if (!s3) {
    s3 = new S3Client({
      // R2 and others accept "auto"; AWS needs the bucket's real region
      region: process.env["S3_REGION"] ?? "auto",
      ...(process.env["S3_ENDPOINT"] ? { endpoint: process.env["S3_ENDPOINT"] } : {}),
      forcePathStyle: process.env["S3_FORCE_PATH_STYLE"] === "true",
      credentials: {
        accessKeyId: process.env["S3_ACCESS_KEY_ID"] ?? "",
        secretAccessKey: process.env["S3_SECRET_ACCESS_KEY"] ?? "",
      },
    })
  }
  return s3
}

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

/** Accepts one file of up to 10 MB in memory; the handler decides whether to keep it. */
export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
})

/** True when the declared type is allowed and the bytes actually start like that type. */
export function isAllowedFile(mimeType: string, buffer: Buffer): boolean {
  if (!(mimeType in ALLOWED_TYPES)) return false
  const head = buffer.subarray(0, 12)
  switch (mimeType) {
    case "application/pdf":
      return head.subarray(0, 4).toString("latin1") === "%PDF"
    case "image/jpeg":
      return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff
    case "image/png":
      return head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    case "image/webp":
      return head.subarray(0, 4).toString("latin1") === "RIFF" && head.subarray(8, 12).toString("latin1") === "WEBP"
    default:
      return false
  }
}

// Stored names are generated here, but never let one walk out of its folder or prefix
const safeName = (storedName: string): string => path.basename(storedName)
const localPath = (storedName: string): string => path.join(UPLOAD_DIR, safeName(storedName))
const objectKey = (storedName: string): string => PREFIX + safeName(storedName)

/** Saves the bytes under a random name and returns that name. */
export async function storeFile(buffer: Buffer, mimeType: string): Promise<string> {
  const storedName = crypto.randomBytes(16).toString("hex") + (ALLOWED_TYPES[mimeType] ?? "")
  if (DRIVER === "s3") {
    await bucket().send(
      new PutObjectCommand({ Bucket: BUCKET, Key: objectKey(storedName), Body: buffer, ContentType: mimeType }),
    )
  } else {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    await fs.writeFile(localPath(storedName), buffer)
  }
  return storedName
}

export async function removeFile(storedName?: string): Promise<void> {
  if (!storedName) return
  if (DRIVER === "s3") {
    await bucket().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: objectKey(storedName) }))
  } else {
    await fs.rm(localPath(storedName), { force: true })
  }
}

/** Sends a stored file, or a clear 404 when it's gone from storage. */
export async function sendStoredFile(
  res: Response,
  file: { storedName: string; originalName: string; mimeType: string },
): Promise<void> {
  const missing = (): void => {
    res.status(404).json({ message: "This file is missing from storage. Ask for it again." })
  }
  try {
    if (DRIVER === "s3") {
      const object = await bucket().send(new GetObjectCommand({ Bucket: BUCKET, Key: objectKey(file.storedName) }))
      res.setHeader("Content-Type", file.mimeType)
      if (object.ContentLength) res.setHeader("Content-Length", String(object.ContentLength))
      res.attachment(file.originalName)
      ;(object.Body as Readable).pipe(res)
      return
    }
    await fs.access(localPath(file.storedName))
    res.setHeader("Content-Type", file.mimeType)
    res.attachment(file.originalName)
    res.sendFile(localPath(file.storedName))
  } catch {
    missing()
  }
}
