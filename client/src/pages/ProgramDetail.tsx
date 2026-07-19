import { useNavigate, useParams, Link } from "react-router-dom";
import {
  useProgram,
  useDeleteProgram,
  useToggleProgramOfficial,
  useFavorites,
  useAddFavorite,
  useRemoveFavorite,
} from "@/lib/api";
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
  Shield,
  Globe,
  Star,
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

const verificationStyles: Record<string, string> = {
  manual: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 rounded-full",
  ai: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 rounded-full",
  none: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30 rounded-full",
};
const verificationLabels: Record<string, string> = {
  manual: "✓ Verified",
  ai: "⚠ AI-Verified",
  none: "⚠ Unverified",
};

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
    <div className="flex justify-between border-b border-border py-3 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
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
  const toggleProgOfficial = useToggleProgramOfficial();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

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
        <h2 className="text-lg font-semibold text-foreground">Program not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">Back</button>
      </div>
    );
  }

  const p = program;
  const uni = typeof p.universityId === "object" ? p.universityId : null;
  const isCreator = !!user && p.createdBy === user._id;
  const canEdit = isAdmin || (isCreator && !p.isOfficial);

  const isFavorited = !!favorites?.some(
    (f) => f.type === "program" && f.itemId === p._id,
  );
  const favoritePending = addFavorite.isPending || removeFavorite.isPending;

  async function handleToggleFavorite(): Promise<void> {
    try {
      if (isFavorited) {
        await removeFavorite.mutateAsync({ type: "program", itemId: p._id });
        toast.success("Removed from saved");
      } else {
        await addFavorite.mutateAsync({ type: "program", itemId: p._id });
        toast.success("Saved");
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update saved items"));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {p.name}
              <Badge className={`ml-2 ${verificationStyles[p.verificationStatus || "ai"]}`}>
                {verificationLabels[p.verificationStatus || "ai"]}
              </Badge>
            </h1>
            {uni && (
              <Link to={`/universities/${uni._id}`} className="text-sm text-muted-foreground hover:text-primary">
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
                  className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors">
                  <Check className="h-4 w-4" /> Added to Compare
                </button>
              ) : (
                <button onClick={() => addToCompare(p._id)}
                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  <GitCompare className="h-4 w-4" /> Add to Compare
                </button>
              )}
              <button
                onClick={handleToggleFavorite}
                disabled={favoritePending}
                aria-pressed={isFavorited}
                title={isFavorited ? "Remove from saved" : "Save program"}
                className={
                  isFavorited
                    ? "inline-flex items-center gap-1 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors disabled:opacity-50"
                    : "inline-flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                }
              >
                <Star className={`h-4 w-4${isFavorited ? " fill-current" : ""}`} />
                {isFavorited ? "Saved" : "Save"}
              </button>
              <Link to={`/applications/new?programId=${p._id}`} className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <PlusCircle className="h-4 w-4" /> Apply
              </Link>
            </>
          )}
          {!isStudent && !isAdmin && (
            <Link to={`/applications/new?programId=${p._id}`} className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <PlusCircle className="h-4 w-4" /> Apply to this Program
            </Link>
          )}
          {canEdit && (
            <Link to={`/programs/${p._id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"><Pencil className="h-4 w-4" /> Edit</Link>
          )}
          {isAdmin && (
            <>
              <Button onClick={() => toggleProgOfficial.mutate(p._id)} variant="outline" size="sm" disabled={toggleProgOfficial.isPending} className="border-border rounded-lg">
                {toggleProgOfficial.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Shield className="mr-1 h-3 w-3" />}
                {p.isOfficial ? "Make Custom" : "Make Official"}
              </Button>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /> Delete</button>
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
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <GraduationCap className="h-5 w-5 text-muted-foreground" /> University
              </h3>
            </div>
            <div className="p-6">
              <DetailRow label="Name" value={<Link to={`/universities/${uni._id}`} className="text-primary hover:underline">{uni.name}</Link>} />
              <DetailRow label="Country" value={uni.country} />
              <DetailRow label="City" value={uni.city} />
              {uni.ranking && <DetailRow label="Ranking" value={`#${uni.ranking}`} />}
            </div>
          </div>
        )}

        {/* Program Details */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <BookOpen className="h-5 w-5 text-muted-foreground" /> Program Details
            </h3>
          </div>
          <div className="p-6">
            <DetailRow label="Degree Level" value={p.degreeLevel} />
            <DetailRow label="Language" value={p.languageOfInstruction} />
            <DetailRow label="Tuition" value={formatCurrency(p.tuitionFee, p.tuitionCurrency, p.tuitionPeriod)} />
            <DetailRow label="Deadline" value={formatDate(p.applicationDeadline)} />
            {p.requiresSOP && <DetailRow label="SOP Required" value="Yes" />}
            {p.recommendationLetters > 0 && <DetailRow label="Recommendation Letters" value={String(p.recommendationLetters)} />}
            {p.applicationFee != null && <DetailRow label="Application Fee" value={`€${p.applicationFee}`} />}
            {p.programUrl && (
              <div className="flex items-center gap-2 py-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={p.programUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  Program Website
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <BookOpen className="h-5 w-5 text-muted-foreground" /> Requirements
          </h3>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {p.testRequirements?.map((tr, i) => (
            <DetailRow key={i} label={`${tr.name} Requirement`} value={tr.minimumScore} />
          ))}
          {p.requiredDocuments.length > 0 && (
            <div className="py-2 sm:col-span-2">
              <span className="text-sm text-muted-foreground">Required Documents:</span>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.requiredDocuments.map((doc, i) => (
                  <Badge key={i} variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">{doc}</Badge>
                ))}
              </div>
            </div>
          )}
          {(!p.testRequirements || p.testRequirements.length === 0) && p.requiredDocuments.length === 0 && (
            <p className="text-sm text-muted-foreground sm:col-span-2">No specific requirements</p>
          )}
        </div>
      </div>

      {/* Scholarship */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <DollarSign className="h-5 w-5 text-muted-foreground" /> Scholarship
          </h3>
        </div>
        <div className="p-6">
          <div className="flex justify-between border-b border-border py-3 text-sm last:border-0">
            <span className="text-muted-foreground">Scholarship Available</span>
            <Badge variant={p.scholarshipAvailable ? "default" : "secondary"} className="rounded-full px-2.5 py-0.5 text-xs font-medium">
              {p.scholarshipAvailable ? "Available" : "Not Available"}
            </Badge>
          </div>
          {p.scholarshipAvailable && p.scholarshipDetails && (
            <p className="mt-1 text-sm text-foreground">{p.scholarshipDetails}</p>
          )}
        </div>
      </div>

      {p.notes && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <BookOpen className="h-5 w-5 text-muted-foreground" /> Notes
            </h3>
          </div>
          <div className="p-6">
            <p className="whitespace-pre-wrap text-sm text-foreground">{p.notes}</p>
          </div>
        </div>
      )}

      {!isStudent && !isAdmin && (
        <div className="flex justify-center">
          <Link to={`/applications/new?programId=${p._id}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <PlusCircle className="h-5 w-5" /> Apply to {p.name}
          </Link>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Created {formatDate(p.createdAt)} · Updated {formatDate(p.updatedAt)}
      </p>
    </div>
  );
}
