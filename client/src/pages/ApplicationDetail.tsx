import { useNavigate, useParams, Link } from "react-router-dom";
import { useApplication, useDeleteApplication, useUpdateApplication, useCountries } from "@/lib/api";
import { STATUS_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft, Trash2, AlertCircle, Loader2, ClipboardList, User, Mail,
  GraduationCap, Send, Check, Pencil, X,
} from "lucide-react";
import { useState } from "react";
import type { Program } from "@/types/program";
import type { ApplicationProgress } from "@/types/application";
import { getErrorMessage } from "@/lib/utils";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Not set";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function CheckItem({
  done, label, detail, onClick, loading,
}: {
  done: boolean; label: string; detail?: string; onClick: () => void; loading?: boolean;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-3 text-sm w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 text-slate-400 animate-spin shrink-0" />
      ) : done ? (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 shrink-0">
          <Check className="h-3 w-3 text-emerald-600" />
        </div>
      ) : (
        <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-200 shrink-0 hover:border-[#0EA5E9] transition-colors" />
      )}
      <span className={done ? "text-[#0F172A] font-medium" : "text-slate-400"}>
        {label}
      </span>
      {detail && <span className="text-xs text-slate-400 ml-auto">{detail}</span>}
    </button>
  );
}

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

  async function toggleProgress(update: Partial<ApplicationProgress>): Promise<void> {
    if (isReadOnly) return;
    if (!application || !id) return;
    const key = Object.keys(update)[0] ?? null;
    setUpdating(key);
    const payload: any = {
      programId: typeof application.programId === "string" ? application.programId : application.programId?._id ?? "",
      studentName: application.studentName,
      studentEmail: application.studentEmail,
      applicationStatus: application.applicationStatus,
      applicationDeadline: application.applicationDeadline,
      notes: application.notes,
      applicationProgress: { ...application.applicationProgress, ...update },
    };
    try {
      await updateMutation.mutateAsync({ id, data: payload });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update"));
    } finally {
      setUpdating(null);
    }
  }

  async function submitApplication(): Promise<void> {
    if (!application || !id) return;
    setUpdating("submit");
    const payload: any = {
      programId: typeof application.programId === "string" ? application.programId : application.programId?._id ?? "",
      studentName: application.studentName,
      studentEmail: application.studentEmail,
      applicationStatus: "Applied",
      applicationDeadline: application.applicationDeadline,
      notes: application.notes,
      applicationProgress: {
        ...application.applicationProgress,
        applicationSubmittedDate: new Date().toISOString(),
      },
    };
    try {
      await updateMutation.mutateAsync({ id, data: payload });
      toast.success("Application submitted!");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to submit"));
    } finally {
      setUpdating(null);
    }
  }

  async function updateStatus(newStatus: string): Promise<void> {
    if (!application || !id) return;
    setUpdating("status");
    const payload: any = {
      programId: typeof application.programId === "string" ? application.programId : application.programId?._id ?? "",
      studentName: application.studentName,
      studentEmail: application.studentEmail,
      applicationStatus: newStatus,
      applicationDeadline: application.applicationDeadline,
      notes: application.notes,
      applicationProgress: { ...application.applicationProgress },
    };
    try {
      await updateMutation.mutateAsync({ id, data: payload });
      toast.success(`Application marked as ${newStatus}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update status"));
    } finally {
      setUpdating(null);
    }
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="rounded-xl border border-slate-100 bg-white p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-[#0F172A]">Application not found</h2>
        <button onClick={() => navigate("/applications")} className="mt-4 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">Back</button>
      </div>
    );
  }

  const a = application;
  const prog = typeof a.programId === "object" ? (a.programId as unknown as Program) : null;
  const uni = prog?.universityId && typeof prog.universityId === "object" ? prog.universityId : null;
  const p = a.applicationProgress;
  const country = countries?.find((c) => c.name === uni?.country);
  const isReadOnly = a.applicationStatus === "Applied" || a.applicationStatus === "Waitlisted" || a.applicationStatus === "Rejected";

  // Compute all required documents obtained (or no required documents)
  const allRequiredDocsObtained =
    !prog?.requiredDocuments?.length ||
    prog.requiredDocuments.every((doc) => p.documentsObtained.includes(doc));

  // Compute checklist missing items for the submit warning dialog
  const missingItems: string[] = [];
  prog?.requiredDocuments?.forEach((doc) => {
    if (!p.documentsObtained.includes(doc)) missingItems.push(`Document: ${doc}`);
  });
  p.testScores.forEach((ts) => {
    if (!ts.taken) missingItems.push(`Test: ${ts.name}`);
  });
  if (prog?.requiresSOP && p.sopStatus !== "final") {
    missingItems.push("Statement of Purpose not finalized");
  }
  const recsNeeded = prog?.recommendationLetters ?? p.recommendationsRequested;
  if (recsNeeded > 0 && p.recommendationsReceived < recsNeeded) {
    missingItems.push(
      `Recommendation Letters: ${p.recommendationsReceived}/${recsNeeded} received`,
    );
  }
  if (prog?.applicationFee && prog.applicationFee > 0 && !p.applicationFeePaid) {
    missingItems.push(`Application Fee (€${prog.applicationFee}) not paid`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/applications")} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">{prog?.name ?? "Application"}</h1>
            <p className="text-sm text-slate-500">for {a.studentName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={STATUS_COLORS[a.applicationStatus]}>{a.applicationStatus}</Badge>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium transition-colors text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /> Delete</button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Application</DialogTitle>
                <DialogDescription>This action cannot be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Submit Application Confirmation Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {missingItems.length > 0 ? (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Submit with incomplete items?
                </>
              ) : (
                <>Submit Application</>
              )}
            </DialogTitle>
            <DialogDescription>
              {missingItems.length > 0
                ? "The following items in your checklist are still incomplete. You can still submit, but consider completing them first."
                : "All checklist items are complete. Ready to submit your application?"}
            </DialogDescription>
          </DialogHeader>
          {missingItems.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 max-h-64 overflow-y-auto">
              <p className="text-sm font-semibold text-amber-800 mb-2">Missing items:</p>
              <ul className="space-y-1.5">
                {missingItems.map((item, i) => (
                  <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => { setSubmitDialogOpen(false); submitApplication(); }}
              disabled={updating === "submit"}
              className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white"
            >
              {updating === "submit" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Program + University Info */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <GraduationCap className="h-5 w-5 text-slate-400" /> Program
            </h3>
          </div>
          <div className="p-6">
            {prog && (
              <div className="space-y-3">
                <p className="font-semibold text-[#0F172A]">
                  <Link to={`/programs/${prog._id}`} className="hover:text-[#0EA5E9]">{prog.name}</Link>
                </p>
                <p className="text-sm text-slate-500">{prog.degreeLevel} · {prog.languageOfInstruction}</p>
                {prog.tuitionFee && <p className="text-sm text-slate-500">€{prog.tuitionFee.toLocaleString()}/{prog.tuitionPeriod?.toLowerCase()}</p>}
              </div>
            )}
            <div className="border-t border-slate-100 my-3" />
            {uni && (
              <div className="space-y-2">
                <p className="text-sm">
                  <Link to={`/universities/${uni._id}`} className="text-[#0EA5E9] hover:underline font-medium">{uni.name}</Link>
                </p>
                <p className="text-sm text-slate-500">{uni.city}, {uni.country}</p>
              </div>
            )}
          </div>
        </div>

        {/* Application Info */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <ClipboardList className="h-5 w-5 text-slate-400" /> Details
            </h3>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-slate-400" />
              <span className="font-medium text-[#0F172A]">{a.studentName}</span>
              <span className="text-slate-400">·</span>
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-[#0F172A]">{a.studentEmail}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">Status:</span>
              <Badge variant="secondary" className={STATUS_COLORS[a.applicationStatus]}>{a.applicationStatus}</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">Deadline:</span>
              <span className="font-medium text-[#0F172A]">{formatDate(a.applicationDeadline)}</span>
            </div>
            {a.notes && (
              <div className="border-t border-slate-100 pt-3">
                <p className="text-sm text-slate-500 whitespace-pre-wrap">{a.notes}</p>
              </div>
            )}
            {/* Edit link — small pencil at bottom */}
            <div className="border-t border-slate-100 pt-3">
              <Link to={`/applications/${a._id}/edit`} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-[#0EA5E9] transition-colors">
                <Pencil className="h-3 w-3" /> Edit status, deadline & notes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline + Checklist */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <ClipboardList className="h-5 w-5 text-slate-400" /> Timeline
            </h3>
          </div>
          <div className="p-6">
            {(() => {
              const steps = [
                { label: "Application Created", date: a.createdAt, done: true },
                { label: "Documents Prepared", date: allRequiredDocsObtained ? a.updatedAt : undefined, done: allRequiredDocsObtained },
                { label: "Submitted", date: p.applicationSubmittedDate, done: !!p.applicationSubmittedDate },
                { label: "Interview", done: p.interviewCompleted, date: p.interviewScheduled },
                { label: "Visa Applied", done: p.visaApplied },
                { label: "Visa Approved", done: p.visaApproved ?? false },
              ];
              return (
                <div className="relative pl-8">
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200" />
                  {steps.map((step, i) => (
                    <div key={i} className="relative pb-6 last:pb-0">
                      <div className={`absolute -left-[17px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        step.done ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 text-slate-400"
                      }`}>
                        {step.done ? <Check className="h-3 w-3" /> : <div className="h-2 w-2 rounded-full bg-slate-300" />}
                      </div>
                      <div className="ml-2">
                        <p className={`text-sm font-medium ${step.done ? "text-[#0F172A]" : "text-slate-400"}`}>{step.label}</p>
                        <p className="text-xs text-slate-400">{step.done && step.date ? formatDate(step.date) : step.done ? "✓" : "Pending"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Checklist — interactive */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <ClipboardList className="h-5 w-5 text-slate-400" /> Checklist
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {prog && (
              <div className={`rounded-lg p-3 text-sm border ${
                prog.verificationStatus === "manual"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : prog.verificationStatus === "ai"
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                <p className="font-semibold">
                  {prog.verificationStatus === "manual"
                    ? "✓ User-Verified — Manually added"
                    : prog.verificationStatus === "ai"
                    ? "⚠ AI-Verified Program Info"
                    : "⚠ Unverified Program Info"}
                </p>
                <p className="text-xs mt-1">
                  {prog.verificationStatus === "manual"
                    ? "This program was manually added by a user and its details have been verified."
                    : prog.verificationStatus === "ai"
                    ? "This program's requirements were compiled using AI. Verify tuition, deadlines, and documents directly with the university before applying."
                    : "This program has not been verified. Confirm all details with the university. Use at your own risk."}
                </p>
              </div>
            )}
            {(a.applicationStatus === "Preparing" || a.applicationStatus === "Applied") && (
            <>
            {/* Test Scores */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Tests</p>
              <div className="space-y-1">
                {p.testScores.map((ts, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckItem
                      done={ts.taken}
                      label={ts.name}
                      loading={updating === `testScores.${i}.taken`}
                      onClick={() => {
                        const newScores = [...p.testScores];
                        newScores[i] = { ...ts, taken: !ts.taken };
                        toggleProgress({ testScores: newScores });
                      }}
                    />
                    {ts.taken && (
                      <Input type="number" step="0.5" className="w-20 h-8 text-sm rounded-lg border-slate-200" placeholder="Score"
                        value={ts.score ?? ""}
                        onChange={(e) => {
                          const newScores = [...p.testScores];
                          newScores[i] = { ...ts, score: e.target.value ? parseFloat(e.target.value) : undefined };
                          toggleProgress({ testScores: newScores });
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Documents */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Documents</p>
              <div className="space-y-1">
                {/* Required Documents checklist */}
                {prog?.requiredDocuments.map((doc, i) => {
                  const done = p.documentsObtained.includes(doc);
                  return (
                    <CheckItem
                      key={i}
                      done={done}
                      label={doc}
                      loading={updating === "documentsObtained"}
                      onClick={() => {
                        const docs = done
                          ? p.documentsObtained.filter((d) => d !== doc)
                          : [...p.documentsObtained, doc];
                        toggleProgress({ documentsObtained: docs });
                      }}
                    />
                  );
                })}

                {/* Extra Documents — items in documentsObtained that are NOT in requiredDocuments */}
                {p.documentsObtained.filter((d) => !prog?.requiredDocuments.includes(d)).length > 0 && (
                  <>
                    <div className="border-t border-slate-100 my-2" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Extra Documents</p>
                    {p.documentsObtained
                      .filter((d) => !prog?.requiredDocuments.includes(d))
                      .map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm px-2 py-1.5 group">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 shrink-0">
                            <Check className="h-3 w-3 text-emerald-600" />
                          </div>
                          <span className="text-[#0F172A] font-medium flex-1">{doc}</span>
                          <button
                            onClick={() => removeDocument(doc)}
                            disabled={updating === "documentsObtained"}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity disabled:opacity-40"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                  </>
                )}
              </div>
              {/* Inline document adder */}
              {!isReadOnly && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={docInput}
                    onChange={(e) => setDocInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDocument(); } }}
                    className="h-8 text-sm rounded-lg border-slate-200 flex-1"
                    placeholder="Add a document..."
                  />
                  <Button type="button" size="sm" variant="outline" className="h-8 border-slate-200 rounded-lg" onClick={addDocument} disabled={!docInput.trim() || updating === "documentsObtained"}>
                    Add
                  </Button>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100" />

            {/* SOP & Recommendations */}
            {(prog?.requiresSOP || (prog?.recommendationLetters ?? 0) > 0) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Writing</p>
                <div className="space-y-1">
                  {prog?.requiresSOP && (
                    <div className="flex items-center justify-between">
                      <CheckItem
                        done={p.sopStatus === "final"}
                        label="Statement of Purpose"
                        detail={p.sopStatus === "draft" ? "draft" : p.sopStatus === "final" ? "done" : undefined}
                        loading={updating === "sopStatus"}
                        onClick={() => toggleProgress({ sopStatus: p.sopStatus === "final" ? "not_started" : "final" })}
                      />
                      <Link
                        to={`/applications/${a._id}/statement`}
                        className="text-xs text-[#0EA5E9] hover:underline shrink-0 ml-2"
                      >
                        Edit Statement
                      </Link>
                    </div>
                  )}
                  {((prog?.recommendationLetters ?? 0) > 0 || p.recommendationsRequested > 0) && (
                    <div className="flex items-center justify-between">
                      <CheckItem
                        done={p.recommendationsReceived >= p.recommendationsRequested && p.recommendationsRequested > 0}
                        label="Letters of Recommendation"
                        detail={p.recommendationsRequested > 0 ? `${p.recommendationsReceived}/${p.recommendationsRequested}` : undefined}
                        loading={updating === "recommendationsReceived"}
                        onClick={() => toggleProgress({ recommendationsReceived: Math.min(p.recommendationsReceived + 1, p.recommendationsRequested || prog?.recommendationLetters || 2), recommendationsRequested: p.recommendationsRequested || prog?.recommendationLetters || 2 })}
                      />
                      <Link
                        to={`/applications/${a._id}/recommenders`}
                        className="text-xs text-[#0EA5E9] hover:underline shrink-0 ml-2"
                      >
                        Manage Recommenders
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100" />

            {/* Submission */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Submission</p>
              <div className="space-y-1">
                <CheckItem
                  done={p.applicationFeePaid}
                  label="Application Fee Paid"
                  detail={prog?.applicationFee ? `€${prog.applicationFee}` : undefined}
                  loading={updating === "applicationFeePaid"}
                  onClick={() => toggleProgress({ applicationFeePaid: !p.applicationFeePaid })}
                />
              </div>
            </div>

            </>)}
            {(a.applicationStatus === "Accepted" || a.applicationStatus === "Enrolled" || a.applicationStatus === "Waitlisted") && (
              <>
                {country && (
                  <div className={`rounded-lg p-3 text-sm border ${
                    country.verificationStatus === "manual"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : country.verificationStatus === "ai"
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}>
                    <p className="font-semibold">
                      {country.verificationStatus === "manual"
                        ? "✓ Manually Verified Visa Info"
                        : country.verificationStatus === "ai"
                        ? "⚠ AI-Verified Visa Info"
                        : "⚠ Unverified Visa Info"}
                    </p>
                    <p className="text-xs mt-1">
                      {country.verificationStatus === "manual"
                        ? "This country's visa information has been manually verified."
                        : country.verificationStatus === "ai"
                        ? "Visa information was compiled using AI. Always confirm requirements, fees, and documents with the official embassy."
                        : "Visa information has not been verified. Always check the latest requirements on the official embassy website."}
                    </p>
                  </div>
                )}
                <div className="border-t border-slate-100" />
                {/* Visa Documents Checklist */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Visa Documents</p>
                  <div className="space-y-1">
                    {country?.requiredDocuments?.length ? (
                      country.requiredDocuments.map((doc, i) => {
                        const done = p.visaDocumentsObtained?.includes(doc);
                        return (
                          <CheckItem
                            key={i}
                            done={done}
                            label={doc}
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
                      <p className="text-sm text-slate-400">No visa documents configured for {uni?.country}</p>
                    )}
                    {/* Extra visa docs — pending & obtained not in country requiredDocuments */}
                    {(p.visaDocumentsPending?.filter((d) => !country?.requiredDocuments?.includes(d)).length > 0 ||
                      p.visaDocumentsObtained?.filter((d) => !country?.requiredDocuments?.includes(d)).length > 0) && (
                      <>
                        <div className="border-t border-slate-100 my-2" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Extra Documents</p>
                        {/* Pending — not yet obtained */}
                        {p.visaDocumentsPending
                          ?.filter((d) => !country?.requiredDocuments?.includes(d))
                          .map((doc, i) => (
                            <CheckItem
                              key={`pending-${i}`}
                              done={false}
                              label={doc}
                              loading={updating === "visaDocumentsPending"}
                              onClick={() => {
                                const pending = (p.visaDocumentsPending || []).filter((d) => d !== doc);
                                const obtained = [...(p.visaDocumentsObtained || []), doc];
                                toggleProgress({ visaDocumentsPending: pending, visaDocumentsObtained: obtained });
                              }}
                            />
                          ))}
                        {/* Obtained extras — already checked */}
                        {p.visaDocumentsObtained
                          ?.filter((d) => !country?.requiredDocuments?.includes(d))
                          .map((doc, i) => (
                            <div key={`obtained-${i}`} className="flex items-center gap-2 text-sm px-2 py-1.5 group">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 shrink-0">
                                <Check className="h-3 w-3 text-emerald-600" />
                              </div>
                              <span className="text-[#0F172A] font-medium flex-1">{doc}</span>
                              <button
                                onClick={() => {
                                  const docs = (p.visaDocumentsObtained || []).filter((d) => d !== doc);
                                  const pending = [...(p.visaDocumentsPending || []), doc];
                                  toggleProgress({ visaDocumentsObtained: docs, visaDocumentsPending: pending });
                                }}
                                disabled={updating === "visaDocumentsObtained"}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity disabled:opacity-40"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                      </>
                    )}
                  </div>
                  {/* Inline document adder for extra visa docs */}
                  {!isReadOnly && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={docInput}
                        onChange={(e) => setDocInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVisaDocument(); } }}
                        className="h-8 text-sm rounded-lg border-slate-200 flex-1"
                        placeholder="Add extra visa document..."
                      />
                      <Button type="button" size="sm" variant="outline" className="h-8 border-slate-200 rounded-lg" onClick={addVisaDocument} disabled={!docInput.trim() || updating === "visaDocumentsObtained"}>
                        Add
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100" />

                {/* Visa & Interview */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Visa & Interview</p>
                  <div className="space-y-1">
                    <CheckItem done={p.visaApplied} label="Visa Applied" loading={updating === "visaApplied"} onClick={() => toggleProgress({ visaApplied: !p.visaApplied })} />
                    {p.visaApplied && (
                      <CheckItem done={p.visaApproved ?? false} label="Visa Approved" loading={updating === "visaApproved"} onClick={() => toggleProgress({ visaApproved: !p.visaApproved })} />
                    )}
                    <CheckItem done={p.interviewCompleted} label="Interview Completed" detail={p.interviewScheduled ? formatDate(p.interviewScheduled) : undefined} loading={updating === "interviewCompleted"} onClick={() => toggleProgress({ interviewCompleted: !p.interviewCompleted })} />
                  </div>
                </div>
              </>
            )}

            {a.applicationStatus === "Preparing" && (
              <div className="pt-2">
                <div className="border-t border-slate-100 pt-4">
                  <Button
                    onClick={() => setSubmitDialogOpen(true)}
                    disabled={updating === "submit"}
                    className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-xl"
                  >
                    {updating === "submit" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit Application</>}
                  </Button>
                </div>
              </div>
            )}
            {a.applicationStatus === "Applied" && (
              <div className="pt-2">
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-[#0F172A] mb-1">Admission Decision</p>
                  <p className="text-xs text-slate-400 mb-3">Record the result of your application</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => updateStatus("Accepted")}
                      disabled={updating === "status"}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl"
                    >
                      <Check className="mr-1.5 h-4 w-4" /> Accepted
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateStatus("Waitlisted")}
                      disabled={updating === "status"}
                      className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 rounded-xl"
                    >
                      ⏳ Waitlisted
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateStatus("Rejected")}
                      disabled={updating === "status"}
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 rounded-xl"
                    >
                      <X className="mr-1.5 h-4 w-4" /> Rejected
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {a.applicationStatus === "Waitlisted" && (
              <div className="pt-2">
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-[#0F172A] mb-1">Waitlist Outcome</p>
                  <p className="text-xs text-slate-400 mb-3">Was your waitlist resolved?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => updateStatus("Accepted")}
                      disabled={updating === "status"}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl"
                    >
                      <Check className="mr-1.5 h-4 w-4" /> Accepted
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateStatus("Rejected")}
                      disabled={updating === "status"}
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 rounded-xl"
                    >
                      <X className="mr-1.5 h-4 w-4" /> Rejected
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        Created {formatDate(a.createdAt)} · Updated {formatDate(a.updatedAt)}
      </p>
    </div>
  );
}
