import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { ApplicationFormData, ApplicationProgress } from "@/types/application";
import {
  useCreateApplication,
  useUpdateApplication,
  useApplication,
  usePrograms,
  useStudents,
} from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, X, AlertCircle, Loader2 } from "lucide-react";

export default function AddEditApplication(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedProgramId = searchParams.get("programId") ?? "";
  const preseedStudentName = searchParams.get("studentName") ?? "";
  const preseedStudentEmail = searchParams.get("studentEmail") ?? "";
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const isAgency = user?.role === "agency";

  const { data: existing, isLoading: appLoading } = useApplication(id ?? "");
  const { data: programs } = usePrograms();
  const { data: students } = useStudents();
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();

  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData & { applicationProgress: ApplicationProgress }>();

  const [progress, setProgress] = useState<ApplicationProgress>({
    documentsObtained: [], ieltsTaken: false, toeflTaken: false,
    gpaVerified: false, recommendationsRequested: 0, recommendationsReceived: 0,
    sopStatus: "not_started", applicationFeePaid: false,
    visaApplied: false, interviewCompleted: false,
  });

  const [documentInput, setDocumentInput] = useState("");

  useEffect(() => {
    if (isEdit && existing) {
      reset({
        programId: typeof existing.programId === "string" ? existing.programId : existing.programId?._id ?? "",
        studentName: existing.studentName,
        studentEmail: existing.studentEmail,
        applicationStatus: existing.applicationStatus,
        applicationDeadline: existing.applicationDeadline?.split("T")[0] ?? "",
        notes: existing.notes ?? "",
        livingCostEstimate: existing.livingCostEstimate,
      });
      setProgress(existing.applicationProgress);
    } else {
      if (preselectedProgramId) setValue("programId", preselectedProgramId);
      if (preseedStudentName) setValue("studentName", preseedStudentName);
      if (preseedStudentEmail) setValue("studentEmail", preseedStudentEmail);
      if (!isAgency && user && !preseedStudentName) {
        setValue("studentName", user.name);
        setValue("studentEmail", user.email);
      }
    }
  }, [existing, isEdit, reset, preselectedProgramId, preseedStudentName, preseedStudentEmail, user, isAgency, setValue]);

  function addDocument(): void {
    const trimmed = documentInput.trim();
    if (trimmed && !progress.documentsObtained.includes(trimmed)) {
      setProgress((p) => ({ ...p, documentsObtained: [...p.documentsObtained, trimmed] }));
      setDocumentInput("");
    }
  }

  function removeDocument(index: number): void {
    setProgress((p) => ({ ...p, documentsObtained: p.documentsObtained.filter((_, i) => i !== index) }));
  }

  async function onSubmit(data: ApplicationFormData): Promise<void> {
    const payload: any = { ...data, applicationProgress: progress };
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success("Application updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Application created");
      }
      navigate("/applications");
    } catch {
      toast.error(isEdit ? "Failed to update application" : "Failed to create application");
    }
  }

  const selectedProg = programs?.programs?.find((p) => p._id === watch("programId"));

  if (isEdit && appLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (isEdit && !existing) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Application not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/applications")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-2xl font-bold tracking-tight">{isEdit ? "Edit Application" : "New Application"}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Program Selection */}
        <Card>
          <CardHeader><CardTitle>Program</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Program <span className="text-destructive">*</span></Label>
              <Select value={watch("programId") ?? ""}
                onValueChange={(v) => setValue("programId", v)}>
                <SelectTrigger><SelectValue placeholder="Select a program..." /></SelectTrigger>
                <SelectContent>
                  {programs?.programs?.map((p) => {
                    const uni = typeof p.universityId === "object" ? p.universityId : null;
                    return (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name} {uni ? `(${uni.name})` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.programId && <p className="text-sm text-destructive">{errors.programId.message}</p>}
            </div>
            {selectedProg && (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                <p><span className="text-muted-foreground">Degree:</span> {selectedProg.degreeLevel}</p>
                <p><span className="text-muted-foreground">Language:</span> {selectedProg.languageOfInstruction}</p>
                <p><span className="text-muted-foreground">Tuition:</span> €{selectedProg.tuitionFee.toLocaleString()}/{selectedProg.tuitionPeriod.toLowerCase()}</p>
                {selectedProg.applicationDeadline && (
                  <p><span className="text-muted-foreground">Deadline:</span> {new Date(selectedProg.applicationDeadline).toLocaleDateString()}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Info */}
        <Card>
          <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {isAgency ? (
              <div className="space-y-2 sm:col-span-2">
                <Label>Student <span className="text-destructive">*</span></Label>
                <Select value={watch("studentEmail") ?? ""}
                  onValueChange={(v) => {
                    const student = students?.find((s) => s.email === v);
                    if (student) { setValue("studentName", student.name); setValue("studentEmail", student.email); }
                  }}>
                  <SelectTrigger><SelectValue placeholder="Select a student..." /></SelectTrigger>
                  <SelectContent>
                    {students?.map((s) => (
                      <SelectItem key={s._id} value={s.email}>{s.name} ({s.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {watch("studentName") && <p className="text-sm text-muted-foreground">{watch("studentName")} · {watch("studentEmail")}</p>}
              </div>
            ) : (
              <>
                <input type="hidden" {...register("studentName")} />
                <input type="hidden" {...register("studentEmail")} />
                {user && <div className="sm:col-span-2 text-sm text-muted-foreground">Student: {user.name} · {user.email}</div>}
              </>
            )}
          </CardContent>
        </Card>

        {/* Application Details */}
        <Card>
          <CardHeader><CardTitle>Application Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={watch("applicationStatus") ?? "Wishlist"}
                onValueChange={(v) => setValue("applicationStatus", v as ApplicationFormData["applicationStatus"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{APPLICATION_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input type="date" {...register("applicationDeadline")} />
            </div>
            <div className="space-y-2">
              <Label>Living Cost Estimate / Month</Label>
              <Input type="number" {...register("livingCostEstimate", { setValueAs: (v) => v === "" ? undefined : Number(v) })} placeholder="e.g. 800" />
            </div>
          </CardContent>
        </Card>

        {/* Application Progress */}
        <Card>
          <CardHeader><CardTitle>Application Progress</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Documents Obtained</Label>
              <div className="flex gap-2">
                <Input value={documentInput} onChange={(e) => setDocumentInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDocument(); } }} placeholder="Add a document..." />
                <Button type="button" variant="outline" onClick={addDocument}>Add</Button>
              </div>
              {progress.documentsObtained.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {progress.documentsObtained.map((doc, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 px-3">{doc}
                      <button type="button" onClick={() => removeDocument(i)} className="ml-1 rounded-full hover:text-destructive"><X className="h-3 w-3" /></button></Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="ielts" checked={progress.ieltsTaken} onCheckedChange={(c) => setProgress((p) => ({ ...p, ieltsTaken: c === true }))} />
                <Label htmlFor="ielts">IELTS Taken</Label>
              </div>
              {progress.ieltsTaken && <Input type="number" step="0.5" placeholder="Score" value={progress.ieltsScore ?? ""}
                onChange={(e) => setProgress((p) => ({ ...p, ieltsScore: e.target.value ? parseFloat(e.target.value) : undefined }))} />}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="toefl" checked={progress.toeflTaken} onCheckedChange={(c) => setProgress((p) => ({ ...p, toeflTaken: c === true }))} />
                <Label htmlFor="toefl">TOEFL Taken</Label>
              </div>
              {progress.toeflTaken && <Input type="number" placeholder="Score" value={progress.toeflScore ?? ""}
                onChange={(e) => setProgress((p) => ({ ...p, toeflScore: e.target.value ? parseInt(e.target.value) : undefined }))} />}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="gpa" checked={progress.gpaVerified} onCheckedChange={(c) => setProgress((p) => ({ ...p, gpaVerified: c === true }))} />
              <Label htmlFor="gpa">GPA Verified</Label>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Recommendations</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Requested:</span>
                  <div className="flex items-center border rounded">
                    <button type="button" className="px-2 hover:bg-muted" onClick={() => setProgress((p) => ({ ...p, recommendationsRequested: Math.max(0, p.recommendationsRequested - 1) }))}>-</button>
                    <span className="w-8 text-center text-sm">{progress.recommendationsRequested}</span>
                    <button type="button" className="px-2 hover:bg-muted" onClick={() => setProgress((p) => ({ ...p, recommendationsRequested: p.recommendationsRequested + 1 }))}>+</button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Received:</span>
                  <div className="flex items-center border rounded">
                    <button type="button" className="px-2 hover:bg-muted" onClick={() => setProgress((p) => ({ ...p, recommendationsReceived: Math.max(0, p.recommendationsReceived - 1) }))}>-</button>
                    <span className="w-8 text-center text-sm">{progress.recommendationsReceived}</span>
                    <button type="button" className="px-2 hover:bg-muted" onClick={() => setProgress((p) => ({ ...p, recommendationsReceived: p.recommendationsReceived + 1 }))}>+</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>SOP Status</Label>
              <Select value={progress.sopStatus} onValueChange={(v) => setProgress((p) => ({ ...p, sopStatus: v as ApplicationProgress["sopStatus"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="fee" checked={progress.applicationFeePaid}
                onCheckedChange={(c) => setProgress((p) => ({ ...p, applicationFeePaid: c === true }))} />
              <Label htmlFor="fee">Fee Paid</Label>
            </div>
            <div className="space-y-2">
              <Label>Submitted On</Label>
              <Input type="date" value={progress.applicationSubmittedDate?.split("T")[0] ?? ""}
                onChange={(e) => setProgress((p) => ({ ...p, applicationSubmittedDate: e.target.value || undefined }))} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="visa" checked={progress.visaApplied}
                onCheckedChange={(c) => setProgress((p) => ({ ...p, visaApplied: c === true }))} />
              <Label htmlFor="visa">Visa Applied</Label>
            </div>
            {progress.visaApplied && (
              <div className="flex items-center gap-2">
                <Checkbox id="visa-ok" checked={progress.visaApproved ?? false}
                  onCheckedChange={(c) => setProgress((p) => ({ ...p, visaApproved: c === true }))} />
                <Label htmlFor="visa-ok">Visa Approved</Label>
              </div>
            )}
            <div className="space-y-2">
              <Label>Interview Scheduled</Label>
              <Input type="date" value={progress.interviewScheduled?.split("T")[0] ?? ""}
                onChange={(e) => setProgress((p) => ({ ...p, interviewScheduled: e.target.value || undefined }))} />
            </div>
            {progress.interviewScheduled && (
              <div className="flex items-center gap-2">
                <Checkbox id="interview-done" checked={progress.interviewCompleted}
                  onCheckedChange={(c) => setProgress((p) => ({ ...p, interviewCompleted: c === true }))} />
                <Label htmlFor="interview-done">Interview Completed</Label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea {...register("notes")} placeholder="Any additional notes..." rows={4} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/applications")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              : <><Save className="mr-2 h-4 w-4" /> {isEdit ? "Update" : "Save"} Application</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
