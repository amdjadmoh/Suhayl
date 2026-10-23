import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { cn, getErrorMessage } from "@/lib/utils";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/kit";
import { GoogleSection } from "@/components/GoogleSignIn";

const ROLES = [
  { value: "student", title: "I'm applying", note: "For myself and my own applications" },
  { value: "agency", title: "I help students apply", note: "An agency or counsellor with several students" },
] as const;

export default function Register(): React.ReactElement {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "agency">("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleResponse(credential: string): Promise<void> {
    setError("");
    try {
      await loginWithGoogle(credential);
      toast.success("You're in");
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Google sign-up failed"));
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
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      kicker="Create an account"
      title="Create your account"
      subtitle="Free. It takes a minute, and you can add your first application straight away."
      footer={
        <>
          Already have one?{" "}
          <Link to="/login" className="link-ink">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <FormError>{error}</FormError>}

        <fieldset>
          <legend className="mb-2 text-[13px] font-semibold text-ink-2">Who is it for?</legend>
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

        <Field label={role === "agency" ? "Agency or your name" : "Your name"} htmlFor="name">
          <Input id="name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required className="h-10" />
        </Field>
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
        <Field label="Password" htmlFor="password" hint="At least 6 characters.">
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

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Creating your account…" : "Create account"}
        </Button>

        <GoogleSection onCredential={handleGoogleResponse} note="Signing up with Google creates a student account." />
      </form>
    </AuthLayout>
  );
}
