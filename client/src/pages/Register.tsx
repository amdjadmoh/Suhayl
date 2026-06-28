import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, AlertCircle, GraduationCap, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Register(): React.ReactElement {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "agency">("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(name, email, password, role);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F8FAFC] via-slate-100 to-[#F8FAFC] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F172A]">
            <img src="/logo.svg" alt="Suhayl" className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Create an account</h1>
          <p className="mt-1 text-sm text-slate-500">Join Suhayl and start your journey</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">Full Name</Label>
              <Input
                id="name" type="text" placeholder="John Doe"
                value={name} onChange={(e) => setName(e.target.value)} required
                className="bg-slate-50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input
                id="email" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required
                className="bg-slate-50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <Input
                id="password" type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="bg-slate-50 border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">I am a</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    role === "student"
                      ? "border-[#0EA5E9] bg-[#0EA5E9]/5"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <GraduationCap className={cn("h-6 w-6", role === "student" ? "text-[#0EA5E9]" : "text-slate-400")} />
                  <span className={cn("text-sm font-medium", role === "student" ? "text-[#0EA5E9]" : "text-slate-600")}>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("agency")}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                    role === "agency"
                      ? "border-[#0EA5E9] bg-[#0EA5E9]/5"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <Building2 className={cn("h-6 w-6", role === "agency" ? "text-[#0EA5E9]" : "text-slate-400")} />
                  <span className={cn("text-sm font-medium", role === "agency" ? "text-[#0EA5E9]" : "text-slate-600")}>Agency</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white h-11 rounded-xl font-medium"
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
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#0EA5E9] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
