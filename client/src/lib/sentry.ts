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
    sendDefaultPii: false,
    // Reset, invite and family-link tokens travel in URLs; never send them, or any request body
    beforeSend(event) {
      if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
        delete event.request.query_string;
        if (event.request.url) event.request.url = event.request.url.replace(/\/(portal|join|recommendation)\/[^/?#]+/g, "/$1/[token]").split("?")[0];
      }
      return event;
    },
  })

  _initialized = true
}

// ── Capture ──────────────────────────────────────────────────────────────────

export function captureException(err: Error): void {
  if (!_initialized) return
  Sentry.captureException(err)
}
