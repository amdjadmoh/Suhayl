import { useNavigate, useParams, Link } from "react-router-dom";
import { useApplication, useDeleteApplication } from "@/lib/api";
import { STATUS_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    } catch {
      toast.error("Failed to delete application");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Application not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/applications")}>Back</Button>
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/applications")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{prog?.name ?? "Application"}</h1>
            <p className="text-muted-foreground">for {a.studentName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={STATUS_COLORS[a.applicationStatus]}>{a.applicationStatus}</Badge>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/applications/${a._id}/edit`}><Pencil className="mr-1 h-4 w-4" /> Edit</Link>
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Trash2 className="mr-1 h-4 w-4 text-destructive" /> Delete</Button>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5" /> Program
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {prog && (
              <>
                <DetailRow label="Program" value={<Link to={`/programs/${prog._id}`} className="text-primary hover:underline">{prog.name}</Link>} />
                <DetailRow label="Degree" value={prog.degreeLevel} />
                <DetailRow label="Language" value={prog.languageOfInstruction} />
                {prog.tuitionFee && (
                  <DetailRow label="Tuition" value={`€${prog.tuitionFee.toLocaleString()}/${prog.tuitionPeriod?.toLowerCase()}`} />
                )}
              </>
            )}
            <Separator className="my-2" />
            {uni && (
              <>
                <DetailRow label="University" value={<Link to={`/universities/${uni._id}`} className="text-primary hover:underline">{uni.name}</Link>} />
                <DetailRow label="Country" value={uni.country} />
                <DetailRow label="City" value={uni.city} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Application Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5" /> Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2 py-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{a.studentName}</span>
            </div>
            <div className="flex items-center gap-2 py-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{a.studentEmail}</span>
            </div>
            <Separator className="my-1" />
            <DetailRow label="Status" value={<Badge variant="secondary" className={STATUS_COLORS[a.applicationStatus]}>{a.applicationStatus}</Badge>} />
            <DetailRow label="Deadline" value={formatDate(a.applicationDeadline)} />
            {a.livingCostEstimate && <DetailRow label="Living Cost / Month" value={`€${a.livingCostEstimate.toLocaleString()}`} />}
          </CardContent>
        </Card>
      </div>

      {/* Application Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Application Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Documents</p>
              <p className="text-xs">{p.documentsObtained.length} obtained</p>
              {p.documentsObtained.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.documentsObtained.map((doc, i) => (
                    <Badge key={i} className="bg-emerald-100 text-emerald-700 text-xs">✓ {doc}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Language Tests</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>IELTS</span>{p.ieltsTaken && p.ieltsScore ? <span className="text-emerald-600 font-medium">{p.ieltsScore}</span> : <span className="text-muted-foreground">Not taken</span>}</div>
                <div className="flex justify-between"><span>TOEFL</span>{p.toeflTaken && p.toeflScore ? <span className="text-emerald-600 font-medium">{p.toeflScore}</span> : <span className="text-muted-foreground">Not taken</span>}</div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Checklist</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>GPA Verified</span>{p.gpaVerified ? <span className="text-emerald-600">✓</span> : <span className="text-muted-foreground">—</span>}</div>
                <div className="flex justify-between"><span>Recommendations</span><span className="font-medium">{p.recommendationsReceived}/{p.recommendationsRequested}</span></div>
                <div className="flex justify-between">
                  <span>SOP</span>
                  <Badge variant="secondary" className={
                    p.sopStatus === "final" ? "bg-emerald-100 text-emerald-700 text-xs" :
                    p.sopStatus === "draft" ? "bg-amber-100 text-amber-700 text-xs" : "text-xs"
                  }>{p.sopStatus.replace("_", " ")}</Badge>
                </div>
                <div className="flex justify-between"><span>Fee</span>{p.applicationFeePaid ? <span className="text-emerald-600">Paid</span> : <span className="text-muted-foreground">Unpaid</span>}</div>
                {p.applicationSubmittedDate && <div className="flex justify-between"><span>Submitted</span><span className="font-medium">{formatDate(p.applicationSubmittedDate)}</span></div>}
              </div>
            </div>
            {(p.visaApplied || p.interviewScheduled) && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Visa & Interview</p>
                <div className="space-y-1 text-xs">
                  {p.visaApplied && <div className="flex justify-between"><span>Visa Applied</span><span className="text-emerald-600">✓</span></div>}
                  {p.visaApproved !== undefined && <div className="flex justify-between"><span>Visa Approved</span>{p.visaApproved ? <span className="text-emerald-600">✓</span> : <span className="text-amber-600">Pending</span>}</div>}
                  {p.interviewScheduled && <div className="flex justify-between"><span>Interview</span><span className="font-medium">{formatDate(p.interviewScheduled)}</span></div>}
                  <div className="flex justify-between"><span>Interview Done</span>{p.interviewCompleted ? <span className="text-emerald-600">✓</span> : <span className="text-muted-foreground">—</span>}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {a.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap text-sm">{a.notes}</p></CardContent>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Created {formatDate(a.createdAt)} · Updated {formatDate(a.updatedAt)}
      </p>
    </div>
  );
}
