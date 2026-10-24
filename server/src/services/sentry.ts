import * as Sentry from "@sentry/node"

// ── Init ─────────────────────────────────────────────────────────────────────

let _initialized = false

const SECRET_HEADERS = /^(authorization|cookie|set-cookie|x-api-key|proxy-authorization)$/i
const SECRET_KEYS = /pass(word)?|secret|token|credential|authorization|cookie|api[-_]?key/i

/** Replaces secret-looking values anywhere in an object, a few levels deep. */
function scrub(value: unknown, depth = 0): unknown {
  if (depth > 5 || value === null || typeof value !== "object") return value
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1))
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, SECRET_KEYS.test(k) ? "[scrubbed]" : scrub(v, depth + 1)]),
  )
}

type SentryEvent = Parameters<NonNullable<Sentry.NodeOptions["beforeSend"]>>[0]

/**
 * What leaves for Sentry: no request bodies (uploads, passwords, student data), no
 * cookies or auth headers, no query strings (reset and portal tokens travel in URLs),
 * and nothing secret-looking in extra context.
 */
export function scrubEvent<T extends Pick<SentryEvent, "request" | "user" | "extra" | "contexts">>(event: T): T {
  if (event.request) {
    delete event.request.data
    delete event.request.cookies
    delete event.request.query_string
    if (event.request.headers) {
      event.request.headers = Object.fromEntries(
        Object.entries(event.request.headers).filter(([name]) => !SECRET_HEADERS.test(name)),
      )
    }
    // Portal, invite and recommendation tokens are path segments
    if (event.request.url) {
      event.request.url = event.request.url.replace(/\/(portal|invite|public)\/[^/?#]+/g, "/$1/[token]").split("?")[0] ?? ""
    }
  }
  if (event.user) event.user = event.user.id !== undefined ? { id: event.user.id } : {}
  if (event.extra) event.extra = scrub(event.extra) as typeof event.extra
  if (event.contexts) event.contexts = scrub(event.contexts) as typeof event.contexts
  return event
}

export function initSentry(): void {
  const dsn = process.env["SENTRY_DSN"]
  if (!dsn) {
    console.warn("Sentry: SENTRY_DSN is not set — skipping initialization")
    return
  }

  Sentry.init({
    dsn,
    environment: process.env["NODE_ENV"] ?? "development",
    tracesSampleRate: 0.1,
    // No IP addresses, cookies or request bodies by default; scrubEvent removes the rest
    sendDefaultPii: false,
    beforeSend: (event) => scrubEvent(event),
    beforeSendTransaction: (event) => scrubEvent(event),
  })

  _initialized = true
  console.log("Sentry initialized")
}

// ── Capture ──────────────────────────────────────────────────────────────────

export function captureException(err: Error): void {
  if (!_initialized) return
  Sentry.captureException(err)
}
