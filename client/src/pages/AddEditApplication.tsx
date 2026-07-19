import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { ApplicationFormData } from "@/types/application";
import {
  useCreateApplication,
  useUpdateApplication,
  useApplication,
  usePrograms,
} from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, AlertCircle, Loader2, Send } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

export default function AddEditApplication(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedProgramId = searchParams.get("programId") ?? "";
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const isAgency = user?.role === "agency";

  const { data: existing, isLoading: appLoading } = useApplication(id ?? "");
  const { data: programs } = usePrograms();
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();

  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData>({
    defaultValues: {
      programId: preselectedProgramId || "",
      studentName: isAgency ? "" : user?.name ?? "",
      studentEmail: isAgency ? "" : user?.email ?? "",
      applicationStatus: "Preparing",
      notes: "",
    },
  });

  const selectedProg = programs?.programs?.find((p) => p._id === watch("programId"));

  // Auto-fill deadline when program is selected (new mode)
  useEffect(() => {
    if (selectedProg?.applicationDeadline && !isEdit) {
      const currentDeadline = watch("applicationDeadline");
      if (!currentDeadline) {
        setValue("applicationDeadline", selectedProg.applicationDeadline.split("T")[0]);
      }
    }
  }, [selectedProg, isEdit, setValue, watch]);

  // Load existing data for edit mode
  useEffect(() => {
    if (isEdit && existing) {
      reset({
        programId: typeof existing.programId === "string" ? existing.programId : existing.programId?._id ?? "",
        studentName: existing.studentName,
        studentEmail: existing.studentEmail,
        applicationStatus: existing.applicationStatus,
        applicationDeadline: existing.applicationDeadline?.split("T")[0] ?? "",
        notes: existing.notes ?? "",
      });
    } else if (preselectedProgramId) {
      setValue("programId", preselectedProgramId);
    }
  }, [existing, isEdit, reset, preselectedProgramId, setValue]);

  async function onCreate(data: ApplicationFormData): Promise<void> {
    try {
      const result = await createMutation.mutateAsync({
        ...data,
        applicationStatus: "Preparing",
        applicationProgress: {},
      });
      toast.success("Application created");
      navigate(`/applications/${result._id}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create application"));
    }
  }

  async function onUpdate(data: ApplicationFormData): Promise<void> {
    try {
      await updateMutation.mutateAsync({ id: id!, data: { ...data } });
      toast.success("Application updated");
      navigate(`/applications/${id}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update"));
    }
  }

  if (isEdit && appLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="rounded-xl border border-border bg-card p-6"><Skeleton className="h-96 w-full" /></div>
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

  // ─── NEW APPLICATION ───────────────────────────────────────────────
  if (!isEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">New Application</h1>
        </div>

        <form onSubmit={handleSubmit(onCreate)} className="space-y-6">
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-base font-semibold text-foreground">Select a program to start tracking</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Program <span className="text-red-500">*</span></Label>
                <Select value={(watch("programId") as string) ?? ""} onValueChange={(v) => setValue("programId", v)}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select a program..." /></SelectTrigger>
                  <SelectContent>
                    {programs?.programs?.map((p) => {
                      const uni = typeof p.universityId === "object" ? p.universityId : null;
                      return (
                        <SelectItem key={p._id} value={p._id}>{p.name} {uni ? `(${uni.name})` : ""}</SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.programId && <p className="text-sm text-red-500">{errors.programId.message}</p>}
              </div>
              {selectedProg && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm space-y-1">
                  <p><span className="text-muted-foreground">Degree:</span> {selectedProg.degreeLevel} · {selectedProg.languageOfInstruction}</p>
                  <p><span className="text-muted-foreground">Tuition:</span> €{selectedProg.tuitionFee.toLocaleString()}/{selectedProg.tuitionPeriod.toLowerCase()}</p>
                  {selectedProg.applicationDeadline && <p><span className="text-muted-foreground">Deadline:</span> {new Date(selectedProg.applicationDeadline).toLocaleDateString()}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" className="border-border hover:bg-muted rounded-xl" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !watch("programId")} className="bg-foreground text-background hover:bg-foreground/90 rounded-xl">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                : <><Send className="mr-2 h-4 w-4" /> Start Application</>}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ─── EDIT APPLICATION (metadata only) ──────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit Application
          </h1>
          <p className="text-sm text-muted-foreground">{selectedProg?.name ?? "Application"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onUpdate)} className="space-y-6">
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-base font-semibold text-foreground">Details</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Status</Label>
              <Select value={watch("applicationStatus") ?? "Preparing"}
                onValueChange={(v) => setValue("applicationStatus", v as ApplicationFormData["applicationStatus"])}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>{APPLICATION_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Deadline</Label>
              <Input type="date" className="rounded-lg border-border focus:border-primary focus:ring-primary/20" {...register("applicationDeadline")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium text-foreground">Notes</Label>
              <Textarea className="rounded-lg border-border focus:border-primary focus:ring-primary/20" {...register("notes")} placeholder="Any additional notes..." rows={4} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" className="border-border hover:bg-muted rounded-xl" onClick={() => navigate(`/applications/${id}`)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-foreground text-background hover:bg-foreground/90 rounded-xl">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
