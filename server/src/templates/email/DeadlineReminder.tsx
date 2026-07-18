import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components"

// ── Props ───────────────────────────────────────────────────────────────────

export interface DeadlineReminderProps {
  studentName?: string
  programName: string
  daysLeft: number
  applicationUrl: string
}

// ── Component ───────────────────────────────────────────────────────────────

export default function DeadlineReminder({
  studentName,
  programName,
  daysLeft,
  applicationUrl,
}: DeadlineReminderProps) {
  const greeting = studentName ? `Hi ${studentName},` : "Hi,"
  const dayLabel = daysLeft === 1 ? "day" : "days"

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, Helvetica, sans-serif", backgroundColor: "#f4f4f4", padding: "40px 0" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "40px 32px",
            maxWidth: "560px",
            margin: "0 auto",
          }}
        >
          {/* ── Header ────────────────────────────────────────────*/}
          <Heading
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#1a1a1a",
              margin: "0 0 16px",
            }}
          >
            Application deadline approaching
          </Heading>

          {/* ── Body ──────────────────────────────────────────────*/}
          <Text style={{ fontSize: "16px", color: "#333", lineHeight: "1.5", margin: "0 0 8px" }}>
            {greeting}
          </Text>
          <Text style={{ fontSize: "16px", color: "#333", lineHeight: "1.5", margin: "0 0 24px" }}>
            Your application to <strong>{programName}</strong> is due in{" "}
            <strong>
              {daysLeft} {dayLabel}
            </strong>
            .
          </Text>

          {/* ── CTA ───────────────────────────────────────────────*/}
          <Button
            href={applicationUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "600",
              padding: "12px 28px",
              borderRadius: "6px",
              textDecoration: "none",
              marginBottom: "24px",
            }}
          >
            View Application
          </Button>

          <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 16px" }} />

          {/* ── Footer ────────────────────────────────────────────*/}
          <Text
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              lineHeight: "1.5",
              margin: "0",
            }}
          >
            You&apos;re receiving this because you have a tracked application on WannaOut.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
