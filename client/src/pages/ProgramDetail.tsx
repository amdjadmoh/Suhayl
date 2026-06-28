import { useNavigate, useParams, Link } from "react-router-dom";
import { useProgram, useDeleteProgram } from "@/lib/api";
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
  AlertCircle,
  Loader2,
  PlusCircle,
  Globe,
  GraduationCap,
  Calendar,
  DollarSign,
  BookOpen,
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
    <div className="flex justify-between py-2 text-sm">
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
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: program, isLoading, isError, error } = useProgram(id ?? "");
  const deleteMutation = useDeleteProgram();

  async function handleDelete(): Promise<void> {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Program deleted");
      navigate("/universities");
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

  if (isError || !program) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Program not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Back</Button>
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
            {uni && (
              <Link to={`/universities/${uni._id}`} className="text-sm text-muted-foreground hover:text-primary">
                {uni.name} · {uni.city}, {uni.country}
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <Button size="sm" asChild>
              <Link to={`/applications/new?programId=${p._id}`}>
                <PlusCircle className="mr-1 h-4 w-4" /> Apply to this Program
              </Link>
            </Button>
          )}
          {isAdmin && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/programs/${p._id}/edit`}><Pencil className="mr-1 h-4 w-4" /> Edit</Link>
              </Button>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><Trash2 className="mr-1 h-4 w-4 text-destructive" /> Delete</Button>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5" /> University
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <DetailRow label="Name" value={<Link to={`/universities/${uni._id}`} className="text-primary hover:underline">{uni.name}</Link>} />
              <DetailRow label="Country" value={uni.country} />
              <DetailRow label="City" value={uni.city} />
              {uni.ranking && <DetailRow label="Ranking" value={`#${uni.ranking}`} />}
            </CardContent>
          </Card>
        )}

        {/* Program Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" /> Program Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <DetailRow label="Degree Level" value={p.degreeLevel} />
            <DetailRow label="Language" value={p.languageOfInstruction} />
            <DetailRow label="Tuition" value={formatCurrency(p.tuitionFee, p.tuitionCurrency, p.tuitionPeriod)} />
            <DetailRow label="Deadline" value={formatDate(p.applicationDeadline)} />
          </CardContent>
        </Card>
      </div>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {p.gpaRequirement && <DetailRow label="GPA Requirement" value={p.gpaRequirement} />}
          {p.ieltsRequirement && <DetailRow label="IELTS Requirement" value={p.ieltsRequirement} />}
          {p.toeflRequirement && <DetailRow label="TOEFL Requirement" value={p.toeflRequirement} />}
          {p.requiredDocuments.length > 0 && (
            <div className="sm:col-span-2 py-2">
              <span className="text-sm text-muted-foreground">Required Documents:</span>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.requiredDocuments.map((doc, i) => (
                  <Badge key={i} variant="outline">{doc}</Badge>
                ))}
              </div>
            </div>
          )}
          {!p.gpaRequirement && !p.ieltsRequirement && !p.toeflRequirement && p.requiredDocuments.length === 0 && (
            <p className="text-sm text-muted-foreground sm:col-span-2">No specific requirements</p>
          )}
        </CardContent>
      </Card>

      {/* Scholarship */}
      <Card>
        <CardHeader>
          <CardTitle>Scholarship</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between py-2 text-sm">
            <span className="text-muted-foreground">Scholarship Available</span>
            <Badge variant={p.scholarshipAvailable ? "default" : "secondary"}>
              {p.scholarshipAvailable ? "Available" : "Not Available"}
            </Badge>
          </div>
          {p.scholarshipAvailable && p.scholarshipDetails && (
            <p className="mt-1 text-sm">{p.scholarshipDetails}</p>
          )}
        </CardContent>
      </Card>

      {p.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{p.notes}</p>
          </CardContent>
        </Card>
      )}

      {!isAdmin && (
        <div className="flex justify-center">
          <Button size="lg" asChild>
            <Link to={`/applications/new?programId=${p._id}`}>
              <PlusCircle className="mr-2 h-5 w-5" /> Apply to {p.name}
            </Link>
          </Button>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Created {formatDate(p.createdAt)} · Updated {formatDate(p.updatedAt)}
      </p>
    </div>
  );
}
