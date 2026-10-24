import crypto from "crypto"
import jwt from "jsonwebtoken"

/*
 * Session tokens. Each carries the user's tokenVersion as `v`; bumping the version
 * in the database (password change, reset, role change, removal) ends every
 * session issued before it, because authenticate compares the two on each request.
 */

const PLACEHOLDER = /change_?me|placeholder|your[_-]?secret|example|secret_here|replace/i

/** Why a JWT secret can't be used, or null when it's fine. Never includes the secret itself. */
export function jwtSecretProblem(secret: string | undefined): string | null {
  if (!secret) return "JWT_SECRET is not set"
  if (Buffer.byteLength(secret, "utf8") < 32) return "JWT_SECRET must be at least 32 bytes"
  if (PLACEHOLDER.test(secret)) return "JWT_SECRET still holds a placeholder value"
  if (new Set(secret).size < 10) return "JWT_SECRET is not random enough"
  return null
}

/** The signing secret. Throws when it is missing or weak, so nothing is ever signed with a fallback. */
export function jwtSecret(): string {
  const secret = process.env["JWT_SECRET"]
  const problem = jwtSecretProblem(secret)
  if (problem) throw new Error(`${problem}. Generate one with: openssl rand -hex 32`)
  return secret!
}

export interface SessionClaims {
  _id: string
  role: string
  /** tokenVersion of the user when the token was issued */
  v: number
}

export function signSession(user: { _id: unknown; role: string; tokenVersion?: number }): string {
  const claims: SessionClaims = { _id: String(user._id), role: user.role, v: user.tokenVersion ?? 0 }
  return jwt.sign(claims, jwtSecret(), { expiresIn: "7d", algorithm: "HS256" })
}

/** Verified claims, or null for a bad signature, an expired token or a token without a version. */
export function verifySession(token: string): SessionClaims | null {
  try {
    const decoded = jwt.verify(token, jwtSecret(), { algorithms: ["HS256"] }) as Partial<SessionClaims>
    if (typeof decoded._id !== "string" || typeof decoded.role !== "string" || typeof decoded.v !== "number") return null
    return { _id: decoded._id, role: decoded.role, v: decoded.v }
  } catch {
    return null
  }
}

/** One-way hash for tokens we store (password resets), so a database leak doesn't leak usable links. */
export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex")
}
