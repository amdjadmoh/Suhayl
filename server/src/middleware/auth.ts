import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

declare global {
  namespace Express {
    interface Request {
      user?: { _id: string; role: string }
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
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers["authorization"]
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing or malformed authorization header" })
    return
  }

  const token = header.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.user = {
      _id: decoded._id,
      role: decoded.role,
    }
    next()
  } catch {
    res.status(401).json({ message: "Invalid or expired token" })
  }
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
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
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
  next()
}
