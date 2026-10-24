import type { Request, RequestHandler } from "express"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import { rateLimitStore } from "../services/rateLimitStore"
import { sessionUser } from "./auth"

/*
 * Rate limits. A limit is only ever keyed by a user id after the token has been
 * verified against the database (sessionUser), so a forged or revoked token can't
 * claim someone else's allowance or a fresh one per request: it counts by IP.
 */

const MESSAGE = { message: "Too many requests, please try again later." }
const ip = (req: Request): string => ipKeyGenerator(req.ip ?? "")

interface LimitOptions {
  name: string
  windowMs: number
  limit: number | ((req: Request) => Promise<number> | number)
  key?: (req: Request) => Promise<string> | string
  /** Count only failed attempts, e.g. wrong passwords */
  onlyFailures?: boolean
}

export function limiter({ name, windowMs, limit, key = ip, onlyFailures = false }: LimitOptions): RequestHandler {
  return rateLimit({
    windowMs,
    limit,
    keyGenerator: key,
    ...rateLimitStore(name),
    skipSuccessfulRequests: onlyFailures,
    standardHeaders: true,
    legacyHeaders: false,
    message: MESSAGE,
  })
}

/** A verified signed-in user is counted on their own; everyone else by IP. */
async function userOrIp(req: Request): Promise<string> {
  const user = await sessionUser(req)
  return user ? `user:${user._id}` : ip(req)
}

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

/** Every limiter the app mounts. Made per app, so each app (and each test) has its own counters. */
export function createLimiters() {
  /** Every API request. Signed-in people each get their own allowance, so an agency office behind one IP isn't throttled as one. */
  const globalLimiter = limiter({
    name: "global",
    windowMs: 15 * MINUTE,
    limit: async (req) => ((await sessionUser(req)) ? 1500 : 300),
    key: userOrIp,
  })

  /** Password sign-in and sign-up: wrong attempts only */
  const credentialLimiter = limiter({ name: "auth", windowMs: 15 * MINUTE, limit: 10, onlyFailures: true })

  /** Google sign-in: every attempt counts, since a bad credential is cheap to send */
  const googleLimiter = limiter({ name: "google", windowMs: 15 * MINUTE, limit: 20 })

  /** Reset emails: few per IP, and few per address so nobody can flood someone's inbox from many IPs */
  const forgotPasswordLimiter = limiter({ name: "forgot", windowMs: HOUR, limit: 5 })
  const forgotPasswordPerEmail = limiter({
    name: "forgot-email",
    windowMs: HOUR,
    limit: 3,
    key: (req) => `email:${String((req.body as { email?: unknown })?.email ?? "").trim().toLowerCase().slice(0, 254)}`,
  })

  /** Reset links: guessing a token should be slow */
  const resetPasswordLimiter = limiter({ name: "reset", windowMs: 15 * MINUTE, limit: 10 })

  /** Team invite links: reading and accepting */
  const inviteLimiter = limiter({ name: "invite", windowMs: 15 * MINUTE, limit: 20 })

  /** Sending recommendation requests emails a third party, so it's counted per signed-in user */
  const recommendationInviteLimiter = limiter({ name: "rec-invite", windowMs: HOUR, limit: 20, key: userOrIp })

  /** The public recommender pages: reading and submitting a letter */
  const recommendationPublicLimiter = limiter({ name: "rec-public", windowMs: 15 * MINUTE, limit: 30 })

  /** Family links: guessing and upload floods */
  const portalLimiter = limiter({ name: "portal", windowMs: 15 * MINUTE, limit: 120 })

  return {
    globalLimiter,
    credentialLimiter,
    googleLimiter,
    forgotPasswordLimiter,
    forgotPasswordPerEmail,
    resetPasswordLimiter,
    inviteLimiter,
    recommendationInviteLimiter,
    recommendationPublicLimiter,
    portalLimiter,
  }
}
