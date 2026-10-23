import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { getErrorMessage } from "@/lib/utils";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/kit";
import { GoogleSection } from "@/components/GoogleSignIn";

/** Prevent open-redirect: only allow same-origin paths starting with "/". */
function isSafeReturnTo(path: string | null): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}

export default function Login(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = isSafeReturnTo(searchParams.get("returnTo")) ? searchParams.get("returnTo")! : "/dashboard";
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleResponse(credential: string): Promise<void> {
    setError("");
    try {
      await loginWithGoogle(credential);
      toast.success("Welcome back");
      navigate(returnTo);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Google sign-in failed"));
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate(returnTo);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "That email and password don't match"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      kicker="Sign in"
      title="Welcome back"
      subtitle="Your applications, deadlines and notes are where you left them."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="link-ink">
            Create an account
          </Link>
        </>
      }
    >
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
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="text-[13px] font-semibold text-ink-2">
              Password
            </label>
            <Link to="/forgot-password" className="link-ink text-xs">
              Forgot it?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-10"
          />
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>

        <GoogleSection onCredential={handleGoogleResponse} />
      </form>
    </AuthLayout>
  );
}
