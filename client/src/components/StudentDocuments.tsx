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
import { COMMON_DOCUMENTS as COMMON } from "@/lib/documentPresets";

const STATUS: Record<DocumentStatus, { label: string; tone: string }> = {
  requested: { label: "Waiting for them", tone: "bg-ochre-soft text-ochre" },
  uploaded: { label: "To check", tone: "bg-brand-soft text-brand-ink" },
  accepted: { label: "Accepted", tone: "bg-moss-soft text-moss" },
  rejected: { label: "Sent back", tone: "bg-stamp-soft text-stamp" },
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
      toast.success(status === "accepted" ? `${doc.title} accepted` : `${doc.title} sent back`);
      setSendingBack(false);
      setReason("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't save that"));
    }
  }

  async function onDelete(): Promise<void> {
    try {
      await remove.mutateAsync(doc._id);
      toast.success("Request removed");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't remove the request"));
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
              ? `${doc.file.originalName} · ${fileSize(doc.file.size)} · sent ${timeAgo(doc.file.uploadedAt)}`
              : doc.dueDate
                ? `Needed by ${formatDate(doc.dueDate)}`
                : `Asked ${timeAgo(doc.createdAt)}`}
          </p>
          {doc.note && <p className="mt-1 text-[13px] text-ink-2">{doc.note}</p>}
          {doc.status === "rejected" && doc.rejectReason && (
            <p className="mt-1 text-[13px] text-stamp">You said: {doc.rejectReason}</p>
          )}
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", st.tone)}>{st.label}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 pl-[3.25rem]">
        {doc.file && (
          <Button variant="outline" size="sm" onClick={() => downloadAgencyDocument(doc._id, doc.file!.originalName)}>
            <Download />
            Download
          </Button>
        )}
        {doc.status === "uploaded" && !sendingBack && (
          <>
            <Button variant="primary" size="sm" onClick={() => decide("accepted")} disabled={review.isPending}>
              <Check />
              Accept
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSendingBack(true)}>
              <Undo2 />
              Send back
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-ink-3 hover:bg-stamp-soft hover:text-stamp"
          onClick={onDelete}
          disabled={remove.isPending}
          aria-label={`Remove ${doc.title}`}
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
            placeholder="What's wrong with it? e.g. the second page is missing"
            className="min-w-0 flex-1 basis-64"
            aria-label="Why you're sending it back"
          />
          <Button type="submit" variant="destructive" size="sm" className="h-10" disabled={review.isPending}>
            Send back
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-10" onClick={() => setSendingBack(false)}>
            Cancel
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
  const asked = new Set(list.map((d) => d.title.toLowerCase()));
  const toCheck = list.filter((d) => d.status === "uploaded").length;

  async function ask(docTitle: string, extra?: { note?: string; dueDate?: string }): Promise<boolean> {
    try {
      await request.mutateAsync({ studentId, title: docTitle, ...extra });
      toast.success(`Asked ${firstName} for ${docTitle}`);
      return true;
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't send the request"));
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
      title="Documents"
      count={isLoading ? undefined : list.length}
      action={
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus />
          Ask for a document
        </Button>
      }
    >
      {toCheck > 0 && (
        <p className="mb-3 rounded-2xl bg-brand-soft px-4 py-3 text-[13.5px] font-medium text-brand-ink">
          {toCheck === 1 ? "1 document is" : `${toCheck} documents are`} waiting for you to check.
        </p>
      )}
      {isLoading ? (
        <div className="card-soft h-24 animate-pulse" />
      ) : list.length === 0 ? (
        <div className="card-soft px-5 py-5">
          <p className="text-sm text-ink-2">
            Ask {firstName} for what you need. They upload it from their family link, and you check it here.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {COMMON.slice(0, 6).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => ask(t)}
                disabled={request.isPending}
                className="rounded-full border border-rule bg-paper-raised px-3 py-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:bg-paper-hover hover:text-ink"
              >
                + {t}
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
              <DialogTitle>Ask {firstName} for a document</DialogTitle>
              <DialogDescription>It shows up on their family link, where they can upload a PDF or a photo.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap gap-2">
              {COMMON.filter((t) => !asked.has(t.toLowerCase())).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTitle(t)}
                  aria-pressed={title === t}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                    title === t ? "border-brand bg-brand text-on-brand" : "border-rule bg-paper-raised text-ink-2 hover:bg-paper-hover",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
              <Field label="Document" htmlFor="doc-title">
                <Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Or type your own" />
              </Field>
              <Field label="Needed by" htmlFor="doc-due">
                <Input id="doc-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
              <Field label="Note for them" htmlFor="doc-note" className="sm:col-span-2">
                <Input id="doc-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Both sides, in colour" />
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={!title.trim() || request.isPending}>
                {request.isPending && <Loader2 className="animate-spin" />}
                Ask for it
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Section>
  );
}
