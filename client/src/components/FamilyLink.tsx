import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Loader2, RefreshCw, Users } from "lucide-react";
import { portalUrl, useExtendPortal, useSetPortal } from "@/lib/api-documents";
import { daysUntil, formatDate } from "@/lib/format";
import type { Student } from "@/types/student";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Turns on the private link a student and their parents use to follow the file and upload documents. */
export function FamilyLink({ student }: { student: Student }): React.ReactElement {
  const setPortal = useSetPortal();
  const extend = useExtendPortal();
  const [copied, setCopied] = useState(false);
  const firstName = student.name.split(" ")[0];
  const link = student.portalToken ? portalUrl(student.portalToken) : null;

  async function copy(url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied — send it to them on WhatsApp");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy didn't work — select the link and copy it by hand");
    }
  }

  async function change(enabled: boolean, message: string): Promise<void> {
    try {
      const updated = await setPortal.mutateAsync({ studentId: student._id, enabled });
      toast.success(message);
      if (enabled && updated.portalToken) await copy(portalUrl(updated.portalToken));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't change the link"));
    }
  }

  if (!link) {
    return (
      <div className="rounded-[1.25rem] bg-brand-soft p-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-paper-raised text-brand-ink">
          <Users className="size-[18px]" />
        </span>
        <p className="mt-3 text-[15px] font-bold text-ink">Family link</p>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
          A private page where {firstName} and their parents follow every application and upload the documents you ask
          for. No account or password needed.
        </p>
        <Button variant="primary" size="sm" className="mt-4" onClick={() => change(true, "Family link is on")} disabled={setPortal.isPending}>
          {setPortal.isPending && <Loader2 className="animate-spin" />}
          Create the link
        </Button>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-bold text-ink">Family link</p>
        <span className="rounded-full bg-moss-soft px-2.5 py-0.5 text-xs font-semibold text-moss">On</span>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-3">Anyone with this link can see {firstName}'s file. Share it only with them and their family.</p>
      {student.portalExpiresAt && (
        <p className={`mt-2 text-[13px] ${(daysUntil(student.portalExpiresAt) ?? 99) <= 14 ? "font-semibold text-ochre" : "text-ink-3"}`}>
          Works until {formatDate(student.portalExpiresAt)}.{" "}
          <button
            type="button"
            className="font-semibold text-brand-ink hover:underline"
            disabled={extend.isPending}
            onClick={async () => {
              try {
                await extend.mutateAsync(student._id);
                toast.success("Link extended for another six months");
              } catch (err: unknown) {
                toast.error(getErrorMessage(err, "Couldn't extend the link"));
              }
            }}
          >
            Extend
          </button>
        </p>
      )}
      <p className="mt-3 rounded-xl bg-paper-sunken px-3 py-2 font-mono text-[12px] break-all text-ink-2 select-all">{link}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => copy(link)}>
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <a href={link} target="_blank" rel="noreferrer">
            Preview
          </a>
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-rule-soft pt-3 text-[13px]">
        <button
          type="button"
          className="inline-flex items-center gap-1 font-medium text-ink-2 hover:text-ink"
          onClick={() => change(true, "New link made — the old one no longer works")}
          disabled={setPortal.isPending}
        >
          <RefreshCw className="size-3.5" />
          Make a new link
        </button>
        <button
          type="button"
          className="font-medium text-stamp hover:underline"
          onClick={() => change(false, "Family link turned off")}
          disabled={setPortal.isPending}
        >
          Turn off
        </button>
      </div>
    </div>
  );
}
