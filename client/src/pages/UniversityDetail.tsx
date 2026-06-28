import { useNavigate, useParams, Link } from "react-router-dom";
import { useUniversity, useDeleteUniversity, useProgramsByUniversity, useDeleteProgram, useCountries } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    } catch {
      toast.error("Failed to delete university");
    }
  }

  async function handleDeleteProgram(programId: string): Promise<void> {
    try {
      await deleteProgramMutation.mutateAsync(programId);
      toast.success("Program deleted");
      setDeleteProgOpen(null);
    } catch {
      toast.error("Failed to delete program");
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
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">
          {isError ? "Failed to load university" : "University not found"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : ""}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/universities")}>
          Back to Universities
        </Button>
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/universities")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{u.name}</h1>
            <p className="text-muted-foreground">{u.city}, {u.country}</p>
            {u.ranking && <p className="text-xs text-muted-foreground">Ranking: #{u.ranking}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/programs/new?universityId=${u._id}`}>
                  <PlusCircle className="mr-1 h-4 w-4" /> Add Program
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/universities/${u._id}/edit`}>
                  <Pencil className="mr-1 h-4 w-4" /> Edit
                </Link>
              </Button>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="mr-1 h-4 w-4 text-destructive" /> Delete
                  </Button>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" /> Visa Info — {u.country}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Acceptance Rate</p>
                <p className="text-2xl font-bold text-emerald-600">{country.visaAcceptanceRate}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bank Account</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: country.currency, minimumFractionDigits: 0 }).format(country.visaBankAccountAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account Type</p>
                <Badge variant={country.visaBankAccountLocked ? "default" : "secondary"}
                  className={country.visaBankAccountLocked ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                  {country.visaBankAccountLocked ? "Blocked Account" : "Regular Account"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Living Cost / Mo</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: country.currency, minimumFractionDigits: 0 }).format(country.livingCostEstimate)}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground mb-1">Visa Requirements</p>
            <p className="text-sm leading-relaxed">{country.visaRequirements}</p>
          </CardContent>
        </Card>
      )}

      {/* University Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About {u.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {u.websiteUrl && (
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a href={u.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                Visit Website
              </a>
            </div>
          )}
          {u.notes && <p className="text-sm text-muted-foreground">{u.notes}</p>}
          {!u.websiteUrl && !u.notes && (
            <p className="text-sm text-muted-foreground">No additional information available.</p>
          )}
        </CardContent>
      </Card>

      {/* Programs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Programs ({programs?.length ?? 0})
            </CardTitle>
            {isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/programs/new?universityId=${u._id}`}>
                  <PlusCircle className="mr-1 h-4 w-4" /> Add Program
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
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
            <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
              <GraduationCap className="mb-3 h-12 w-12 text-muted-foreground/30" />
              <p>No programs added yet</p>
              {isAdmin && (
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link to={`/programs/new?universityId=${u._id}`}>
                    <PlusCircle className="mr-1 h-4 w-4" /> Add Program
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
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
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link to={`/programs/${program._id}`} className="font-semibold hover:text-primary">
            {program.name}
          </Link>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
            <Badge variant="secondary" className="mt-1 bg-emerald-100 text-emerald-700 text-xs">Scholarship Available</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isAdmin && (
            <Button size="sm" asChild>
              <Link to={`/applications/new?programId=${program._id}`}>Apply</Link>
            </Button>
          )}
          {isAdmin && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/programs/${program._id}`}>View</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/programs/${program._id}/edit`}>
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
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
