import type { Resend } from "resend"

// ── Types ───────────────────────────────────────────────────────────────────

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailResult {
  ok: boolean
  error?: string
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export function isEmailEnabled(): boolean {
  return !!process.env["RESEND_API_KEY"]
}

// ── Send ────────────────────────────────────────────────────────────────────
// Calls Resend if RESEND_API_KEY is set, otherwise logs a warning.
// NEVER throws — email failures must not break the caller.

let _resend: Resend | null = null

function getResend(): Resend | null {
  if (_resend) return _resend
  const apiKey = process.env["RESEND_API_KEY"]
  if (!apiKey) return null
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Resend: R } = require("resend") as { Resend: new (key: string) => Resend }
  _resend = new R(apiKey)
  return _resend
}

export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  try {
    const resend = getResend()
    if (!resend) {
      console.warn("Email not sent: RESEND_API_KEY is not set")
      return { ok: false, error: "RESEND_API_KEY not set" }
    }

    const from = process.env["EMAIL_FROM"] ?? "WannaOut <noreply@wannaout.app>"

    // Build payload conditionally to satisfy exactOptionalPropertyTypes
    const payload: Record<string, string> = {
      from,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
    }
    if (msg.text) {
      payload["text"] = msg.text
    }
    await resend.emails.send(payload as any)

    return { ok: true }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error("Failed to send email:", errorMessage)
    return { ok: false, error: errorMessage }
  }
}
