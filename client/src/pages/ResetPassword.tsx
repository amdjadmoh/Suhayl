import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/kit";
import { t } from "@/lib/i18n";

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
      setError(t("Those two passwords don't match"));
      return;
    }
    if (!token) {
      setError(t("Missing reset token. Use the link from your email."));
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err, t("Reset link is invalid or has expired.")));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout
        kicker={t("Password")}
        title={t("This link doesn't work")}
        subtitle={t("It's missing the part that identifies you — or it's been used already. Ask for a fresh one.")}
      >
        <Button variant="primary" size="lg" className="w-full" asChild>
          <Link to="/forgot-password">{t("Send me a new link")}</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      kicker={t("Password")}
      title={done ? t("Password updated") : t("Choose a new password")}
      subtitle={done ? t("You can sign in with it now.") : t("Something you haven't used before, at least six characters.")}
      footer={
        done ? undefined : (
          <>
            {t("Changed your mind?")}{" "}
            <Link to="/login" className="link-ink">
              {t("Back to sign in")}
            </Link>
          </>
        )
      }
    >
      {done ? (
        <Button variant="primary" size="lg" className="w-full" onClick={() => navigate("/login")}>
          {t("Sign in")}
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <FormError>{error}</FormError>}
          <Field label={t("New password")} htmlFor="password">
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
          <Field label={t("Same again")} htmlFor="confirm">
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
            {isSubmitting ? t("Saving…") : t("Save new password")}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
