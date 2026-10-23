import nodemailer from "nodemailer"

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
  return !!(process.env["SMTP_USER"] && process.env["SMTP_PASS"])
}

// ── Transport (lazy singleton) ───────────────────────────────────────────────

let _transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (_transporter) return _transporter
  const user = process.env["SMTP_USER"]
  const pass = process.env["SMTP_PASS"]
  if (!user || !pass) return null
  _transporter = nodemailer.createTransport({
    host: process.env["SMTP_HOST"] ?? "smtp.gmail.com",
    port: Number(process.env["SMTP_PORT"] ?? 587),
    // 465 is TLS from the start; 587 and 25 upgrade with STARTTLS
    secure: process.env["SMTP_SECURE"] ? process.env["SMTP_SECURE"] === "true" : Number(process.env["SMTP_PORT"] ?? 587) === 465,
    auth: { user, pass },
  })
  return _transporter
}

// ── Send ─────────────────────────────────────────────────────────────────────
// NEVER throws — email failures must not break the caller.

export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  try {
    const transporter = getTransporter()
    if (!transporter) {
      if (process.env["NODE_ENV"] !== "production") {
        // In development, print the email so its links (resets, invites) can still be followed
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
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error("Failed to send email:", errorMessage)
    return { ok: false, error: errorMessage }
  }
}
