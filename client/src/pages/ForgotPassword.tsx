import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/kit";

export default function ForgotPassword(): React.ReactElement {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      kicker="Password"
      title={sent ? "Check your inbox" : "Forgot your password?"}
      subtitle={
        sent
          ? "If that address has an account, a reset link is on its way. It can take a few minutes — and sometimes it lands in spam."
          : "Tell us the email you signed up with and we'll send a link to choose a new password."
      }
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="link-ink">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-5">
          <p className="rounded-2xl bg-moss-soft px-4 py-3 text-sm text-ink-2">
            Sent to <span className="font-medium text-ink">{email}</span>
          </p>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <FormError>{error}</FormError>}
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10"
            />
          </Field>
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? "Sending…" : "Send the link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
