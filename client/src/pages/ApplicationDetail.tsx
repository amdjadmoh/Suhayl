import { useNavigate, useParams, Link } from "react-router-dom";
import { useApplication, useDeleteApplication } from "@/lib/api";
import { STATUS_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft, Pencil, Trash2, AlertCircle, Loader2, ClipboardList, User, Mail,
  GraduationCap, Globe, BookOpen, DollarSign,
} from "lucide-react";
import { useState } from "react";
import { getErrorMessage } from "@/lib/utils";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Not set";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function DetailRow({ label, value }: { label: string; value: string | number | undefined | React.ReactElement }): React.ReactElement {
  if (value === undefined || value === null || value === "") return <></>;
  return (
    <div className="flex justify-between border-b border-slate-50 py-3 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-[#0F172A]">{value}</span>
    </div>
  );
}

export default function ApplicationDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: application, isLoading, isError, error } = useApplication(id ?? "");
  const deleteMutation = useDeleteApplication();

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
  const prog = typeof a.programId === "object" ? a.programId : null;
  const uni = prog?.universityId;
  const p = a.applicationProgress;

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
          <Link to={`/applications/${a._id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors"><Pencil className="h-4 w-4" /> Edit</Link>
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
              <>
                <DetailRow label="Program" value={<Link to={`/programs/${prog._id}`} className="text-[#0EA5E9] hover:underline">{prog.name}</Link>} />
                <DetailRow label="Degree" value={prog.degreeLevel} />
                <DetailRow label="Language" value={prog.languageOfInstruction} />
                {prog.tuitionFee && (
                  <DetailRow label="Tuition" value={`€${prog.tuitionFee.toLocaleString()}/${prog.tuitionPeriod?.toLowerCase()}`} />
                )}
              </>
            )}
            <div className="border-t border-slate-100 my-2" />
            {uni && (
              <>
                <DetailRow label="University" value={<Link to={`/universities/${uni._id}`} className="text-[#0EA5E9] hover:underline">{uni.name}</Link>} />
                <DetailRow label="Country" value={uni.country} />
                <DetailRow label="City" value={uni.city} />
              </>
            )}
          </div>
        </div>

        {/* Application Info */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <ClipboardList className="h-5 w-5 text-slate-400" /> Application Details
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 border-b border-slate-50 py-3 text-sm">
              <User className="h-4 w-4 text-slate-400" />
              <span className="font-medium text-[#0F172A]">{a.studentName}</span>
            </div>
            <div className="flex items-center gap-2 border-b border-slate-50 py-3 text-sm">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-[#0F172A]">{a.studentEmail}</span>
            </div>
            <div className="border-t border-slate-100 my-1" />
            <DetailRow label="Status" value={<Badge variant="secondary" className={STATUS_COLORS[a.applicationStatus]}>{a.applicationStatus}</Badge>} />
            <DetailRow label="Deadline" value={formatDate(a.applicationDeadline)} />
            {a.livingCostEstimate && <DetailRow label="Living Cost / Month" value={`€${a.livingCostEstimate.toLocaleString()}`} />}
          </div>
        </div>
      </div>

      {/* Application Progress */}
      <div className="rounded-xl border border-slate-100 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
            <ClipboardList className="h-5 w-5 text-slate-400" /> Application Progress
          </h3>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Documents</p>
              <p className="text-xs text-[#0F172A]">{p.documentsObtained.length} obtained</p>
              {p.documentsObtained.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.documentsObtained.map((doc, i) => (
                    <Badge key={i} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">✓ {doc}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Language Tests</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">IELTS</span>{p.ieltsTaken && p.ieltsScore ? <span className="font-medium text-emerald-600">{p.ieltsScore}</span> : <span className="text-slate-400">Not taken</span>}</div>
                <div className="flex justify-between"><span className="text-slate-500">TOEFL</span>{p.toeflTaken && p.toeflScore ? <span className="font-medium text-emerald-600">{p.toeflScore}</span> : <span className="text-slate-400">Not taken</span>}</div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Checklist</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">GPA Verified</span>{p.gpaVerified ? <span className="text-emerald-600">✓</span> : <span className="text-slate-400">—</span>}</div>
                <div className="flex justify-between"><span className="text-slate-500">Recommendations</span><span className="font-medium text-[#0F172A]">{p.recommendationsReceived}/{p.recommendationsRequested}</span></div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SOP</span>
                  <Badge variant="secondary" className={
                    p.sopStatus === "final" ? "rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-600" :
                    p.sopStatus === "draft" ? "rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-600" : "rounded-full px-2.5 py-0.5 text-xs font-medium"
                  }>{p.sopStatus.replace("_", " ")}</Badge>
                </div>
                <div className="flex justify-between"><span className="text-slate-500">Fee</span>{p.applicationFeePaid ? <span className="text-emerald-600">Paid</span> : <span className="text-slate-400">Unpaid</span>}</div>
                {p.applicationSubmittedDate && <div className="flex justify-between"><span className="text-slate-500">Submitted</span><span className="font-medium text-[#0F172A]">{formatDate(p.applicationSubmittedDate)}</span></div>}
              </div>
            </div>
            {(p.visaApplied || p.interviewScheduled) && (
              <div>
                <p className="mb-2 text-xs font-medium text-slate-500">Visa & Interview</p>
                <div className="space-y-1 text-xs">
                  {p.visaApplied && <div className="flex justify-between"><span className="text-slate-500">Visa Applied</span><span className="text-emerald-600">✓</span></div>}
                  {p.visaApproved !== undefined && <div className="flex justify-between"><span className="text-slate-500">Visa Approved</span>{p.visaApproved ? <span className="text-emerald-600">✓</span> : <span className="text-amber-600">Pending</span>}</div>}
                  {p.interviewScheduled && <div className="flex justify-between"><span className="text-slate-500">Interview</span><span className="font-medium text-[#0F172A]">{formatDate(p.interviewScheduled)}</span></div>}
                  <div className="flex justify-between"><span className="text-slate-500">Interview Done</span>{p.interviewCompleted ? <span className="text-emerald-600">✓</span> : <span className="text-slate-400">—</span>}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {a.notes && (
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <BookOpen className="h-5 w-5 text-slate-400" /> Notes
            </h3>
          </div>
          <div className="p-6">
            <p className="whitespace-pre-wrap text-sm text-[#0F172A]">{a.notes}</p>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        Created {formatDate(a.createdAt)} · Updated {formatDate(a.updatedAt)}
      </p>
    </div>
  );
}
