import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  useChangePassword,
  useDeleteAccount,
  useMe,
  usePreferences,
  useUpdatePreferences,
  useUpdateProfile,
  type UserPreferences,
} from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FormSection, LoadingPage, PageHeader } from "@/components/kit";
import { CountryChips } from "@/components/CountryChips";
import { lang, setLang, t } from "@/lib/i18n";

function SaveRow({ pending, disabled, children }: { pending: boolean; disabled?: boolean; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex justify-end sm:col-span-2">
      <Button type="submit" variant="primary" disabled={pending || disabled}>
        {pending && <Loader2 className="animate-spin" />}
        {children}
      </Button>
    </div>
  );
}

function DetailsSection(): React.ReactElement {
  const { user, updateUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState(user?.name ?? "");

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    try {
      const fresh = await updateProfile.mutateAsync({ name: name.trim() });
      updateUser({ name: fresh.name });
      toast.success(t("Name updated"));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("Couldn't update your name")));
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FormSection title={t("Your details")} description={user?.role === "agency" ? t("Shown to the students and recommenders you work with.") : t("Recommenders see this name on the letter request.")}>
        <Field label={user?.role === "agency" ? t("Agency or your name") : t("Name")} htmlFor="set-name">
          <Input id="set-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </Field>
        <Field label={t("Email")} htmlFor="set-email" hint={t("This is the address you sign in with.")}>
          <Input id="set-email" value={user?.email ?? ""} readOnly disabled />
        </Field>
        <SaveRow pending={updateProfile.isPending} disabled={!name.trim() || name.trim() === user?.name}>
          {t("Save")}
        </SaveRow>
      </FormSection>
    </form>
  );
}

function AcademicSection(): React.ReactElement {
  const { data: prefs } = usePreferences();
  // The form starts from what's saved, so it only mounts once that has loaded
  return prefs ? <AcademicForm prefs={prefs} /> : <div className="card mb-4 h-64 animate-pulse bg-paper-sunken" />;
}

function AcademicForm({ prefs }: { prefs: UserPreferences }): React.ReactElement {
  const updatePrefs = useUpdatePreferences();
  const [gpa, setGpa] = useState(prefs.gpa?.toString() ?? "");
  const [ielts, setIelts] = useState(prefs.ieltsScore?.toString() ?? "");
  const [budget, setBudget] = useState(prefs.preferredMonthlyBudget?.toString() ?? "");
  const [countries, setCountries] = useState<string[]>(prefs.preferredCountries ?? []);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    try {
      await updatePrefs.mutateAsync({
        gpa: gpa ? Number(gpa) : null,
        ieltsScore: ielts ? Number(ielts) : null,
        preferredMonthlyBudget: budget ? Number(budget) : null,
        preferredCountries: countries,
      });
      toast.success(t("Profile saved"));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("Couldn't save your profile")));
    }
  }

  return (
    <form onSubmit={onSubmit} id="profile">
      <FormSection
        title={t("Your academic profile")}
        description={t("Matches starts from these, and programs you don't qualify for yet are easy to spot. Only you can see them.")}
      >
        <Field label={t("GPA")} htmlFor="set-gpa" hint={t("On a 4.0 scale.")}>
          <Input id="set-gpa" type="number" inputMode="decimal" step="0.01" min="0" max="4" placeholder="3.4" value={gpa} onChange={(e) => setGpa(e.target.value)} />
        </Field>
        <Field label={t("IELTS")} htmlFor="set-ielts" hint={t("Overall band, or leave empty if you haven't taken it.")}>
          <Input id="set-ielts" type="number" inputMode="decimal" step="0.5" min="0" max="9" placeholder="6.5" value={ielts} onChange={(e) => setIelts(e.target.value)} />
        </Field>
        <Field label={t("Monthly budget (€)")} htmlFor="set-budget" hint={t("What you can spend on rent and living, not tuition.")}>
          <Input id="set-budget" type="number" inputMode="numeric" min="0" placeholder="1000" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <p className="mb-2 text-[13px] font-semibold text-ink-2">{t("Countries you're considering")}</p>
          <CountryChips value={countries} onChange={setCountries} />
        </div>
        <SaveRow pending={updatePrefs.isPending}>{t("Save profile")}</SaveRow>
      </FormSection>
    </form>
  );
}

function PasswordSection({ hasPassword }: { hasPassword: boolean }): React.ReactElement {
  const changePassword = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && next !== confirm;

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    try {
      await changePassword.mutateAsync({ currentPassword: hasPassword ? current : undefined, newPassword: next });
      toast.success(hasPassword ? t("Password changed") : t("Password set — you can now sign in with it too"));
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("Couldn't change your password")));
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FormSection
        title={hasPassword ? t("Password") : t("Set a password")}
        description={hasPassword ? undefined : t("You signed up with Google. Add a password to also sign in with your email.")}
      >
        {hasPassword && (
          <Field label={t("Current password")} htmlFor="set-current" className="sm:col-span-2">
            <Input id="set-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </Field>
        )}
        <Field label={t("New password")} htmlFor="set-new" hint={t("At least 6 characters.")}>
          <Input id="set-new" type="password" autoComplete="new-password" minLength={6} value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Field label={t("Type it again")} htmlFor="set-confirm" error={mismatch ? t("The two don't match") : undefined}>
          <Input id="set-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        <SaveRow pending={changePassword.isPending} disabled={next.length < 6 || next !== confirm || (hasPassword && !current)}>
          {hasPassword ? t("Change password") : t("Set password")}
        </SaveRow>
      </FormSection>
    </form>
  );
}

function DeleteSection({ hasPassword }: { hasPassword: boolean }): React.ReactElement {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const deleteAccount = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState("");

  async function onDelete(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    try {
      await deleteAccount.mutateAsync(hasPassword ? { password: secret } : { confirmEmail: secret });
      logout();
      navigate("/", { replace: true });
      toast.success(t("Your account and everything in it are gone"));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("Couldn't delete your account")));
    }
  }

  const what =
    user?.role === "agency"
      ? t("your student files, their applications, letters and notes")
      : t("your applications, statements, letters, saved programs and reviews");

  return (
    <div className="card mb-4 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
      <div className="max-w-xl">
        <h2 className="text-[17px] leading-tight font-bold tracking-[-0.01em] text-ink">{t("Delete your account")}</h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-ink-3">
          {t("This removes {what}. It can't be undone.", { what })}
        </p>
      </div>
      <Button variant="outline" className="text-stamp hover:bg-stamp-soft hover:text-stamp" onClick={() => setOpen(true)}>
        {t("Delete account")}
      </Button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSecret(""); }}>
        <DialogContent>
          <form onSubmit={onDelete} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>{t("Delete your account?")}</DialogTitle>
              <DialogDescription>
                {t("Everything goes: {what}.", { what })} {hasPassword ? t("Enter your password to confirm.") : t("Type {email} to confirm.", { email: user?.email ?? "" })}
              </DialogDescription>
            </DialogHeader>
            <Field label={hasPassword ? t("Password") : t("Your email")} htmlFor="del-secret">
              <Input
                id="del-secret"
                type={hasPassword ? "password" : "email"}
                autoComplete={hasPassword ? "current-password" : "off"}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("Keep my account")}
              </Button>
              <Button type="submit" variant="destructive" disabled={!secret || deleteAccount.isPending}>
                {deleteAccount.isPending && <Loader2 className="animate-spin" />}
                {t("Delete everything")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Settings(): React.ReactElement {
  const { user } = useAuth();
  const { data: me, isLoading } = useMe();
  const { hash } = useLocation();

  // Jump to a section when linked to one, e.g. /settings#profile from the dashboard
  useEffect(() => {
    if (!isLoading && hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isLoading, hash]);

  if (isLoading || !user) return <LoadingPage />;
  const hasPassword = me?.hasPassword ?? true;

  return (
    <>
      <PageHeader kicker={t("Account")} title={t("Settings")}>
        {user.role === "student" ? t("Your details, the profile Matches uses, and how you sign in.") : t("Your details and how you sign in.")}
      </PageHeader>
      <div className="max-w-3xl">
        <DetailsSection />
        <div className="card mb-4 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div>
            <h2 className="text-[17px] leading-tight font-bold tracking-[-0.01em] text-ink">{t("Language")}</h2>
            <p className="mt-1 text-[13.5px] text-ink-3">{t("The language Suhayl speaks to you in, on this device.")}</p>
          </div>
          <div className="inline-flex rounded-full bg-paper-sunken p-1 text-[13px] font-semibold" role="group" aria-label={t("Language")}>
            {(["fr", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => lang !== l && setLang(l)}
                className={lang === l ? "rounded-full bg-paper-raised px-3.5 py-1.5 text-ink shadow-sm" : "rounded-full px-3.5 py-1.5 text-ink-3 hover:text-ink"}
              >
                {l === "fr" ? "Français" : "English"}
              </button>
            ))}
          </div>
        </div>
        {user.role === "student" && <AcademicSection />}
        <PasswordSection hasPassword={hasPassword} />
        {user.role !== "admin" && <DeleteSection hasPassword={hasPassword} />}
      </div>
    </>
  );
}
