import * as Sentry from "@sentry/node"

// ── Init ─────────────────────────────────────────────────────────────────────

let _initialized = false

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
  })

  _initialized = true
  console.log("Sentry initialized")
}

// ── Capture ──────────────────────────────────────────────────────────────────

export function captureException(err: Error): void {
  if (!_initialized) return
  Sentry.captureException(err)
}
