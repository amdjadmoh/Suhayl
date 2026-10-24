import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Check, Copy, Link2, Loader2, UserPlus } from "lucide-react";
import { joinUrl, useAgencyActivity, useInviteMember, useRemoveMember, useRenewInvite, useResetMemberPassword, useTeam, type TeamMember } from "@/lib/api-team";
import { ActivityLog } from "@/components/ActivityLog";
import { useAuth } from "@/lib/authContext";
import { getErrorMessage } from "@/lib/utils";
import { initials, plural, timeAgo } from "@/lib/format";
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
import { ErrorState, Field, LoadingRows, PageHeader } from "@/components/kit";
import { t, tn } from "@/lib/i18n";

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Shows a join link once, with a copy button, after inviting or renewing. */
function LinkDialog({ link, name, emailed, reset, onClose }: { link: string | null; name: string; emailed?: boolean; reset?: boolean; onClose: () => void }): React.ReactElement {
  const [copied, setCopied] = useState(false);
  return (
    <Dialog open={!!link} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Send this link to {name}", { name })}</DialogTitle>
          <DialogDescription>
            {emailed ? `${t("We also emailed it to {name}.", { name })} ` : ""}
            {reset
              ? t("They open it and choose a new password. It works once, for 24 hours, and signs them out everywhere else.")
              : t("They open it, choose a password and they're in. It works once, for 7 days; make a new one any time from this page.")}
          </DialogDescription>
        </DialogHeader>
        <p className="rounded-xl bg-paper-sunken px-3 py-2.5 text-[13px] break-all text-ink-2 select-all">{link}</p>
        <DialogFooter>
          <Button
            variant="primary"
            onClick={async () => {
              if (link && (await copy(link))) {
                setCopied(true);
                toast.success(t("Link copied — send it on WhatsApp or by email"));
              } else toast.error(t("Copy didn't work — select the link and copy it by hand"));
            }}
          >
            {copied ? <Check /> : <Copy />}
            {copied ? t("Copied") : t("Copy link")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MemberRow({ m, canManage, onLink }: { m: TeamMember; canManage: boolean; onLink: (link: string, name: string, emailed?: boolean, reset?: boolean) => void }): React.ReactElement {
  const renew = useRenewInvite();
  const resetPassword = useResetMemberPassword();
  const remove = useRemoveMember();
  const [confirming, setConfirming] = useState(false);

  async function newLink(): Promise<void> {
    try {
      if (m.joined) {
        const r = await resetPassword.mutateAsync(m._id);
        onLink(r.resetUrl, m.name, r.emailSent, true);
      } else {
        const r = await renew.mutateAsync(m._id);
        onLink(joinUrl(r.inviteToken), m.name, r.emailSent);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("Couldn't make a new link")));
    }
  }

  async function onRemove(): Promise<void> {
    try {
      const r = await remove.mutateAsync(m._id);
      toast.success(t("{name} removed", { name: m.name }), {
        description: r.studentsUnassigned ? t("{students} are now unassigned.", { students: plural(r.studentsUnassigned, "student") }) : undefined,
      });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("Couldn't remove them")));
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-ink">
        {initials(m.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">
          {m.name}
          {m.isOwner && <span className="ml-2 rounded-full bg-paper-sunken px-2 py-0.5 text-[11px] font-semibold text-ink-3">{t("Owner")}</span>}
          {!m.joined && <span className="ml-2 rounded-full bg-ochre-soft px-2 py-0.5 text-[11px] font-semibold text-ochre">{t("Hasn't joined yet")}</span>}
        </p>
        <p className="truncate text-[13px] text-ink-3">
          {m.email}
          {!m.joined && m.invitedAt ? t(" · invited {when}", { when: timeAgo(m.invitedAt) }) : ""}
        </p>
      </div>
      <Link to={`/agency/students?counsellor=${m._id}`} className="text-[13px] font-semibold text-ink-2 hover:text-brand-ink tnum">
        {plural(m.students, "student")}
      </Link>
      {canManage && !m.isOwner && (
        <div className="flex w-full justify-end gap-1 sm:w-auto">
          <Button variant="ghost" size="sm" onClick={newLink} disabled={renew.isPending || resetPassword.isPending}>
            <Link2 />
            {m.joined ? t("Password reset link") : t("New invite link")}
          </Button>
          {confirming ? (
            <>
              <Button variant="destructive" size="sm" onClick={onRemove} disabled={remove.isPending}>
                {t("Remove {name}", { name: m.name.split(" ")[0] ?? m.name })}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                {t("Keep")}
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" className="text-stamp hover:bg-stamp-soft hover:text-stamp" onClick={() => setConfirming(true)}>
              {t("Remove")}
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

export default function AgencyTeam(): React.ReactElement {
  const { user } = useAuth();
  const isOwner = user?.agencyRole !== "counsellor";
  const { data: team, isLoading, isError } = useTeam();
  const invite = useInviteMember();
  const { data: activity, isLoading: activityLoading } = useAgencyActivity();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [shown, setShown] = useState<{ link: string; name: string; emailed?: boolean; reset?: boolean } | null>(null);

  async function onInvite(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    try {
      const r = await invite.mutateAsync({ name: name.trim(), email: email.trim() });
      setOpen(false);
      setShown({ link: joinUrl(r.inviteToken), name: name.trim(), emailed: r.emailSent });
      setName("");
      setEmail("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("Couldn't invite them")));
    }
  }

  if (isError) return <ErrorState title={t("The team didn't load")}>{t("Try refreshing the page in a moment.")}</ErrorState>;

  const members = team?.members ?? [];
  return (
    <>
      <PageHeader
        kicker={isLoading ? t("Agency") : t("Agency · {people}", { people: plural(members.length, "person", "people") })}
        title={t("Team")}
        actions={
          isOwner && (
            <Button variant="primary" onClick={() => setOpen(true)}>
              <UserPlus />
              {t("Invite a counsellor")}
            </Button>
          )
        }
      >
        {isOwner
          ? t("Everyone here sees all of the agency's students. Give each student a counsellor so everyone knows whose file it is.")
          : t("The people you work with. Only the agency owner can invite or remove someone.")}
      </PageHeader>

      {isLoading ? (
        <LoadingRows rows={3} />
      ) : (
        <div className="max-w-3xl">
          <ul className="card divide-y divide-rule-soft overflow-hidden">
            {members.map((m) => (
              <MemberRow key={m._id} m={m} canManage={isOwner} onLink={(link, n, emailed, reset) => setShown({ link, name: n, emailed, reset })} />
            ))}
          </ul>
          {!!team?.unassigned && (
            <p className="mt-3 px-1 text-[13px] text-ink-3">
              <Link to="/agency/students?counsellor=none" className="font-semibold text-brand-ink hover:underline">
                {tn(team.unassigned, "{students} has no counsellor yet.", "{students} have no counsellor yet.", { students: plural(team.unassigned, "student") })}
              </Link>
            </p>
          )}
          <div className="mt-10">
            <ActivityLog items={activity ?? []} isLoading={activityLoading} title={t("Recent activity")} showStudent />
          </div>
          {members.length === 1 && isOwner && (
            <div className="card-soft mt-4 px-5 py-4 text-[13.5px] leading-relaxed text-ink-2">
              {t("Working with others? Invite your counsellors so each one sees their own students, follow-ups and deadlines first.")}
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={onInvite} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>{t("Invite a counsellor")}</DialogTitle>
              <DialogDescription>{t("You'll get a link to send them. Nothing is emailed.")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <Field label={t("Their name")} htmlFor="tm-name">
                <Input id="tm-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Karima Benali" />
              </Field>
              <Field label={t("Their email")} htmlFor="tm-email" hint={t("They'll sign in with this.")}>
                <Input id="tm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="karima@youragency.dz" />
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button type="submit" variant="primary" disabled={!name.trim() || !email.trim() || invite.isPending}>
                {invite.isPending && <Loader2 className="animate-spin" />}
                {t("Create invite link")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LinkDialog link={shown?.link ?? null} name={shown?.name ?? ""} emailed={shown?.emailed} reset={shown?.reset} onClose={() => setShown(null)} />
    </>
  );
}
