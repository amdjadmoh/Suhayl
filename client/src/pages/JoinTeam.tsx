import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { acceptInvite, useInvite } from "@/lib/api-team";
import { useAuth } from "@/lib/authContext";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Field } from "@/components/kit";
import AuthLayout from "@/components/AuthLayout";
import { t } from "@/lib/i18n";

/** Where a counsellor lands from the owner's invite link: choose a password and start. */
export default function JoinTeam(): React.ReactElement {
  const { token = "" } = useParams<{ token: string }>();
  const { data: invite, isLoading, isError } = useInvite(token);
  const { startSession } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const shownName = name ?? invite?.name ?? "";

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    try {
      const session = await acceptInvite(token, shownName.trim(), password);
      startSession(session);
      toast.success(t("Welcome to {agency}", { agency: invite?.agencyName ?? t("the team") }));
      navigate("/agency", { replace: true });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("Couldn't finish joining")));
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <AuthLayout kicker={t("Join your agency")} title={t("Opening your invite…")} subtitle={t("One moment.")}>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </AuthLayout>
    );
  }

  if (isError || !invite) {
    return (
      <AuthLayout kicker={t("Join your agency")} title={t("This link doesn't work any more")} subtitle={t("Invite links work once.")}>
        <p className="text-[15px] leading-relaxed text-ink-2">
          {t("It has already been used or the agency made a new one. Ask whoever invited you to send a fresh link.")}
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout kicker={t("Join your agency")} title={t("Join {agency}", { agency: invite.agencyName })} subtitle={t("You'll see the agency's students, deadlines and documents.")}>
      <form onSubmit={onSubmit} className="grid gap-4">
        <p className="text-[15px] leading-relaxed text-ink-2">
          {t("You'll sign in as {email}. Choose a password to finish.", { email: invite.email })}
        </p>
        <Field label={t("Your name")} htmlFor="join-name">
          <Input id="join-name" value={shownName} onChange={(e) => setName(e.target.value)} autoComplete="name" required className="h-10" />
        </Field>
        <Field label={t("Password")} htmlFor="join-password" hint={t("At least 6 characters.")}>
          <Input
            id="join-password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting || password.length < 6 || !shownName.trim() || !agreed}>
          {submitting && <Loader2 className="animate-spin" />}
          {t("Join the team")}
        </Button>
      </form>
    </AuthLayout>
  );
}
