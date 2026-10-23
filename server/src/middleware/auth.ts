import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { User } from "../models/User"

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

const JWT_SECRET: string = process.env["JWT_SECRET"]!

export interface JwtPayload {
  _id: string
  role: string
}

/**
 * authenticate — requires a valid Bearer token.
 * Attaches decoded payload to req.user on success.
 * Returns 401 if token is missing or invalid.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers["authorization"]
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing or malformed authorization header" })
    return
  }

  const token = header.slice(7)
  let decoded: JwtPayload
  try {
    decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    res.status(401).json({ message: "Invalid or expired token" })
    return
  }
  req.user = { _id: decoded._id, role: decoded.role }
  if (decoded.role === "agency" && !(await attachAgency(req))) {
    res.status(401).json({ message: "This account no longer has access" })
    return
  }
  next()
}

/**
 * Agency users act for one agency: their own if they own it, the owner's if they're a
 * counsellor. Looked up per request so a removed counsellor loses access straight away.
 */
async function attachAgency(req: Request): Promise<boolean> {
  const user = await User.findById(req.user!._id).select("agencyOwnerId")
  if (!user) return false
  req.user!.agencyId = String(user.agencyOwnerId ?? user._id)
  req.user!.isAgencyOwner = !user.agencyOwnerId
  return true
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

/**
 * optionalAuth — verifies token if present, but does not fail if absent.
 * Useful for endpoints that work differently for authenticated vs anonymous users.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers["authorization"]
  if (!header || !header.startsWith("Bearer ")) {
    next()
    return
  }

  const token = header.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.user = {
      _id: decoded._id,
      role: decoded.role,
    }
  } catch {
    // Token invalid — silently continue without user
  }
  if (req.user?.role === "agency" && !(await attachAgency(req))) delete req.user
  next()
}
