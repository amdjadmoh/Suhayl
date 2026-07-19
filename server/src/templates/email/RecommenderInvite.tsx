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

// ── Props ────────────────────────────────────────────────────────────────────

export interface RecommenderInviteProps {
  studentName: string
  programName: string
  recommenderName: string
  submitUrl: string
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RecommenderInvite({
  studentName,
  programName,
  recommenderName,
  submitUrl,
}: RecommenderInviteProps) {
  return (
    <Html>
      <Head />
      <Body
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          backgroundColor: "#f4f4f4",
          padding: "40px 0",
        }}
      >
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
            Letter of Recommendation Request
          </Heading>

          {/* ── Body ──────────────────────────────────────────────*/}
          <Text
            style={{
              fontSize: "16px",
              color: "#333",
              lineHeight: "1.5",
              margin: "0 0 8px",
            }}
          >
            Dear {recommenderName},
          </Text>
          <Text
            style={{
              fontSize: "16px",
              color: "#333",
              lineHeight: "1.5",
              margin: "0 0 24px",
            }}
          >
            {studentName} has requested a letter of recommendation for{" "}
            <strong>{programName}</strong>. Click the button below to submit your
            letter.
          </Text>

          {/* ── CTA ───────────────────────────────────────────────*/}
          <Button
            href={submitUrl}
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
            Submit Recommendation
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
            You&apos;re receiving this because {studentName} has requested you
            as a recommender on WannaOut.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
