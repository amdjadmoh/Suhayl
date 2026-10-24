/*
 * Settings read from the environment, checked once at startup. In production a
 * missing or weak value stops the server with a clear message instead of failing
 * later in front of a user.
 */

import { jwtSecretProblem } from "./services/tokens"

export const isProduction = process.env["NODE_ENV"] === "production"

/** Public address of the web app, used in every link we send (resets, invites, family links). */
export function appUrl(): string {
  return (process.env["APP_URL"] ?? process.env["CLIENT_URL"] ?? "http://localhost:5173").replace(/\/+$/, "")
}

/** Host and database name only: a connection string can carry a username and password. */
export function describeMongoUri(uri: string): string {
  try {
    const u = new URL(uri)
    return `${u.protocol}//${u.host}${u.pathname}`
  } catch {
    return "(unparseable MONGODB_URI)"
  }
}

export function checkConfig(): void {
  // Every environment signs real tokens, so none may run on a missing or guessable secret
  const secretProblem = jwtSecretProblem(process.env["JWT_SECRET"])
  if (!isProduction) {
    if (secretProblem) throw new Error(`The server can't start:\n  - ${secretProblem}. Generate one with: openssl rand -hex 32`)
    return
  }
  const problems: string[] = []
  if (secretProblem) problems.push(`${secretProblem} (generate one with: openssl rand -hex 32)`)
  if (!process.env["MONGODB_URI"]) problems.push("MONGODB_URI must point at your production database")
  if (!process.env["CORS_ORIGINS"]) problems.push("CORS_ORIGINS must list the web app's address")
  if (!process.env["APP_URL"]) problems.push("APP_URL must be the web app's public address, e.g. https://suhayl.online")
  if (process.env["STORAGE_DRIVER"] === "s3") {
    for (const key of ["S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"]) {
      if (!process.env[key]) problems.push(`${key} is required when STORAGE_DRIVER=s3`)
    }
  }
  if (problems.length) {
    throw new Error("The server can't start in production:\n  - " + problems.join("\n  - "))
  }
  if (!process.env["SMTP_USER"] || !process.env["SMTP_PASS"]) {
    console.warn("WARNING: email is off (SMTP_USER/SMTP_PASS unset). Password resets and invites won't be emailed.")
  }
  if (process.env["STORAGE_DRIVER"] !== "s3") {
    console.warn("WARNING: uploads are stored on this server's disk. Mount UPLOAD_DIR on a persistent volume, or set STORAGE_DRIVER=s3.")
  }
}
