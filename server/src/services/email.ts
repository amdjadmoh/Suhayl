import nodemailer, { type Mail } from "nodemailer"

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

function isDevelopment(): boolean {
  return (process.env["NODE_ENV"] ?? "development") === "development"
}

export function isEmailEnabled(): boolean {
  return !!(process.env["SMTP_USER"] && process.env["SMTP_PASS"])
}

// ── Transport (lazy singleton) ───────────────────────────────────────────────

let _transporter: Mail | null = null

/** SMTP settings from the environment, or null when email is off. Credentials only ever come from env. */
export function smtpOptions() {
  const user = process.env["SMTP_USER"]
  const pass = process.env["SMTP_PASS"]
  if (!user || !pass) return null
  const port = Number(process.env["SMTP_PORT"] ?? 587)
  // 465 is TLS from the start; 587 and 25 must upgrade with STARTTLS
  const secure = process.env["SMTP_SECURE"] ? process.env["SMTP_SECURE"] === "true" : port === 465
  // Only a local test server in development may skip TLS (e.g. MailHog); credentials never go out in clear otherwise
  const allowPlain = isDevelopment() && process.env["SMTP_REQUIRE_TLS"] === "false"
  return {
    host: process.env["SMTP_HOST"] ?? "smtp.gmail.com",
    port,
    secure,
    requireTLS: !secure && !allowPlain,
    tls: { minVersion: "TLSv1.2" as const, rejectUnauthorized: true },
    auth: { user, pass },
    logger: false,
    debug: false,
  }
}

function getTransporter(): Mail | null {
  if (_transporter) return _transporter
  const options = smtpOptions()
  if (!options) return null
  _transporter = nodemailer.createTransport(options)
  return _transporter
}

// ── Send ─────────────────────────────────────────────────────────────────────
// NEVER throws — email failures must not break the caller.

export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  try {
    const transporter = getTransporter()
    if (!transporter) {
      if (isDevelopment()) {
        // Development only: print the email so its links (resets, invites) can still be followed.
        // Never in production, staging or tests, where the body holds live reset links.
        console.log(`
── Email (not sent, SMTP is off) ──
To: ${msg.to}
Subject: ${msg.subject}
${msg.text ?? msg.html.replace(/<[^>]+>/g, " ")}
──
`)
      } else {
        console.warn("Email not sent: SMTP_USER / SMTP_PASS not set")
      }
      return { ok: false, error: "SMTP credentials not configured" }
    }

    const from = process.env["EMAIL_FROM"] ?? "Suhayl <suhayl@suhayl.online>"

    await transporter.sendMail({
      from,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      ...(msg.text ? { text: msg.text } : {}),
    })

    return { ok: true }
  } catch (err: unknown) {
    // The code and response line only: never the message, the recipient or the credentials
    const e = err as { code?: string; responseCode?: number; message?: string }
    const errorMessage = e.code ? `${e.code}${e.responseCode ? ` ${e.responseCode}` : ""}` : "send failed"
    console.error("Failed to send email:", errorMessage)
    return { ok: false, error: errorMessage }
  }
}
