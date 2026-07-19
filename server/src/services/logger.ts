import pino from "pino"

// ── Logger ───────────────────────────────────────────────────────────────────

export const logger = pino({
  level: process.env["LOG_LEVEL"] ?? "info",
})
