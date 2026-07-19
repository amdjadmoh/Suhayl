import * as Sentry from "@sentry/react"

// ── Init ─────────────────────────────────────────────────────────────────────

let _initialized = false

export function initSentry(): void {
  const dsn = import.meta.env["VITE_SENTRY_DSN"] as string | undefined
  if (!dsn) {
    console.warn("Sentry: VITE_SENTRY_DSN is not set — skipping initialization")
    return
  }

  Sentry.init({
    dsn,
    environment: import.meta.env["MODE"] as string | undefined,
    tracesSampleRate: 0.1,
  })

  _initialized = true
}

// ── Capture ──────────────────────────────────────────────────────────────────

export function captureException(err: Error): void {
  if (!_initialized) return
  Sentry.captureException(err)
}
