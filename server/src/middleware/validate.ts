import { type ZodType } from "zod"
import type { Request, Response, NextFunction } from "express"

/**
 * Middleware factory that validates `req[target]` against a Zod schema.
 * On success, replaces the target with the parsed (stripped) value.
 * On failure, returns 400 with field-level error details.
 *
 * @example
 *   router.post("/", validate(createSchema, "body"), controller)
 *   router.get("/", validate(listQuerySchema, "query"), controller)
 */
export function validate<T>(
  schema: ZodType<T>,
  target: "body" | "query" | "params"
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((i) => ({
          path: i.path,
          message: i.message,
        })),
      })
      return
    }
    // Replace the target with the parsed (stripped / coerced) data.
    // Express 5 defines `req.query` and `req.params` as getter-only properties
    // on the prototype, so a plain assignment throws. Use Object.defineProperty
    // to shadow the prototype getter with a writable instance property.
    // `req.body` is a plain instance property and works either way; we use the
    // same path for uniformity.
    Object.defineProperty(req, target, {
      value: result.data,
      writable: true,
      configurable: true,
    })
    next()
  }
}
