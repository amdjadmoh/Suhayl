import { useNavigate, useParams, Link } from "react-router-dom";
import { useUniversity, useDeleteUniversity, useCountries } from "@/lib/api";
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
  ClipboardList,
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
  const { data: countries } = useCountries();
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
  const country = countries?.find((c) => c.name === u.country);

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
              u.requiredDocuments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No requirements specified
                </p>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Country Visa Info */}
      {country && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Visa Info — {u.country}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Acceptance Rate</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {country.visaAcceptanceRate}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bank Account</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: country.currency,
                    minimumFractionDigits: 0,
                  }).format(country.visaBankAccountAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account Type</p>
                <Badge
                  variant={country.visaBankAccountLocked ? "default" : "secondary"}
                  className={
                    country.visaBankAccountLocked
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }
                >
                  {country.visaBankAccountLocked ? "Blocked Account" : "Regular Account"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Living Cost / Mo</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: country.currency,
                    minimumFractionDigits: 0,
                  }).format(country.livingCostEstimate)}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Visa Requirements
              </p>
              <p className="text-sm leading-relaxed">
                {country.visaRequirements}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Application Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Documents
              </p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{
                      width: `${u.requiredDocuments.length > 0 ? Math.round((u.applicationProgress.documentsObtained.length / u.requiredDocuments.length) * 100) : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium">
                  {u.applicationProgress.documentsObtained.length}/{u.requiredDocuments.length}
                </span>
              </div>
              {u.requiredDocuments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {u.requiredDocuments.map((doc) => {
                    const obtained =
                      u.applicationProgress.documentsObtained.includes(doc)
                    return (
                      <Badge
                        key={doc}
                        variant={obtained ? "default" : "outline"}
                        className={
                          obtained
                            ? "bg-emerald-100 text-emerald-700 text-xs"
                            : "text-xs text-muted-foreground"
                        }
                      >
                        {obtained ? "✓" : "○"} {doc}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Language Tests
              </p>
              <div className="space-y-1 text-xs">
                {u.ieltsRequirement && (
                  <div className="flex justify-between">
                    <span>IELTS (req: {u.ieltsRequirement})</span>
                    {u.applicationProgress.ieltsTaken &&
                    u.applicationProgress.ieltsScore ? (
                      <span className="font-medium text-emerald-600">
                        {u.applicationProgress.ieltsScore}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not taken</span>
                    )}
                  </div>
                )}
                {u.toeflRequirement && (
                  <div className="flex justify-between">
                    <span>TOEFL (req: {u.toeflRequirement})</span>
                    {u.applicationProgress.toeflTaken &&
                    u.applicationProgress.toeflScore ? (
                      <span className="font-medium text-emerald-600">
                        {u.applicationProgress.toeflScore}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not taken</span>
                    )}
                  </div>
                )}
                {!u.ieltsRequirement && !u.toeflRequirement && (
                  <span className="text-muted-foreground">
                    No test requirements
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Checklist
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>GPA Verified</span>
                  {u.applicationProgress.gpaVerified ? (
                    <span className="text-emerald-600">✓</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Recommendations</span>
                  <span className="font-medium">
                    {u.applicationProgress.recommendationsReceived}/
                    {u.applicationProgress.recommendationsRequested}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SOP</span>
                  <Badge
                    variant="secondary"
                    className={
                      u.applicationProgress.sopStatus === "final"
                        ? "bg-emerald-100 text-emerald-700 text-xs"
                        : u.applicationProgress.sopStatus === "draft"
                          ? "bg-amber-100 text-amber-700 text-xs"
                          : "text-xs"
                    }
                  >
                    {u.applicationProgress.sopStatus.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Application Fee</span>
                  {u.applicationProgress.applicationFeePaid ? (
                    <span className="text-emerald-600">Paid</span>
                  ) : (
                    <span className="text-muted-foreground">Unpaid</span>
                  )}
                </div>
                {u.applicationProgress.applicationSubmittedDate && (
                  <div className="flex justify-between">
                    <span>Submitted</span>
                    <span className="font-medium">
                      {formatDate(
                        u.applicationProgress.applicationSubmittedDate,
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {(u.applicationProgress.visaApplied ||
              u.applicationProgress.interviewScheduled) && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Visa & Interview
                </p>
                <div className="space-y-1 text-xs">
                  {u.applicationProgress.visaApplied && (
                    <div className="flex justify-between">
                      <span>Visa Applied</span>
                      <span className="text-emerald-600">✓</span>
                    </div>
                  )}
                  {u.applicationProgress.visaApproved !== undefined && (
                    <div className="flex justify-between">
                      <span>Visa Approved</span>
                      {u.applicationProgress.visaApproved ? (
                        <span className="text-emerald-600">✓</span>
                      ) : (
                        <span className="text-amber-600">Pending</span>
                      )}
                    </div>
                  )}
                  {u.applicationProgress.interviewScheduled && (
                    <div className="flex justify-between">
                      <span>Interview</span>
                      <span className="font-medium">
                        {formatDate(
                          u.applicationProgress.interviewScheduled,
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Interview Done</span>
                    {u.applicationProgress.interviewCompleted ? (
                      <span className="text-emerald-600">✓</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
