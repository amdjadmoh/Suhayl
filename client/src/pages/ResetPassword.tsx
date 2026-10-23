import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/kit";

export default function ResetPassword(): React.ReactElement {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Those two passwords don't match");
      return;
    }
    if (!token) {
      setError("Missing reset token. Use the link from your email.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Reset link is invalid or has expired."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout
        kicker="Password"
        title="This link doesn't work"
        subtitle="It's missing the part that identifies you — or it's been used already. Ask for a fresh one."
      >
        <Button variant="primary" size="lg" className="w-full" asChild>
          <Link to="/forgot-password">Send me a new link</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      kicker="Password"
      title={done ? "Password updated" : "Choose a new password"}
      subtitle={done ? "You can sign in with it now." : "Something you haven't used before, at least six characters."}
      footer={
        done ? undefined : (
          <>
            Changed your mind?{" "}
            <Link to="/login" className="link-ink">
              Back to sign in
            </Link>
          </>
        )
      }
    >
      {done ? (
        <Button variant="primary" size="lg" className="w-full" onClick={() => navigate("/login")}>
          Sign in
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <FormError>{error}</FormError>}
          <Field label="New password" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-10"
            />
          </Field>
          <Field label="Same again" htmlFor="confirm">
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="h-10"
            />
          </Field>
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? "Saving…" : "Save new password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
