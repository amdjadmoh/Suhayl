import { useState } from "react";
import { toast } from "sonner";
import { Check, Download, FileText, Loader2, Plus, Trash2, Undo2 } from "lucide-react";
import {
  useDeleteDocument,
  useRequestDocument,
  useReviewDocument,
  useStudentDocuments,
} from "@/lib/api-documents";
import { downloadAgencyDocument } from "@/lib/downloads";
import type { DocumentRequest, DocumentStatus } from "@/types/document";
import { cn, getErrorMessage } from "@/lib/utils";
import { formatDate, timeAgo } from "@/lib/format";
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
import { Field, Section } from "@/components/kit";
import { COMMON_DOCUMENTS } from "@/lib/documentPresets";
import { t } from "@/lib/i18n";

const STATUS: Record<DocumentStatus, { label: string; tone: string }> = {
  requested: { label: t("Waiting for them"), tone: "bg-ochre-soft text-ochre" },
  uploaded: { label: t("To check"), tone: "bg-brand-soft text-brand-ink" },
  accepted: { label: t("Accepted"), tone: "bg-moss-soft text-moss" },
  rejected: { label: t("Sent back"), tone: "bg-stamp-soft text-stamp" },
};


function fileSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function DocumentRow({ doc }: { doc: DocumentRequest }): React.ReactElement {
  const review = useReviewDocument();
  const remove = useDeleteDocument();
  const [sendingBack, setSendingBack] = useState(false);
  const [reason, setReason] = useState("");
  const st = STATUS[doc.status];

  async function decide(status: "accepted" | "rejected"): Promise<void> {
    try {
      await review.mutateAsync({ id: doc._id, status, rejectReason: status === "rejected" ? reason.trim() : undefined });
      toast.success(status === "accepted" ? t("{doc} accepted", { doc: doc.title }) : t("{doc} sent back", { doc: doc.title }));
      setSendingBack(false);
      setReason("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("Couldn't save that")));
    }
  }

  async function onDelete(): Promise<void> {
    try {
      await remove.mutateAsync(doc._id);
      toast.success(t("Request removed"));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("Couldn't remove the request")));
    }
  }

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-paper-sunken text-ink-3">
          <FileText className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{doc.title}</p>
          <p className="text-[13px] text-ink-3">
            {doc.file
              ? t("{file} · {size} · sent {when}", { file: doc.file.originalName, size: fileSize(doc.file.size), when: timeAgo(doc.file.uploadedAt) })
              : doc.dueDate
                ? t("Needed by {date}", { date: formatDate(doc.dueDate) })
                : t("Asked {when}", { when: timeAgo(doc.createdAt) })}
          </p>
          {doc.note && <p className="mt-1 text-[13px] text-ink-2">{doc.note}</p>}
          {doc.status === "rejected" && doc.rejectReason && (
            <p className="mt-1 text-[13px] text-stamp">{t("You said: {reason}", { reason: doc.rejectReason })}</p>
          )}
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", st.tone)}>{st.label}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 pl-[3.25rem]">
        {doc.file && (
          <Button variant="outline" size="sm" onClick={() => downloadAgencyDocument(doc._id, doc.file!.originalName)}>
            <Download />
            {t("Download")}
          </Button>
        )}
        {doc.status === "uploaded" && !sendingBack && (
          <>
            <Button variant="primary" size="sm" onClick={() => decide("accepted")} disabled={review.isPending}>
              <Check />
              {t("Accept")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSendingBack(true)}>
              <Undo2 />
              {t("Send back")}
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-ink-3 hover:bg-stamp-soft hover:text-stamp"
          onClick={onDelete}
          disabled={remove.isPending}
          aria-label={t("Remove {doc}", { doc: doc.title })}
        >
          <Trash2 />
        </Button>
      </div>

      {sendingBack && (
        <form
          className="mt-3 flex flex-wrap gap-2 pl-[3.25rem]"
          onSubmit={(e) => {
            e.preventDefault();
            decide("rejected");
          }}
        >
          <Input
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("What's wrong with it? e.g. the second page is missing")}
            className="min-w-0 flex-1 basis-64"
            aria-label={t("Why you're sending it back")}
          />
          <Button type="submit" variant="destructive" size="sm" className="h-10" disabled={review.isPending}>
            {t("Send back")}
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-10" onClick={() => setSendingBack(false)}>
            {t("Cancel")}
          </Button>
        </form>
      )}
    </li>
  );
}

export function StudentDocuments({ studentId, firstName }: { studentId: string; firstName: string }): React.ReactElement {
  const { data: docs, isLoading } = useStudentDocuments(studentId);
  const request = useRequestDocument();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");

  const list = docs ?? [];
  // Titles are saved in the language they're picked in, so families read them in it too
  const COMMON = COMMON_DOCUMENTS.map((d) => t(d));
  const asked = new Set(list.map((d) => d.title.toLowerCase()));
  const toCheck = list.filter((d) => d.status === "uploaded").length;

  async function ask(docTitle: string, extra?: { note?: string; dueDate?: string }): Promise<boolean> {
    try {
      const r = await request.mutateAsync({ studentId, title: docTitle, ...extra });
      toast.success(t("Asked {name} for {doc}", { name: firstName, doc: docTitle }), { description: r.emailSent ? t("We emailed them their family link.") : undefined });
      return true;
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("Couldn't send the request")));
      return false;
    }
  }

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!title.trim()) return;
    const ok = await ask(title.trim(), { note: note.trim() || undefined, dueDate: dueDate || undefined });
    if (ok) {
      setTitle("");
      setNote("");
      setDueDate("");
      setOpen(false);
    }
  }

  return (
    <Section
      title={t("Documents")}
      count={isLoading ? undefined : list.length}
      action={
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus />
          {t("Ask for a document")}
        </Button>
      }
    >
      {toCheck > 0 && (
        <p className="mb-3 rounded-2xl bg-brand-soft px-4 py-3 text-[13.5px] font-medium text-brand-ink">
          {toCheck === 1 ? t("1 document is waiting for you to check.") : t("{n} documents are waiting for you to check.", { n: toCheck })}
        </p>
      )}
      {isLoading ? (
        <div className="card-soft h-24 animate-pulse" />
      ) : list.length === 0 ? (
        <div className="card-soft px-5 py-5">
          <p className="text-sm text-ink-2">
            {t("Ask {name} for what you need. They upload it from their family link, and you check it here.", { name: firstName })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {COMMON.slice(0, 6).map((doc) => (
              <button
                key={doc}
                type="button"
                onClick={() => ask(doc)}
                disabled={request.isPending}
                className="rounded-full border border-rule bg-paper-raised px-3 py-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:bg-paper-hover hover:text-ink"
              >
                + {doc}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <ul className="card divide-y divide-rule-soft overflow-hidden">
          {list.map((d) => (
            <DocumentRow key={d._id} doc={d} />
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={onSubmit} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>{t("Ask {name} for a document", { name: firstName })}</DialogTitle>
              <DialogDescription>{t("It shows up on their family link, where they can upload a PDF or a photo.")}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap gap-2">
              {COMMON.filter((doc) => !asked.has(doc.toLowerCase())).map((doc) => (
                <button
                  key={doc}
                  type="button"
                  onClick={() => setTitle(doc)}
                  aria-pressed={title === doc}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                    title === doc ? "border-brand bg-brand text-on-brand" : "border-rule bg-paper-raised text-ink-2 hover:bg-paper-hover",
                  )}
                >
                  {doc}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
              <Field label={t("Document")} htmlFor="doc-title">
                <Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Or type your own")} />
              </Field>
              <Field label={t("Needed by")} htmlFor="doc-due">
                <Input id="doc-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
              <Field label={t("Note for them")} htmlFor="doc-note" className="sm:col-span-2">
                <Input id="doc-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("e.g. Both sides, in colour")} />
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button type="submit" variant="primary" disabled={!title.trim() || request.isPending}>
                {request.isPending && <Loader2 className="animate-spin" />}
                {t("Ask for it")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Section>
  );
}
