import { useNavigate, useParams, Link } from "react-router-dom";
import { useUniversity, useDeleteUniversity, useProgramsByUniversity, useDeleteProgram, useCountries } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Globe,
  AlertCircle,
  Loader2,
  PlusCircle,
  GraduationCap,
  BookOpen,
  DollarSign,
  Calendar,
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
import type { Program } from "@/types/program";

function formatCurrency(amount: number, currency: string, period: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount) + ` / ${period.toLowerCase()}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UniversityDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: university, isLoading, isError, error } = useUniversity(id ?? "");
  const { data: programs, isLoading: progLoading } = useProgramsByUniversity(id ?? "");
  const { data: countries } = useCountries();
  const deleteMutation = useDeleteUniversity();
  const deleteProgramMutation = useDeleteProgram();
  const [deleteProgOpen, setDeleteProgOpen] = useState<string | null>(null);

  async function handleDelete(): Promise<void> {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("University deleted");
      navigate("/universities");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete university"));
    }
  }

  async function handleDeleteProgram(programId: string): Promise<void> {
    try {
      await deleteProgramMutation.mutateAsync(programId);
      toast.success("Program deleted");
      setDeleteProgOpen(null);
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

  if (isError || !university) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-[#0F172A]">
          {isError ? "Failed to load university" : "University not found"}
        </h2>
        <p className="text-sm text-slate-500">
          {error instanceof Error ? error.message : ""}
        </p>
        <button onClick={() => navigate("/universities")} className="mt-4 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
          Back to Universities
        </button>
      </div>
    );
  }

  const u = university;
  const country = countries?.find((c) => c.name === u.country);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/universities")} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">{u.name}</h1>
            <p className="text-sm text-slate-500">{u.city}, {u.country}</p>
            {u.ranking && <p className="text-xs text-slate-400">Ranking: #{u.ranking}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Link to={`/programs/new?universityId=${u._id}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors">
                <PlusCircle className="h-4 w-4" /> Add Program
              </Link>
              <Link to={`/universities/${u._id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors">
                <Pencil className="h-4 w-4" /> Edit
              </Link>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium transition-colors text-red-500 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete University</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete {u.name}? This will also delete all its programs and applications.
                    </DialogDescription>
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

      {/* Visa Info */}
      {country && (
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <Globe className="h-5 w-5 text-slate-400" /> Visa Info — {u.country}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">Acceptance Rate</p>
                <p className="text-2xl font-bold text-emerald-600">{country.visaAcceptanceRate}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Bank Account</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: country.currency, minimumFractionDigits: 0 }).format(country.visaBankAccountAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Account Type</p>
                <Badge className={
                  country.visaBankAccountLocked ? "rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700" : "rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700"
                }>
                  {country.visaBankAccountLocked ? "Blocked Account" : "Regular Account"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500">Living Cost / Mo</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: country.currency, minimumFractionDigits: 0 }).format(country.livingCostEstimate)}
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 my-4" />
            <p className="mb-1 text-xs text-slate-500">Visa Requirements</p>
            <p className="text-sm leading-relaxed text-[#0F172A]">{country.visaRequirements}</p>
          </div>
        </div>
      )}

      {/* University Info */}
      <div className="rounded-xl border border-slate-100 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
            <GraduationCap className="h-5 w-5 text-slate-400" /> About {u.name}
          </h3>
        </div>
        <div className="p-6">
          {u.websiteUrl && (
            <div className="mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" />
              <a href={u.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0EA5E9] hover:underline">
                Visit Website
              </a>
            </div>
          )}
          {u.notes && <p className="text-sm text-slate-500">{u.notes}</p>}
          {!u.websiteUrl && !u.notes && (
            <p className="text-sm text-slate-500">No additional information available.</p>
          )}
        </div>
      </div>

      {/* Programs */}
      <div className="rounded-xl border border-slate-100 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
            <BookOpen className="h-5 w-5 text-slate-400" /> Programs ({programs?.length ?? 0})
          </h3>
          {isAdmin && (
            <Link to={`/programs/new?universityId=${u._id}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors">
              <PlusCircle className="h-4 w-4" /> Add Program
            </Link>
          )}
        </div>
        <div className="p-6">
          {progLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : programs && programs.length > 0 ? (
            <div className="space-y-3">
              {programs.map((p) => (
                <ProgramCard key={p._id} program={p} isAdmin={isAdmin} universityId={id!}
                  onDelete={() => handleDeleteProgram(p._id)}
                  deleteOpen={deleteProgOpen === p._id}
                  setDeleteOpen={(o) => setDeleteProgOpen(o ? p._id : null)}
                  deletePending={deleteProgramMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center text-slate-500">
              <GraduationCap className="mb-3 h-12 w-12 text-slate-300" />
              <p>No programs added yet</p>
              {isAdmin && (
                <Link to={`/programs/new?universityId=${u._id}`} className="mt-3 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors">
                  <PlusCircle className="h-4 w-4" /> Add Program
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        Created {new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · Updated {new Date(u.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
  );
}

function ProgramCard({ program, isAdmin, universityId, onDelete, deleteOpen, setDeleteOpen, deletePending }: {
  program: Program;
  isAdmin: boolean;
  universityId: string;
  onDelete: () => void;
  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  deletePending: boolean;
}): React.ReactElement {
  return (
    <div className="rounded-lg border border-slate-100 p-4 transition-all hover:border-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link to={`/programs/${program._id}`} className="font-semibold text-[#0F172A] hover:text-[#0EA5E9]">
            {program.name}
          </Link>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            <span>{program.degreeLevel}</span>
            <span>·</span>
            <span>{program.languageOfInstruction}</span>
            <span>·</span>
            <span>{formatCurrency(program.tuitionFee, program.tuitionCurrency, program.tuitionPeriod)}</span>
            {program.applicationDeadline && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(program.applicationDeadline)}
                </span>
              </>
            )}
          </div>
          {program.scholarshipAvailable && (
            <Badge className="mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">Scholarship Available</Badge>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          {!isAdmin && (
            <Link to={`/applications/new?programId=${program._id}`} className="inline-flex items-center rounded-xl bg-[#0EA5E9] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0284C7]">
              Apply
            </Link>
          )}
          {isAdmin && (
            <>
              <Link to={`/programs/${program._id}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors">
                View
              </Link>
              <Link to={`/programs/${program._id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <Pencil className="h-3.5 w-3.5 text-slate-500" />
              </Link>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-red-500 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Program</DialogTitle>
                    <DialogDescription>Are you sure you want to delete "{program.name}"?</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={onDelete} disabled={deletePending}>
                      {deletePending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
