import type { Request, Response, NextFunction } from "express"
import { User } from "../models/User"
import { verifySession } from "../services/tokens"

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string
        role: string
        /** Agency users: the agency's id (the owner's), for counsellors and owners alike */
        agencyId?: string
        /** Agency users: true for the owner, false for a counsellor */
        isAgencyOwner?: boolean
      }
    }
  }
}

type SessionUser = NonNullable<Request["user"]>
const resolved = new WeakMap<Request, Promise<SessionUser | null>>()

/**
 * The signed-in user for this request, read from the database: the account must
 * still exist, still have the role in the token, and the token's version must match
 * (a password change, reset, role change or removal bumps it). Resolved once per
 * request, so the rate limiter and authenticate share one lookup.
 */
export function sessionUser(req: Request): Promise<SessionUser | null> {
  let found = resolved.get(req)
  if (!found) {
    found = lookup(req)
    resolved.set(req, found)
  }
  return found
}

async function lookup(req: Request): Promise<SessionUser | null> {
  const header = req.headers["authorization"]
  if (!header?.startsWith("Bearer ")) return null
  const claims = verifySession(header.slice(7))
  if (!claims) return null
  const user = await User.findById(claims._id).select("role tokenVersion agencyOwnerId").lean().catch(() => null)
  if (!user || user.role !== claims.role || (user.tokenVersion ?? 0) !== claims.v) return null
  return {
    _id: String(user._id),
    role: user.role,
    ...(user.role === "agency" ? { agencyId: String(user.agencyOwnerId ?? user._id), isAgencyOwner: !user.agencyOwnerId } : {}),
  }
}

/** authenticate — requires a valid, current session; req.user comes from the database, not the token. */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers["authorization"]
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing or malformed authorization header" })
    return
  }
  const user = await sessionUser(req)
  if (!user) {
    res.status(401).json({ message: "Invalid or expired token" })
    return
  }
  req.user = user
  next()
}

/** optionalAuth — sets req.user for a valid, current session; anything else continues anonymously. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const user = await sessionUser(req)
  if (user) req.user = user
  else delete req.user
  next()
}

/** The agency whose data an agency user may see; for anyone else, their own id. */
export function agencyScope(req: Request): string {
  return req.user!.agencyId ?? req.user!._id
}

/**
 * authorize — factory that returns middleware enforcing role-based access.
 * Returns 403 if the authenticated user's role is not in the allowed list.
 */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" })
      return
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Insufficient permissions" })
      return
    }
    next()
  }
}

/** Ends every session this user has open, e.g. after a password change or a role change. */
export async function revokeSessions(userId: unknown): Promise<number> {
  const user = await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } }, { new: true }).select("tokenVersion")
  return user?.tokenVersion ?? 0
}
