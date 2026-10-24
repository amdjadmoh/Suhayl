import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { cn, getErrorMessage } from "@/lib/utils";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/kit";
import { GoogleSection } from "@/components/GoogleSignIn";
import { t } from "@/lib/i18n";

const ROLES = [
  { value: "student", title: t("I'm applying"), note: t("For myself and my own applications") },
  { value: "agency", title: t("I help students apply"), note: t("An agency or counsellor with several students") },
] as const;

export default function Register(): React.ReactElement {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "agency">("student");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleResponse(credential: string): Promise<void> {
    setError("");
    try {
      await loginWithGoogle(credential);
      toast.success(t("You're in"));
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, t("Google sign-up failed")));
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await register(name, email, password, role);
      toast.success("You're in");
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, t("Registration failed")));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      kicker={t("Create an account")}
      title={t("Create your account")}
      subtitle={t("Free. It takes a minute, and you can add your first application straight away.")}
      footer={
        <>
          {t("Already have one?")}{" "}
          <Link to="/login" className="link-ink">
            {t("Sign in")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <FormError>{error}</FormError>}

        <fieldset>
          <legend className="mb-2 text-[13px] font-semibold text-ink-2">{t("Who is it for?")}</legend>
          <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
            {ROLES.map((r) => {
              const on = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setRole(r.value)}
                  className={cn("flex w-full items-start gap-3 rounded-2xl border-2 px-3.5 py-3 text-left transition-colors", on ? "border-brand bg-brand-soft" : "border-rule hover:border-input")}
                >
                  <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2", on ? "border-brand" : "border-input")}>
                    {on && <span className="size-2 rounded-full bg-brand" />}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-ink">{r.title}</span>
                    <span className="block text-xs text-ink-3">{r.note}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <Field label={role === "agency" ? t("Agency or your name") : t("Your name")} htmlFor="name">
          <Input id="name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required className="h-10" />
        </Field>
        <Field label={t("Email")} htmlFor="email">
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
        <Field label={t("Password")} htmlFor="password" hint={t("At least 6 characters.")}>
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

        <label className="flex items-start gap-3 text-[13.5px] leading-relaxed text-ink-2">
          <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" aria-label={t("I agree to the terms and privacy policy")} />
          <span>
            {t("I agree to the")}{" "}
            <Link to="/terms" target="_blank" className="link-ink">
              {t("terms")}
            </Link>{" "}
            {t("and the")}{" "}
            <Link to="/privacy" target="_blank" className="link-ink">
              {t("privacy policy")}
            </Link>
            .
          </span>
        </label>

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting || !agreed}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? t("Creating your account…") : t("Create account")}
        </Button>

        <GoogleSection onCredential={handleGoogleResponse} note={t("Signing up with Google creates a student account and means you agree to the terms and privacy policy.")} />
      </form>
    </AuthLayout>
  );
}
