import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

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
      setError("Passwords do not match");
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
      <AuthLayout title="Invalid link" subtitle="This password reset link is missing or invalid." footer={
        <Link to="/forgot-password" className="font-semibold text-primary hover:underline">Request a new link</Link>
      }>
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before"
      footer={
        done ? undefined : (
          <>
            Changed your mind?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">Back to sign in</Link>
          </>
        )
      }
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="text-sm text-muted-foreground">Password reset successfully.</p>
          <Button className="mt-2 h-11 w-full rounded-xl text-base" onClick={() => navigate("/login")}>
            Sign in with new password
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" placeholder="••••••••" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} required minLength={6} className="bg-muted/50" />
          </div>
          <Button type="submit" className="h-11 w-full rounded-xl text-base" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</>
            ) : (
              <><Lock className="mr-2 h-4 w-4" /> Reset password</>
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
