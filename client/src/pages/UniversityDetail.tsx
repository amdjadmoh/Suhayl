import { useNavigate, useParams, Link } from "react-router-dom";
import { useUniversity, useDeleteUniversity } from "@/lib/api";
import { STATUS_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Globe,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState } from "react";

function formatCurrency(
  amount: number,
  currency: string,
  period: string,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ` / ${period.toLowerCase()}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Not set";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}): React.ReactElement {
  if (value === undefined || value === null || value === "") return <></>;
  return (
    <div className="flex justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function UniversityDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: university, isLoading, isError, error } = useUniversity(
    id ?? "",
  );
  const deleteMutation = useDeleteUniversity();

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
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
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/universities")}
        >
          Back to Universities
        </Button>
      </div>
    );
  }

  const u = university;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/universities")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{u.name}</h1>
            <p className="text-muted-foreground">
              {u.city}, {u.country}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={STATUS_COLORS[u.applicationStatus]}
          >
            {u.applicationStatus}
          </Badge>
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
                  Are you sure you want to delete {u.name}? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Basic Info + Program */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <DetailRow label="Country" value={u.country} />
            <DetailRow label="City" value={u.city} />
            {u.ranking && <DetailRow label="Ranking" value={`#${u.ranking}`} />}
            {u.websiteUrl && (
              <div className="flex justify-between py-2 text-sm">
                <span className="text-muted-foreground">Website</span>
                <a
                  href={u.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  <Globe className="mr-1 inline h-3.5 w-3.5" />
                  Visit
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Program Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <DetailRow label="Program" value={u.program} />
            <DetailRow label="Degree Level" value={u.degreeLevel} />
            <DetailRow label="Language" value={u.languageOfInstruction} />
          </CardContent>
        </Card>
      </div>

      {/* Costs + Requirements */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Costs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <DetailRow
              label="Tuition Fee"
              value={formatCurrency(
                u.tuitionFee,
                u.tuitionCurrency,
                u.tuitionPeriod,
              )}
            />
            {u.livingCostEstimate && (
              <DetailRow
                label="Living Cost / Month"
                value={formatCurrency(
                  u.livingCostEstimate,
                  u.tuitionCurrency,
                  "Month",
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {u.gpaRequirement && (
              <DetailRow label="GPA" value={u.gpaRequirement} />
            )}
            {u.ieltsRequirement && (
              <DetailRow label="IELTS" value={u.ieltsRequirement} />
            )}
            {u.toeflRequirement && (
              <DetailRow label="TOEFL" value={u.toeflRequirement} />
            )}
            {u.visaRequirements && (
              <DetailRow label="Visa" value={u.visaRequirements} />
            )}
            {u.requiredDocuments.length > 0 && (
              <div className="py-2">
                <span className="text-sm text-muted-foreground">
                  Documents:
                </span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {u.requiredDocuments.map((doc, i) => (
                    <Badge key={i} variant="outline">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {!u.gpaRequirement &&
              !u.ieltsRequirement &&
              !u.toeflRequirement &&
              !u.visaRequirements &&
              u.requiredDocuments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No requirements specified
                </p>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Scholarship + Application + Notes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scholarship & Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-muted-foreground">Scholarship</span>
              <Badge
                variant={u.scholarshipAvailable ? "default" : "secondary"}
              >
                {u.scholarshipAvailable ? "Available" : "Not Available"}
              </Badge>
            </div>
            {u.scholarshipAvailable && u.scholarshipDetails && (
              <div className="py-2">
                <span className="text-sm text-muted-foreground">Details:</span>
                <p className="mt-1 text-sm">{u.scholarshipDetails}</p>
              </div>
            )}
            <Separator className="my-2" />
            <DetailRow label="Deadline" value={formatDate(u.applicationDeadline)} />
            <DetailRow label="Status" value={u.applicationStatus} />
          </CardContent>
        </Card>

        {u.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{u.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timestamps */}
      <p className="text-center text-xs text-muted-foreground">
        Created {formatDate(u.createdAt)} · Updated {formatDate(u.updatedAt)}
      </p>
    </div>
  );
}
