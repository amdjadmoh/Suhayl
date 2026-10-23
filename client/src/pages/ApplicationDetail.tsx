import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";
import { useApplication, useDeleteApplication, useUpdateApplication, useCountries } from "@/lib/api";
import type { Program } from "@/types/program";
import type { ApplicationFormData, ApplicationProgress } from "@/types/application";
import { cn, getErrorMessage } from "@/lib/utils";
import { formatDate, formatDateLong, formatMoney, formatTuition } from "@/lib/format";
import { STATUS_META, type ApplicationStatus } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  BackLink, CountryPlate, DaysLeft, ErrorState, Fact, Facts, LoadingPage, Stamp, VerificationNote,
} from "@/components/kit";

/* ---------- Pieces ---------- */

/** A paper checklist line. Done items get struck through, like a to-do list. */
function CheckRow({
  done,
  label,
  detail,
  onClick,
  loading,
  disabled,
  trailing,
}: {
  done: boolean;
  label: string;
  detail?: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  trailing?: React.ReactNode;
}): React.ReactElement {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <button
        type="button"
        onClick={onClick}
        disabled={loading || disabled || !onClick}
        aria-pressed={done}
        className={cn("group flex min-w-0 flex-1 items-start gap-3 text-left text-sm",
          !disabled && onClick && "cursor-pointer",
          disabled && "cursor-default",
        )}
      >
        <span
          className={cn("flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            done ? "border-moss-solid bg-moss-solid text-white dark:text-paper" : "border-input bg-paper-raised",
            !done && !disabled && onClick && "group-hover:border-brand",
          )}
        >
          {loading ? (
            <Loader2 className="size-3 animate-spin text-ink-3" />
          ) : done ? (
            <Check className="size-3" strokeWidth={3.5} />
          ) : null}
        </span>
        <span
          className={cn("min-w-0 flex-1 pt-0.5 leading-snug",
            done ? "text-ink-3" : "font-medium text-ink",
          )}
        >
          {label}
        </span>
        {detail && <span className="shrink-0 text-xs text-ink-3 tnum">{detail}</span>}
      </button>
      {trailing}
    </li>
  );
}

function ChecklistGroup({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <p className="mb-1 text-sm font-bold text-ink">{title}</p>
      <ul className="divide-y divide-rule-soft">{children}</ul>
    </div>
  );
}

function AddLine({
  value,
  onChange,
  onAdd,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  placeholder: string;
  disabled?: boolean;
}): React.ReactElement {
  return (
    <div className="mt-2 flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd();
          }
        }}
        className="h-9 flex-1 text-sm"
        placeholder={placeholder}
      />
      <Button type="button" size="sm" variant="outline" onClick={onAdd} disabled={!value.trim() || disabled}>
        Add
      </Button>
    </div>
  );
}

type Step = { label: string; done: boolean; date?: string | null; failed?: boolean };

/** The application's route, drawn like a line on a transit map. */
function Journey({ steps }: { steps: Step[] }): React.ReactElement {
  const current = steps.findIndex((s) => !s.done);
  return (
    <ol className="relative grid gap-0 sm:grid-cols-7">
      {steps.map((s, i) => {
        const isCurrent = i === current;
        return (
          <li key={s.label} className="relative flex gap-3 pb-5 sm:block sm:pb-0">
            {/* connecting line */}
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn("absolute top-5 left-[9px] h-full w-[2px] sm:top-[9px] sm:left-[calc(50%+11px)] sm:h-[2px] sm:w-[calc(100%-22px)]",
                  s.done && steps[i + 1]?.done ? "bg-brand" : "bg-rule",
                )}
              />
            )}
            <span
              className={cn("relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full border-2 bg-paper-raised sm:mx-auto",
                s.failed
                  ? "border-stamp bg-stamp text-white"
                  : s.done
                    ? "border-brand bg-brand text-on-brand"
                    : isCurrent
                      ? "border-brand"
                      : "border-rule",
              )}
            >
              {s.failed ? (
                <X className="size-3" strokeWidth={3} />
              ) : s.done ? (
                <Check className="size-3" strokeWidth={3} />
              ) : isCurrent ? (
                <span className="size-2 rounded-full bg-brand" />
              ) : null}
            </span>
            <span className="block sm:mt-2.5 sm:text-center">
              <span
                className={cn("block text-[13px] leading-snug",
                  s.failed ? "font-semibold text-stamp" : s.done || isCurrent ? "font-semibold text-ink" : "text-ink-3",
                )}
              >
                {s.label}
              </span>
              <span className="mt-0.5 block text-xs text-ink-4 tnum">
                {s.failed ? "refused" : s.done ? (s.date ? formatDate(s.date) : "done") : isCurrent ? "next" : ""}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Panel({
  title,
  description,
  tone = "ink",
  children,
}: {
  title: string;
  description?: React.ReactNode;
  tone?: "ink" | "moss" | "stamp";
  children?: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      className={cn("rounded-[1.25rem] p-5",
        tone === "moss" && "bg-moss-soft",
        tone === "stamp" && "bg-stamp-soft",
        tone === "ink" && "bg-paper-sunken",
      )}
    >
      <p
        className={cn("text-base leading-tight font-bold",
          tone === "moss" ? "text-moss" : tone === "stamp" ? "text-stamp" : "text-ink",
        )}
      >
        {title}
      </p>
      {description && <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{description}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

/* ---------- Page ---------- */

export default function ApplicationDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [docInput, setDocInput] = useState("");

  const { data: application, isLoading, isError } = useApplication(id ?? "");
  const deleteMutation = useDeleteApplication();
  const updateMutation = useUpdateApplication();
  const { data: countries } = useCountries();

  const status = application?.applicationStatus;
  // Once submitted (or closed), the preparation checklist is a record, not a to-do list.
  const isReadOnly = !application || status === "Applied" || status === "Waitlisted" || status === "Rejected" || status === "Enrolled";

  function basePayload(overrides: Partial<ApplicationFormData> = {}): Partial<ApplicationFormData> {
    const a = application!;
    return {
      programId: typeof a.programId === "string" ? a.programId : a.programId?._id ?? "",
      studentName: a.studentName,
      studentEmail: a.studentEmail,
      applicationStatus: a.applicationStatus,
      applicationDeadline: a.applicationDeadline,
      notes: a.notes,
      applicationProgress: { ...a.applicationProgress },
      ...overrides,
    };
  }

  async function toggleProgress(update: Partial<ApplicationProgress>): Promise<boolean> {
    if (isReadOnly) return false;
    if (!application || !id) return false;
    const key = Object.keys(update)[0] ?? null;
    setUpdating(key);
    try {
      await updateMutation.mutateAsync({
        id,
        data: basePayload({ applicationProgress: { ...application.applicationProgress, ...update } }),
      });
      return true;
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update"));
      return false;
    } finally {
      setUpdating(null);
    }
  }

  async function submitApplication(): Promise<void> {
    if (!application || !id) return;
    setUpdating("submit");
    try {
      await updateMutation.mutateAsync({
        id,
        data: basePayload({
          applicationStatus: "Applied",
          applicationProgress: {
            ...application.applicationProgress,
            applicationSubmittedDate: new Date().toISOString(),
          },
        }),
      });
      toast.success("Submitted. Fingers crossed.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to submit"));
    } finally {
      setUpdating(null);
    }
  }

  async function updateStatus(newStatus: ApplicationStatus, message?: string): Promise<void> {
    if (!application || !id) return;
    setUpdating("status");
    try {
      await updateMutation.mutateAsync({ id, data: basePayload({ applicationStatus: newStatus }) });
      toast.success(message ?? `Marked as ${newStatus.toLowerCase()}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update status"));
    } finally {
      setUpdating(null);
    }
  }

  async function decideVisa(approved: boolean): Promise<void> {
    const ok = await toggleProgress({ visaApproved: approved });
    if (ok) toast.success(approved ? "Visa approved — you can enroll now" : "Visa marked as refused");
  }

  async function resetVisaDecision(): Promise<void> {
    const ok = await toggleProgress({ visaApproved: null });
    if (ok) toast.success("Visa decision cleared");
  }

  async function restartVisaApplication(): Promise<void> {
    const ok = await toggleProgress({ visaApplied: false, visaApproved: null });
    if (ok) toast.success("Visa process restarted — tick “Visa applied” when you re-apply");
  }

  async function handleDelete(): Promise<void> {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Application deleted");
      navigate("/applications");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete application"));
    }
  }

  async function addDocument(): Promise<void> {
    const trimmed = docInput.trim();
    if (!trimmed || !application) return;
    const docs = application.applicationProgress.documentsObtained;
    if (!docs.includes(trimmed)) {
      await toggleProgress({ documentsObtained: [...docs, trimmed] });
      setDocInput("");
    }
  }

  async function removeDocument(doc: string): Promise<void> {
    if (!application) return;
    const docs = application.applicationProgress.documentsObtained.filter((d) => d !== doc);
    await toggleProgress({ documentsObtained: docs });
  }

  async function addVisaDocument(): Promise<void> {
    const trimmed = docInput.trim();
    if (!trimmed || !application) return;
    const pending = application.applicationProgress.visaDocumentsPending || [];
    if (!pending.includes(trimmed)) {
      await toggleProgress({ visaDocumentsPending: [...pending, trimmed] });
      setDocInput("");
    }
  }

  if (isLoading) return <LoadingPage />;

  if (isError || !application) {
    return (
      <ErrorState
        title="Application not found"
        action={
          <Button variant="outline" onClick={() => navigate("/applications")}>
            Back to applications
          </Button>
        }
      >
        It may have been deleted, or the link is wrong.
      </ErrorState>
    );
  }

  const a = application;
  const prog = typeof a.programId === "object" ? (a.programId as unknown as Program) : null;
  const uni = prog?.universityId && typeof prog.universityId === "object" ? prog.universityId : null;
  const p = a.applicationProgress;
  const country = countries?.find((c) => c.name === uni?.country);
  const stageIsPrep = a.applicationStatus === "Preparing" || a.applicationStatus === "Applied";
  const stageIsVisa = a.applicationStatus === "Accepted" || a.applicationStatus === "Enrolled" || a.applicationStatus === "Waitlisted";

  const allRequiredDocsObtained =
    !prog?.requiredDocuments?.length || prog.requiredDocuments.every((doc) => p.documentsObtained.includes(doc));

  // What's still open, for the submit warning
  const missingItems: string[] = [];
  prog?.requiredDocuments?.forEach((doc) => {
    if (!p.documentsObtained.includes(doc)) missingItems.push(doc);
  });
  p.testScores.forEach((ts) => {
    if (!ts.taken) missingItems.push(`${ts.name} not taken`);
  });
  if (prog?.requiresSOP && p.sopStatus !== "final") missingItems.push("Statement of purpose not final");
  const recsNeeded = prog?.recommendationLetters ?? p.recommendationsRequested;
  if (recsNeeded > 0 && p.recommendationsReceived < recsNeeded) {
    missingItems.push(`Recommendation letters: ${p.recommendationsReceived} of ${recsNeeded}`);
  }
  if (prog?.applicationFee && prog.applicationFee > 0 && !p.applicationFeePaid) {
    missingItems.push(`Application fee (${formatMoney(prog.applicationFee)}) unpaid`);
  }

  // Checklist progress for the preparation stage
  const extraDocs = p.documentsObtained.filter((d) => !prog?.requiredDocuments.includes(d));
  const prepTotal =
    p.testScores.length +
    (prog?.requiredDocuments.length ?? 0) +
    (prog?.requiresSOP ? 1 : 0) +
    (recsNeeded > 0 ? 1 : 0) +
    1;
  const prepDone =
    p.testScores.filter((t) => t.taken).length +
    (prog?.requiredDocuments.filter((d) => p.documentsObtained.includes(d)).length ?? 0) +
    (prog?.requiresSOP && p.sopStatus === "final" ? 1 : 0) +
    (recsNeeded > 0 && p.recommendationsReceived >= recsNeeded ? 1 : 0) +
    (p.applicationFeePaid ? 1 : 0);

  const steps: Step[] = [
    { label: "Started", date: a.createdAt, done: true },
    { label: "Documents ready", date: allRequiredDocsObtained ? a.updatedAt : undefined, done: allRequiredDocsObtained },
    { label: "Submitted", date: p.applicationSubmittedDate, done: !!p.applicationSubmittedDate },
    { label: "Interview", done: p.interviewCompleted, date: p.interviewScheduled },
    { label: "Visa applied", done: p.visaApplied },
    p.visaApproved === false
      ? { label: "Visa decision", done: true, failed: true }
      : { label: "Visa approved", done: p.visaApproved === true },
    { label: "Enrolled", done: a.applicationStatus === "Enrolled", date: a.applicationStatus === "Enrolled" ? a.updatedAt : undefined },
  ];

  const tone = STATUS_META[a.applicationStatus].tone;
  const stampSub =
    a.applicationStatus === "Applied" && p.applicationSubmittedDate
      ? formatDate(p.applicationSubmittedDate)
      : formatDate(a.updatedAt);

  const visaExtrasPending = p.visaDocumentsPending?.filter((d) => !country?.requiredDocuments?.includes(d)) ?? [];
  const visaExtrasObtained = p.visaDocumentsObtained?.filter((d) => !country?.requiredDocuments?.includes(d)) ?? [];

  return (
    <>
      <div className="mb-5">
        <BackLink to="/applications">Applications</BackLink>
      </div>

      {/* Masthead */}
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 max-w-3xl">
            <p className="kicker mb-1">
              Application · {a.studentName}
            </p>
            <h1 className="text-[28px] leading-[1.12] font-bold tracking-[-0.025em] sm:text-[36px]">
              {prog?.name ?? "Application"}
            </h1>
            {uni && (
              <p className="mt-2.5 flex flex-wrap items-center gap-2 text-[15px] text-ink-3">
                <CountryPlate country={uni.country} />
                <Link to={`/universities/${uni._id}`} className="link-ink">
                  {uni.name}
                </Link>
                <span className="hidden text-ink-4 sm:inline">·</span>
                <span className="w-full sm:w-auto">
                  {uni.city}, {uni.country}
                </span>
              </p>
            )}
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <Stamp tone={tone} sub={stampSub}>
              {a.applicationStatus}
            </Stamp>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/applications/${a._id}/edit`}>Edit details</Link>
              </Button>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-stamp hover:bg-stamp-soft hover:text-stamp">
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete this application?</DialogTitle>
                    <DialogDescription>
                      Its checklist, statement and recommender invitations go with it. This can't be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                      Keep it
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending ? <Loader2 className="animate-spin" /> : null}
                      Delete application
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="card mt-6 p-5 sm:px-6 sm:py-6">
          <Journey steps={steps} />
        </div>
      </header>

      {a.applicationStatus === "Enrolled" && (
        <div className="mb-8 rounded-3xl bg-moss-soft px-6 py-5 text-center">
          <p className="text-xl font-bold tracking-[-0.02em] text-moss">Enrolled — that's the whole journey</p>
          <p className="mt-1 text-sm text-ink-2">
            {a.studentName} is officially in {prog?.name ?? "the program"}. Safe travels.
          </p>
        </div>
      )}

      {/* Submit confirmation */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{missingItems.length > 0 ? "A few things are still open" : "Ready to submit?"}</DialogTitle>
            <DialogDescription>
              {missingItems.length > 0
                ? "You can still mark it as submitted — just make sure you meant to."
                : "Everything on the checklist is ticked. This marks the application as sent."}
            </DialogDescription>
          </DialogHeader>
          {missingItems.length > 0 && (
            <ul className="max-h-60 list-disc space-y-1.5 overflow-y-auto rounded-2xl bg-ochre-soft py-3 pr-4 pl-8 text-sm text-ink-2">
              {missingItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
              Not yet
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSubmitDialogOpen(false);
                submitApplication();
              }}
              disabled={updating === "submit"}
            >
              {updating === "submit" && <Loader2 className="animate-spin" />}
              Mark as submitted
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* ── Main column: what needs doing ── */}
        <div className="min-w-0 space-y-8">
          {stageIsPrep && (
            <section>
              <div className="mb-3 flex items-end justify-between gap-4">
                <h2 className="text-[17px] font-bold tracking-[-0.01em]">Checklist</h2>
                <span className="text-[13px] font-semibold text-ink-3 tnum">
                  {prepDone} of {prepTotal} done
                </span>
              </div>
              <div className="mb-5 h-2 overflow-hidden rounded-full bg-paper-sunken">
                <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${(prepDone / prepTotal) * 100}%` }} />
              </div>

              {prog && <VerificationNote status={prog.verificationStatus} subject="program" className="mb-6" />}

              {isReadOnly && (
                <p className="mb-4 rounded-2xl bg-paper-sunken px-4 py-3 text-[13.5px] text-ink-2">
                  Submitted, so the checklist is locked as a record of what was sent.
                </p>
              )}

              <div className="card divide-y divide-rule-soft px-5 py-4">
                {p.testScores.length > 0 && (
                  <ChecklistGroup title="Tests">
                    {p.testScores.map((ts, i) => (
                      <CheckRow
                        key={i}
                        done={ts.taken}
                        label={ts.name}
                        disabled={isReadOnly}
                        loading={updating === "testScores"}
                        onClick={() => {
                          const newScores = [...p.testScores];
                          newScores[i] = { ...ts, taken: !ts.taken };
                          toggleProgress({ testScores: newScores });
                        }}
                        trailing={
                          ts.taken && (
                            <Input
                              type="number"
                              step="0.5"
                              className="h-7 w-20 text-right text-xs tnum"
                              placeholder="Score"
                              disabled={isReadOnly}
                              value={ts.score ?? ""}
                              onChange={(e) => {
                                const newScores = [...p.testScores];
                                newScores[i] = { ...ts, score: e.target.value ? parseFloat(e.target.value) : undefined };
                                toggleProgress({ testScores: newScores });
                              }}
                            />
                          )
                        }
                      />
                    ))}
                  </ChecklistGroup>
                )}

                <ChecklistGroup title="Documents">
                  {prog?.requiredDocuments.map((doc, i) => {
                    const done = p.documentsObtained.includes(doc);
                    return (
                      <CheckRow
                        key={i}
                        done={done}
                        label={doc}
                        disabled={isReadOnly}
                        loading={updating === "documentsObtained"}
                        onClick={() => {
                          const docs = done ? p.documentsObtained.filter((d) => d !== doc) : [...p.documentsObtained, doc];
                          toggleProgress({ documentsObtained: docs });
                        }}
                      />
                    );
                  })}
                  {extraDocs.map((doc, i) => (
                    <CheckRow
                      key={`extra-${i}`}
                      done
                      label={doc}
                      detail="added"
                      disabled
                      trailing={
                        !isReadOnly && (
                          <button
                            type="button"
                            onClick={() => removeDocument(doc)}
                            disabled={updating === "documentsObtained"}
                            className="rounded-lg px-1.5 text-ink-4 hover:bg-stamp-soft hover:text-stamp"
                            aria-label={`Remove ${doc}`}
                          >
                            ×
                          </button>
                        )
                      }
                    />
                  ))}
                  {!prog?.requiredDocuments.length && extraDocs.length === 0 && (
                    <li className="py-2 text-sm text-ink-3">The program doesn't list any documents.</li>
                  )}
                  {!isReadOnly && (
                    <li className="pt-1">
                      <AddLine
                        value={docInput}
                        onChange={setDocInput}
                        onAdd={addDocument}
                        placeholder="Something else you need to send…"
                        disabled={updating === "documentsObtained"}
                      />
                    </li>
                  )}
                </ChecklistGroup>

                {(prog?.requiresSOP || (prog?.recommendationLetters ?? 0) > 0 || p.recommendationsRequested > 0) && (
                  <ChecklistGroup title="Writing">
                    {prog?.requiresSOP && (
                      <CheckRow
                        done={p.sopStatus === "final"}
                        label="Statement of purpose"
                        detail={p.sopStatus === "draft" ? "draft" : undefined}
                        disabled={isReadOnly}
                        loading={updating === "sopStatus"}
                        onClick={() => toggleProgress({ sopStatus: p.sopStatus === "final" ? "not_started" : "final" })}
                        trailing={
                          <Link to={`/applications/${a._id}/statement`} className="link-ink shrink-0 text-[13px]">
                            Write
                          </Link>
                        }
                      />
                    )}
                    {((prog?.recommendationLetters ?? 0) > 0 || p.recommendationsRequested > 0) && (
                      <CheckRow
                        done={p.recommendationsReceived >= p.recommendationsRequested && p.recommendationsRequested > 0}
                        label="Letters of recommendation"
                        detail={p.recommendationsRequested > 0 ? `${p.recommendationsReceived}/${p.recommendationsRequested}` : undefined}
                        disabled={isReadOnly}
                        loading={updating === "recommendationsReceived"}
                        onClick={() =>
                          toggleProgress({
                            recommendationsReceived: Math.min(
                              p.recommendationsReceived + 1,
                              p.recommendationsRequested || prog?.recommendationLetters || 2,
                            ),
                            recommendationsRequested: p.recommendationsRequested || prog?.recommendationLetters || 2,
                          })
                        }
                        trailing={
                          <Link to={`/applications/${a._id}/recommenders`} className="link-ink shrink-0 text-[13px]">
                            Recommenders
                          </Link>
                        }
                      />
                    )}
                  </ChecklistGroup>
                )}

                <ChecklistGroup title="Fees">
                  <CheckRow
                    done={p.applicationFeePaid}
                    label="Application fee paid"
                    detail={
                      prog?.applicationFee != null && prog.applicationFee > 0
                        ? formatMoney(prog.applicationFee)
                        : prog?.applicationFee === 0
                          ? "free"
                          : undefined
                    }
                    disabled={isReadOnly}
                    loading={updating === "applicationFeePaid"}
                    onClick={() => toggleProgress({ applicationFeePaid: !p.applicationFeePaid })}
                  />
                </ChecklistGroup>
              </div>
            </section>
          )}

          {stageIsVisa && (
            <section>
              <div className="mb-3 flex items-end justify-between gap-4">
                <h2 className="text-[17px] font-bold tracking-[-0.01em]">Visa{uni?.country ? ` for ${uni.country}` : ""}</h2>
                {country && (
                  <Link to={`/countries/${country._id}`} className="link-ink text-[13px]">
                    Country notes
                  </Link>
                )}
              </div>

              {country && <VerificationNote status={country.verificationStatus} subject="visa" className="mb-6" />}

              <div className="card divide-y divide-rule-soft px-5 py-4">
                <ChecklistGroup title="Visa documents">
                  {country?.requiredDocuments?.length ? (
                    country.requiredDocuments.map((doc, i) => {
                      const done = !!p.visaDocumentsObtained?.includes(doc);
                      return (
                        <CheckRow
                          key={i}
                          done={done}
                          label={doc}
                          disabled={isReadOnly}
                          loading={updating === "visaDocumentsObtained"}
                          onClick={() => {
                            const docs = done
                              ? (p.visaDocumentsObtained || []).filter((d) => d !== doc)
                              : [...(p.visaDocumentsObtained || []), doc];
                            toggleProgress({ visaDocumentsObtained: docs });
                          }}
                        />
                      );
                    })
                  ) : (
                    <li className="py-2 text-sm text-ink-3">No visa documents on file for {uni?.country ?? "this country"}.</li>
                  )}
                  {visaExtrasPending.map((doc, i) => (
                    <CheckRow
                      key={`pending-${i}`}
                      done={false}
                      label={doc}
                      detail="added"
                      disabled={isReadOnly}
                      loading={updating === "visaDocumentsPending"}
                      onClick={() => {
                        const pending = (p.visaDocumentsPending || []).filter((d) => d !== doc);
                        const obtained = [...(p.visaDocumentsObtained || []), doc];
                        toggleProgress({ visaDocumentsPending: pending, visaDocumentsObtained: obtained });
                      }}
                    />
                  ))}
                  {visaExtrasObtained.map((doc, i) => (
                    <CheckRow
                      key={`obtained-${i}`}
                      done
                      label={doc}
                      detail="added"
                      disabled={isReadOnly}
                      loading={updating === "visaDocumentsObtained"}
                      onClick={() => {
                        const docs = (p.visaDocumentsObtained || []).filter((d) => d !== doc);
                        const pending = [...(p.visaDocumentsPending || []), doc];
                        toggleProgress({ visaDocumentsObtained: docs, visaDocumentsPending: pending });
                      }}
                    />
                  ))}
                  {!isReadOnly && (
                    <li className="pt-1">
                      <AddLine
                        value={docInput}
                        onChange={setDocInput}
                        onAdd={addVisaDocument}
                        placeholder="Another document the embassy asked for…"
                        disabled={updating === "visaDocumentsPending"}
                      />
                    </li>
                  )}
                </ChecklistGroup>

                <ChecklistGroup title="Visa & interview">
                  <CheckRow
                    done={p.visaApplied}
                    label="Visa applied"
                    disabled={isReadOnly}
                    loading={updating === "visaApplied"}
                    onClick={() => toggleProgress({ visaApplied: !p.visaApplied })}
                  />
                  <CheckRow
                    done={p.interviewCompleted}
                    label="Interview done"
                    detail={p.interviewScheduled ? formatDate(p.interviewScheduled) : undefined}
                    disabled={isReadOnly}
                    loading={updating === "interviewCompleted"}
                    onClick={() => toggleProgress({ interviewCompleted: !p.interviewCompleted })}
                  />
                  <li className="flex flex-wrap items-center gap-3 py-2">
                    <span className="flex-1 text-sm text-ink-2">Visa deadline</span>
                    {p.visaDeadline && !isReadOnly && (
                      <button
                        type="button"
                        onClick={() => toggleProgress({ visaDeadline: null })}
                        disabled={updating === "visaDeadline"}
                        className="text-[13px] font-semibold text-ink-3 hover:text-stamp"
                      >
                        Clear
                      </button>
                    )}
                    <Input
                      type="date"
                      value={p.visaDeadline ? String(p.visaDeadline).slice(0, 10) : ""}
                      onChange={(e) => toggleProgress({ visaDeadline: e.target.value ? e.target.value : null })}
                      disabled={isReadOnly || updating === "visaDeadline"}
                      className="h-9 w-40 text-sm tnum"
                    />
                  </li>
                </ChecklistGroup>
              </div>

              {p.visaApplied && a.applicationStatus !== "Enrolled" && (
                <div className="mt-6">
                  {p.visaApproved == null && (
                    <Panel title="Has the embassy decided?" description="Record the outcome once the letter arrives.">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="primary" size="sm" onClick={() => decideVisa(true)} disabled={isReadOnly || updating === "visaApproved"}>
                          {updating === "visaApproved" ? <Loader2 className="animate-spin" /> : <Check />}
                          Approved
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => decideVisa(false)} disabled={isReadOnly || updating === "visaApproved"}>
                          <X />
                          Refused
                        </Button>
                      </div>
                    </Panel>
                  )}
                  {p.visaApproved === false && (
                    <Panel
                      tone="stamp"
                      title="The visa was refused"
                      description="That's hard news. The documents you gathered are kept — you can apply again when you're ready."
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" size="sm" onClick={restartVisaApplication} disabled={isReadOnly || updating === "visaApplied"}>
                          {updating === "visaApplied" && <Loader2 className="animate-spin" />}
                          Start the visa again
                        </Button>
                        <button
                          type="button"
                          onClick={resetVisaDecision}
                          disabled={isReadOnly || updating === "visaApproved"}
                          className="link-ink text-[13px] disabled:opacity-50"
                        >
                          Undo decision
                        </button>
                      </div>
                    </Panel>
                  )}
                  {p.visaApproved === true && (
                    <Panel tone="moss" title="Visa approved" description="The stamp is in the passport.">
                      {a.applicationStatus === "Accepted" && (
                        <button
                          type="button"
                          onClick={resetVisaDecision}
                          disabled={updating === "visaApproved"}
                          className="link-ink text-[13px] disabled:opacity-50"
                        >
                          Undo decision
                        </button>
                      )}
                    </Panel>
                  )}
                </div>
              )}

              {p.visaApproved === true && a.applicationStatus === "Accepted" && (
                <div className="mt-6 rounded-3xl bg-brand-soft p-6">
                  <p className="text-xl leading-tight font-bold tracking-[-0.02em]">One step left</p>
                  <p className="mt-1 text-sm text-ink-2">
                    Offer accepted, visa approved. Mark the enrollment when the university confirms it.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    className="mt-4"
                    onClick={() => updateStatus("Enrolled", "Enrolled — congratulations!")}
                    disabled={updating === "status"}
                  >
                    {updating === "status" && <Loader2 className="animate-spin" />}
                    Mark as enrolled
                  </Button>
                </div>
              )}
            </section>
          )}

          {a.applicationStatus === "Rejected" && (
            <Panel
              tone="stamp"
              title="Not this time"
              description="It stings, but it's one door. The program details are kept here in case you want to try again next intake."
            >
              <Button variant="outline" size="sm" asChild>
                <Link to="/programs">Look at other programs</Link>
              </Button>
            </Panel>
          )}

          {/* Decisions */}
          {a.applicationStatus === "Preparing" && (
            <div className="rounded-3xl bg-brand-soft p-6">
              <p className="text-xl leading-tight font-bold tracking-[-0.02em]">Sent it off?</p>
              <p className="mt-1 text-sm text-ink-2">
                Once you've submitted on the university's portal, mark it here. The deadline stops counting down.
              </p>
              <Button variant="primary" size="lg" className="mt-4" onClick={() => setSubmitDialogOpen(true)} disabled={updating === "submit"}>
                {updating === "submit" && <Loader2 className="animate-spin" />}
                Mark as submitted
              </Button>
            </div>
          )}

          {a.applicationStatus === "Applied" && (
            <div className="rounded-3xl bg-brand-soft p-6">
              <p className="text-xl leading-tight font-bold tracking-[-0.02em]">Heard back?</p>
              <p className="mt-1 text-sm text-ink-2">Record the university's answer when it comes.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => updateStatus("Accepted", "Accepted! Well done.")} disabled={updating === "status"}>
                  Accepted
                </Button>
                <Button variant="outline" onClick={() => updateStatus("Waitlisted")} disabled={updating === "status"}>
                  Waitlisted
                </Button>
                <Button variant="outline" onClick={() => updateStatus("Rejected")} disabled={updating === "status"}>
                  Rejected
                </Button>
              </div>
            </div>
          )}

          {a.applicationStatus === "Waitlisted" && (
            <div className="rounded-3xl bg-brand-soft p-6">
              <p className="text-xl leading-tight font-bold tracking-[-0.02em]">Off the waiting list?</p>
              <p className="mt-1 text-sm text-ink-2">When the university decides, record it here.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => updateStatus("Accepted", "Accepted! Well done.")} disabled={updating === "status"}>
                  Accepted
                </Button>
                <Button variant="outline" onClick={() => updateStatus("Rejected")} disabled={updating === "status"}>
                  Rejected
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Aside: the facts ── */}
        <aside className="space-y-8">
          <div>
            <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">Details</p>
            <Facts className="card px-5 py-1">
              <Fact label="Student">{a.studentName}</Fact>
              <Fact label="Email">
                <span className="break-all">{a.studentEmail}</span>
              </Fact>
              <Fact label="Deadline">
                {a.applicationDeadline ? (
                  <span className="flex flex-col items-end">
                    <span>{formatDateLong(a.applicationDeadline)}</span>
                    {stageIsPrep && <DaysLeft date={a.applicationDeadline} />}
                  </span>
                ) : (
                  <span className="text-ink-4">not set</span>
                )}
              </Fact>
              <Fact label="Application fee">
                {prog?.applicationFee != null && prog.applicationFee > 0 ? (
                  <span>
                    {formatMoney(prog.applicationFee)}{" "}
                    <span className={cn("text-xs tnum", p.applicationFeePaid ? "text-moss" : "text-ochre")}>
                      {p.applicationFeePaid ? "paid" : "unpaid"}
                    </span>
                  </span>
                ) : prog?.applicationFee === 0 ? (
                  "Free"
                ) : (
                  <span className="text-ink-4">not set</span>
                )}
              </Fact>
              {p.visaDeadline && <Fact label="Visa deadline">{formatDateLong(p.visaDeadline)}</Fact>}
              <Fact label="Started">{formatDate(a.createdAt)}</Fact>
              <Fact label="Last change">{formatDate(a.updatedAt)}</Fact>
            </Facts>
            {a.notes && (
              <p className="mt-3 rounded-2xl bg-paper-sunken px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-ink-2">
                {a.notes}
              </p>
            )}
            <Link to={`/applications/${a._id}/edit`} className="link-ink mt-3 inline-block px-1 text-sm">
              Edit status, deadline and notes
            </Link>
          </div>

          {prog && (
            <div>
              <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">The program</p>
              <Facts className="card px-5 py-1">
                <Fact label="Degree">{prog.degreeLevel}</Fact>
                <Fact label="Taught in">{prog.languageOfInstruction}</Fact>
                {prog.tuitionFee != null && (
                  <Fact label="Tuition">{formatTuition(prog.tuitionFee, prog.tuitionCurrency || "EUR", prog.tuitionPeriod)}</Fact>
                )}
              </Facts>
              <Link to={`/programs/${prog._id}`} className="link-ink mt-3 inline-block px-1 text-sm">
                Full program page
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
