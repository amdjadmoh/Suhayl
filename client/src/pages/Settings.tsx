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
      toast.success("Name updated");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't update your name"));
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FormSection title="Your details" description={user?.role === "agency" ? "Shown to the students and recommenders you work with." : "Recommenders see this name on the letter request."}>
        <Field label={user?.role === "agency" ? "Agency or your name" : "Name"} htmlFor="set-name">
          <Input id="set-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="set-email" hint="This is the address you sign in with.">
          <Input id="set-email" value={user?.email ?? ""} readOnly disabled />
        </Field>
        <SaveRow pending={updateProfile.isPending} disabled={!name.trim() || name.trim() === user?.name}>
          Save
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
      toast.success("Profile saved");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't save your profile"));
    }
  }

  return (
    <form onSubmit={onSubmit} id="profile">
      <FormSection
        title="Your academic profile"
        description="Matches starts from these, and programs you don't qualify for yet are easy to spot. Only you can see them."
      >
        <Field label="GPA" htmlFor="set-gpa" hint="On a 4.0 scale.">
          <Input id="set-gpa" type="number" inputMode="decimal" step="0.01" min="0" max="4" placeholder="3.4" value={gpa} onChange={(e) => setGpa(e.target.value)} />
        </Field>
        <Field label="IELTS" htmlFor="set-ielts" hint="Overall band, or leave empty if you haven't taken it.">
          <Input id="set-ielts" type="number" inputMode="decimal" step="0.5" min="0" max="9" placeholder="6.5" value={ielts} onChange={(e) => setIelts(e.target.value)} />
        </Field>
        <Field label="Monthly budget (€)" htmlFor="set-budget" hint="What you can spend on rent and living, not tuition.">
          <Input id="set-budget" type="number" inputMode="numeric" min="0" placeholder="1000" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <p className="mb-2 text-[13px] font-semibold text-ink-2">Countries you're considering</p>
          <CountryChips value={countries} onChange={setCountries} />
        </div>
        <SaveRow pending={updatePrefs.isPending}>Save profile</SaveRow>
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
      toast.success(hasPassword ? "Password changed" : "Password set — you can now sign in with it too");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't change your password"));
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FormSection
        title={hasPassword ? "Password" : "Set a password"}
        description={hasPassword ? undefined : "You signed up with Google. Add a password to also sign in with your email."}
      >
        {hasPassword && (
          <Field label="Current password" htmlFor="set-current" className="sm:col-span-2">
            <Input id="set-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </Field>
        )}
        <Field label="New password" htmlFor="set-new" hint="At least 6 characters.">
          <Input id="set-new" type="password" autoComplete="new-password" minLength={6} value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Field label="Type it again" htmlFor="set-confirm" error={mismatch ? "The two don't match" : undefined}>
          <Input id="set-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        <SaveRow pending={changePassword.isPending} disabled={next.length < 6 || next !== confirm || (hasPassword && !current)}>
          {hasPassword ? "Change password" : "Set password"}
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
      toast.success("Your account and everything in it are gone");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't delete your account"));
    }
  }

  const what =
    user?.role === "agency"
      ? "your student files, their applications, letters and notes"
      : "your applications, statements, letters, saved programs and reviews";

  return (
    <div className="card mb-4 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
      <div className="max-w-xl">
        <h2 className="text-[17px] leading-tight font-bold tracking-[-0.01em] text-ink">Delete your account</h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-ink-3">
          This removes {what}. It can't be undone.
        </p>
      </div>
      <Button variant="outline" className="text-stamp hover:bg-stamp-soft hover:text-stamp" onClick={() => setOpen(true)}>
        Delete account
      </Button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSecret(""); }}>
        <DialogContent>
          <form onSubmit={onDelete} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                Everything goes: {what}. {hasPassword ? "Enter your password to confirm." : `Type ${user?.email} to confirm.`}
              </DialogDescription>
            </DialogHeader>
            <Field label={hasPassword ? "Password" : "Your email"} htmlFor="del-secret">
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
                Keep my account
              </Button>
              <Button type="submit" variant="destructive" disabled={!secret || deleteAccount.isPending}>
                {deleteAccount.isPending && <Loader2 className="animate-spin" />}
                Delete everything
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
      <PageHeader kicker="Account" title="Settings">
        Your details, {user.role === "student" ? "the profile Matches uses, " : ""}and how you sign in.
      </PageHeader>
      <div className="max-w-3xl">
        <DetailsSection />
        {user.role === "student" && <AcademicSection />}
        <PasswordSection hasPassword={hasPassword} />
        {user.role !== "admin" && <DeleteSection hasPassword={hasPassword} />}
      </div>
    </>
  );
}
