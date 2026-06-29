import { useNavigate, useParams, Link } from "react-router-dom";
import { useProgram, useDeleteProgram } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { useCompare } from "@/lib/compareContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  PlusCircle,
  GraduationCap,
  DollarSign,
  BookOpen,
  GitCompare,
  Check,
} from "lucide-react";
import { useState } from "react";
import { getErrorMessage } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function formatCurrency(amount: number, currency: string, period: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount) + ` / ${period.toLowerCase()}`;
}

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

export default function ProgramDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: program, isLoading, isError } = useProgram(id ?? "");
  const deleteMutation = useDeleteProgram();

  async function handleDelete(): Promise<void> {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Program deleted");
      navigate("/universities");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete program"));
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !program) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-[#0F172A]">Program not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">Back</button>
      </div>
    );
  }

  const p = program;
  const uni = typeof p.universityId === "object" ? p.universityId : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">{p.name}</h1>
            {uni && (
              <Link to={`/universities/${uni._id}`} className="text-sm text-slate-500 hover:text-[#0EA5E9]">
                {uni.name} · {uni.city}, {uni.country}
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isStudent && (
            <>
              {isInCompare(p._id) ? (
                <button onClick={() => removeFromCompare(p._id)}
                  className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                  <Check className="h-4 w-4" /> Added to Compare
                </button>
              ) : (
                <button onClick={() => addToCompare(p._id)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <GitCompare className="h-4 w-4" /> Add to Compare
                </button>
              )}
              <Link to={`/applications/new?programId=${p._id}`} className="inline-flex items-center gap-1 rounded-xl bg-[#0EA5E9] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0284C7]">
                <PlusCircle className="h-4 w-4" /> Apply
              </Link>
            </>
          )}
          {!isStudent && !isAdmin && (
            <Link to={`/applications/new?programId=${p._id}`} className="inline-flex items-center gap-1 rounded-xl bg-[#0EA5E9] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0284C7]">
              <PlusCircle className="h-4 w-4" /> Apply to this Program
            </Link>
          )}
          {isAdmin && (
            <>
              <Link to={`/programs/${p._id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors"><Pencil className="h-4 w-4" /> Edit</Link>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium transition-colors text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /> Delete</button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Program</DialogTitle>
                    <DialogDescription>Are you sure you want to delete "{p.name}"?</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* University Info */}
        {uni && (
          <div className="rounded-xl border border-slate-100 bg-white">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
                <GraduationCap className="h-5 w-5 text-slate-400" /> University
              </h3>
            </div>
            <div className="p-6">
              <DetailRow label="Name" value={<Link to={`/universities/${uni._id}`} className="text-[#0EA5E9] hover:underline">{uni.name}</Link>} />
              <DetailRow label="Country" value={uni.country} />
              <DetailRow label="City" value={uni.city} />
              {uni.ranking && <DetailRow label="Ranking" value={`#${uni.ranking}`} />}
            </div>
          </div>
        )}

        {/* Program Details */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <BookOpen className="h-5 w-5 text-slate-400" /> Program Details
            </h3>
          </div>
          <div className="p-6">
            <DetailRow label="Degree Level" value={p.degreeLevel} />
            <DetailRow label="Language" value={p.languageOfInstruction} />
            <DetailRow label="Tuition" value={formatCurrency(p.tuitionFee, p.tuitionCurrency, p.tuitionPeriod)} />
            <DetailRow label="Deadline" value={formatDate(p.applicationDeadline)} />
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="rounded-xl border border-slate-100 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
            <BookOpen className="h-5 w-5 text-slate-400" /> Requirements
          </h3>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {p.gpaRequirement && <DetailRow label="GPA Requirement" value={p.gpaRequirement} />}
          {p.ieltsRequirement && <DetailRow label="IELTS Requirement" value={p.ieltsRequirement} />}
          {p.toeflRequirement && <DetailRow label="TOEFL Requirement" value={p.toeflRequirement} />}
          {p.requiredDocuments.length > 0 && (
            <div className="py-2 sm:col-span-2">
              <span className="text-sm text-slate-500">Required Documents:</span>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.requiredDocuments.map((doc, i) => (
                  <Badge key={i} variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">{doc}</Badge>
                ))}
              </div>
            </div>
          )}
          {!p.gpaRequirement && !p.ieltsRequirement && !p.toeflRequirement && p.requiredDocuments.length === 0 && (
            <p className="text-sm text-slate-500 sm:col-span-2">No specific requirements</p>
          )}
        </div>
      </div>

      {/* Scholarship */}
      <div className="rounded-xl border border-slate-100 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
            <DollarSign className="h-5 w-5 text-slate-400" /> Scholarship
          </h3>
        </div>
        <div className="p-6">
          <div className="flex justify-between border-b border-slate-50 py-3 text-sm last:border-0">
            <span className="text-slate-500">Scholarship Available</span>
            <Badge variant={p.scholarshipAvailable ? "default" : "secondary"} className="rounded-full px-2.5 py-0.5 text-xs font-medium">
              {p.scholarshipAvailable ? "Available" : "Not Available"}
            </Badge>
          </div>
          {p.scholarshipAvailable && p.scholarshipDetails && (
            <p className="mt-1 text-sm text-[#0F172A]">{p.scholarshipDetails}</p>
          )}
        </div>
      </div>

      {p.notes && (
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <BookOpen className="h-5 w-5 text-slate-400" /> Notes
            </h3>
          </div>
          <div className="p-6">
            <p className="whitespace-pre-wrap text-sm text-[#0F172A]">{p.notes}</p>
          </div>
        </div>
      )}

      {!isStudent && !isAdmin && (
        <div className="flex justify-center">
          <Link to={`/applications/new?programId=${p._id}`} className="inline-flex items-center gap-2 rounded-xl bg-[#0EA5E9] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#0284C7]">
            <PlusCircle className="h-5 w-5" /> Apply to {p.name}
          </Link>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        Created {formatDate(p.createdAt)} · Updated {formatDate(p.updatedAt)}
      </p>
    </div>
  );
}
