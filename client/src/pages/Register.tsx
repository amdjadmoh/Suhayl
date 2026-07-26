import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, AlertCircle, GraduationCap, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/utils";

const GOOGLE_CLIENT_ID = import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          renderButton: (el: HTMLElement, cfg: object) => void;
        };
      };
    };
  }
}

export default function Register(): React.ReactElement {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "agency">("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const scriptId = "google-gsi";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = initGoogle;
    } else {
      initGoogle();
    }

    function initGoogle() {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        width: googleBtnRef.current.parentElement?.offsetWidth || 360,
        text: "signin_with",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGoogleResponse(response: { credential: string }) {
    setError("");
    try {
      await loginWithGoogle(response.credential);
      toast.success("Account created!");
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
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Registration failed");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Suhayl and start your study abroad journey"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name" type="text" placeholder="John Doe"
            value={name} onChange={(e) => setName(e.target.value)} required
            className="bg-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email" type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required
            className="bg-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password" type="password" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            className="bg-muted/50"
          />
        </div>

        <div className="space-y-2">
          <Label>I am a</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
                role === "student"
                  ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                  : "border-border hover:border-primary/40"
              )}
            >
              <GraduationCap className={cn("h-6 w-6 transition-colors", role === "student" ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-sm font-medium transition-colors", role === "student" ? "text-primary" : "text-foreground/70")}>Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("agency")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
                role === "agency"
                  ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                  : "border-border hover:border-primary/40"
              )}
            >
              <Building2 className={cn("h-6 w-6 transition-colors", role === "agency" ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-sm font-medium transition-colors", role === "agency" ? "text-primary" : "text-foreground/70")}>Agency</span>
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-xl text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create account
            </>
          )}
        </Button>

        {GOOGLE_CLIENT_ID && (
          <>
            <div className="relative flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Google sign-up creates a student account
            </p>
            <div className="relative">
              <Button type="button" variant="outline" className="pointer-events-none h-11 w-full rounded-xl">
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </Button>
              <div ref={googleBtnRef} className="absolute inset-0 opacity-0 cursor-pointer [&>iframe]:h-full [&>iframe]:w-full" />
            </div>
          </>
        )}
      </form>
    </AuthLayout>
  );
}
