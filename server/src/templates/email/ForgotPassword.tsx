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

export interface ForgotPasswordProps {
  name?: string
  resetUrl: string
}

export default function ForgotPassword({ name, resetUrl }: ForgotPasswordProps) {
  const greeting = name ? `Hi ${name},` : "Hi,"

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
          <Heading
            style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 16px" }}
          >
            Reset your password
          </Heading>

          <Text style={{ fontSize: "16px", color: "#333", lineHeight: "1.5", margin: "0 0 8px" }}>
            {greeting}
          </Text>
          <Text style={{ fontSize: "16px", color: "#333", lineHeight: "1.5", margin: "0 0 24px" }}>
            We received a request to reset your Suhayl password. Click the button below to choose a new one.
            This link expires in <strong>1 hour</strong>.
          </Text>

          <Button
            href={resetUrl}
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
            Reset Password
          </Button>

          <Text style={{ fontSize: "14px", color: "#555", lineHeight: "1.5", margin: "0 0 24px" }}>
            If the button above doesn&apos;t work, copy and paste this link into your browser:
            <br />
            <a href={resetUrl} style={{ color: "#2563eb", wordBreak: "break-all" }}>{resetUrl}</a>
          </Text>

          <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 16px" }} />

          <Text style={{ fontSize: "12px", color: "#9ca3af", lineHeight: "1.5", margin: "0" }}>
            If you didn&apos;t request a password reset, you can safely ignore this email.
            Your password will not change.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
