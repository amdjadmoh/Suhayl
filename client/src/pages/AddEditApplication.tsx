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

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, X, AlertCircle, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

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
  } = useForm<ApplicationFormData & { applicationProgress: ApplicationProgress }>({
    defaultValues: {
      programId: preselectedProgramId || "",
      studentName: isAgency ? "" : user?.name ?? "",
      studentEmail: isAgency ? "" : user?.email ?? "",
      applicationStatus: "Wishlist",
      notes: "",
    },
  });

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
      // Pre-fill from URL params (overrides defaults if set)
      if (preseedStudentName) setValue("studentName", preseedStudentName);
      if (preseedStudentEmail) setValue("studentEmail", preseedStudentEmail);
    }
  }, [existing, isEdit, reset, preseedStudentName, preseedStudentEmail, setValue]);

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
    } catch (err: unknown) {
      toast.error(isEdit ? getErrorMessage(err, "Failed to update application") : getErrorMessage(err, "Failed to create application"));
    }
  }

  const selectedProg = programs?.programs?.find((p) => p._id === watch("programId"));

  if (isEdit && appLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="rounded-xl border border-slate-100 bg-white p-6"><Skeleton className="h-96 w-full" /></div>
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
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></button>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">{isEdit ? "Edit Application" : "New Application"}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Program Selection */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Program</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Program <span className="text-red-500">*</span></Label>
              <Select value={watch("programId") ?? ""}
                onValueChange={(v) => setValue("programId", v)}>
                <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select a program..." /></SelectTrigger>
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
              {errors.programId && <p className="text-sm text-red-500">{errors.programId.message}</p>}
            </div>
            {selectedProg && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/30 p-3 text-sm space-y-1">
                <p><span className="text-slate-500">Degree:</span> {selectedProg.degreeLevel}</p>
                <p><span className="text-slate-500">Language:</span> {selectedProg.languageOfInstruction}</p>
                <p><span className="text-slate-500">Tuition:</span> €{selectedProg.tuitionFee.toLocaleString()}/{selectedProg.tuitionPeriod.toLowerCase()}</p>
                {selectedProg.applicationDeadline && (
                  <p><span className="text-slate-500">Deadline:</span> {new Date(selectedProg.applicationDeadline).toLocaleDateString()}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Student Info */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Student Information</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            {isAgency ? (
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm font-medium text-slate-700">Student <span className="text-red-500">*</span></Label>
                <Select value={watch("studentEmail") ?? ""}
                  onValueChange={(v) => {
                    const student = students?.find((s) => s.email === v);
                    if (student) { setValue("studentName", student.name); setValue("studentEmail", student.email); }
                  }}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select a student..." /></SelectTrigger>
                  <SelectContent>
                    {students?.map((s) => (
                      <SelectItem key={s._id} value={s.email}>{s.name} ({s.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {watch("studentName") && <p className="text-sm text-slate-500">{watch("studentName")} · {watch("studentEmail")}</p>}
              </div>
            ) : (
              <>
                <input type="hidden" {...register("studentName")} />
                <input type="hidden" {...register("studentEmail")} />
                {user && <div className="sm:col-span-2 text-sm text-slate-500">Student: {user.name} · {user.email}</div>}
              </>
            )}
          </div>
        </div>

        {/* Application Details */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Application Details</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Status</Label>
              <Select value={watch("applicationStatus") ?? "Wishlist"}
                onValueChange={(v) => setValue("applicationStatus", v as ApplicationFormData["applicationStatus"])}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>{APPLICATION_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Deadline</Label>
              <Input type="date" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("applicationDeadline")} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Living Cost Estimate / Month</Label>
              <Input type="number" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("livingCostEstimate", { setValueAs: (v) => v === "" ? undefined : Number(v) })} placeholder="e.g. 800" />
            </div>
          </div>
        </div>

        {/* Application Progress */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Application Progress</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium text-slate-700">Documents Obtained</Label>
              <div className="flex gap-2">
                <Input value={documentInput} onChange={(e) => setDocumentInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDocument(); } }}
                  className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                  placeholder="Add a document..." />
                <Button type="button" variant="outline" className="border-slate-200 hover:bg-slate-50 rounded-xl" onClick={addDocument}>Add</Button>
              </div>
              {progress.documentsObtained.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {progress.documentsObtained.map((doc, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-sm inline-flex items-center gap-1">{doc}
                      <button type="button" onClick={() => removeDocument(i)} className="ml-1 rounded-full hover:text-red-500"><X className="h-3 w-3" /></button></span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="ielts" checked={progress.ieltsTaken} onCheckedChange={(c) => setProgress((p) => ({ ...p, ieltsTaken: c === true }))} />
                <Label htmlFor="ielts" className="text-sm font-medium text-slate-700">IELTS Taken</Label>
              </div>
              {progress.ieltsTaken && <Input type="number" step="0.5" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" placeholder="Score" value={progress.ieltsScore ?? ""}
                onChange={(e) => setProgress((p) => ({ ...p, ieltsScore: e.target.value ? parseFloat(e.target.value) : undefined }))} />}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="toefl" checked={progress.toeflTaken} onCheckedChange={(c) => setProgress((p) => ({ ...p, toeflTaken: c === true }))} />
                <Label htmlFor="toefl" className="text-sm font-medium text-slate-700">TOEFL Taken</Label>
              </div>
              {progress.toeflTaken && <Input type="number" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" placeholder="Score" value={progress.toeflScore ?? ""}
                onChange={(e) => setProgress((p) => ({ ...p, toeflScore: e.target.value ? parseInt(e.target.value) : undefined }))} />}
            </div>
              <div className="flex items-center gap-2">
                <Checkbox id="gpa" checked={progress.gpaVerified} onCheckedChange={(c) => setProgress((p) => ({ ...p, gpaVerified: c === true }))} />
                <Label htmlFor="gpa" className="text-sm font-medium text-slate-700">GPA Verified</Label>
              </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium text-slate-700">Recommendations</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Requested:</span>
                  <div className="flex items-center border rounded">
                    <button type="button" className="px-2 hover:bg-slate-100" onClick={() => setProgress((p) => ({ ...p, recommendationsRequested: Math.max(0, p.recommendationsRequested - 1) }))}>-</button>
                    <span className="w-8 text-center text-sm">{progress.recommendationsRequested}</span>
                    <button type="button" className="px-2 hover:bg-slate-100" onClick={() => setProgress((p) => ({ ...p, recommendationsRequested: p.recommendationsRequested + 1 }))}>+</button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Received:</span>
                  <div className="flex items-center border rounded">
                    <button type="button" className="px-2 hover:bg-slate-100" onClick={() => setProgress((p) => ({ ...p, recommendationsReceived: Math.max(0, p.recommendationsReceived - 1) }))}>-</button>
                    <span className="w-8 text-center text-sm">{progress.recommendationsReceived}</span>
                    <button type="button" className="px-2 hover:bg-slate-100" onClick={() => setProgress((p) => ({ ...p, recommendationsReceived: p.recommendationsReceived + 1 }))}>+</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">SOP Status</Label>
              <Select value={progress.sopStatus} onValueChange={(v) => setProgress((p) => ({ ...p, sopStatus: v as ApplicationProgress["sopStatus"] }))}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
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
                <Label htmlFor="fee" className="text-sm font-medium text-slate-700">Fee Paid</Label>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Submitted On</Label>
              <Input type="date" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" value={progress.applicationSubmittedDate?.split("T")[0] ?? ""}
                onChange={(e) => setProgress((p) => ({ ...p, applicationSubmittedDate: e.target.value || undefined }))} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="visa" checked={progress.visaApplied}
                onCheckedChange={(c) => setProgress((p) => ({ ...p, visaApplied: c === true }))} />
                <Label htmlFor="visa" className="text-sm font-medium text-slate-700">Visa Applied</Label>
            </div>
            {progress.visaApplied && (
              <div className="flex items-center gap-2">
                <Checkbox id="visa-ok" checked={progress.visaApproved ?? false}
                  onCheckedChange={(c) => setProgress((p) => ({ ...p, visaApproved: c === true }))} />
                <Label htmlFor="visa-ok" className="text-sm font-medium text-slate-700">Visa Approved</Label>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Interview Scheduled</Label>
              <Input type="date" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" value={progress.interviewScheduled?.split("T")[0] ?? ""}
                onChange={(e) => setProgress((p) => ({ ...p, interviewScheduled: e.target.value || undefined }))} />
            </div>
            {progress.interviewScheduled && (
              <div className="flex items-center gap-2">
                <Checkbox id="interview-done" checked={progress.interviewCompleted}
                  onCheckedChange={(c) => setProgress((p) => ({ ...p, interviewCompleted: c === true }))} />
                <Label htmlFor="interview-done" className="text-sm font-medium text-slate-700">Interview Completed</Label>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Notes</h3>
          </div>
          <div className="p-6">
            <Textarea className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("notes")} placeholder="Any additional notes..." rows={4} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" className="border-slate-200 hover:bg-slate-50 rounded-xl" onClick={() => navigate("/applications")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              : <><Save className="mr-2 h-4 w-4" /> {isEdit ? "Update" : "Save"} Application</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
