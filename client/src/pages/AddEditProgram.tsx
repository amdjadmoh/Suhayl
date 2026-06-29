import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { ProgramFormData } from "@/types/program";
import {
  useCreateProgram,
  useUpdateProgram,
  useProgram,
  useUniversities,
} from "@/lib/api";
import {
  CURRENCIES,
  DEGREE_LEVELS,
  TUITION_PERIODS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, X, AlertCircle, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

export default function AddEditProgram(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedUniId = searchParams.get("universityId") ?? "";
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: existing, isLoading } = useProgram(id ?? "");
  const { data: universities } = useUniversities();
  const createMutation = useCreateProgram();
  const updateMutation = useUpdateProgram();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProgramFormData>({
    defaultValues: {
      name: "",
      universityId: "",
      degreeLevel: "Master",
      languageOfInstruction: "",
      tuitionFee: 0,
      tuitionCurrency: "EUR",
      tuitionPeriod: "Year",
      gpaRequirement: undefined,
      ieltsRequirement: undefined,
      toeflRequirement: undefined,
      scholarshipAvailable: false,
      scholarshipDetails: "",
      requiredDocuments: [],
      applicationDeadline: "",
      notes: "",
    },
  });

  const scholarshipAvailable = watch("scholarshipAvailable");
  const requiredDocuments = watch("requiredDocuments") ?? [];
  const [documentInput, setDocumentInput] = useState("");

  useEffect(() => {
    if (isEdit && existing) {
      reset({
        name: existing.name,
        universityId:
          typeof existing.universityId === "string"
            ? existing.universityId
            : existing.universityId?._id ?? "",
        degreeLevel: existing.degreeLevel,
        languageOfInstruction: existing.languageOfInstruction,
        tuitionFee: existing.tuitionFee,
        tuitionCurrency: existing.tuitionCurrency,
        tuitionPeriod: existing.tuitionPeriod,
        gpaRequirement: existing.gpaRequirement,
        ieltsRequirement: existing.ieltsRequirement,
        toeflRequirement: existing.toeflRequirement,
        scholarshipAvailable: existing.scholarshipAvailable,
        scholarshipDetails: existing.scholarshipDetails ?? "",
        requiredDocuments: existing.requiredDocuments,
        applicationDeadline: existing.applicationDeadline
          ? existing.applicationDeadline.split("T")[0] ?? ""
          : "",
        notes: existing.notes ?? "",
      });
    } else if (!isEdit && preselectedUniId) {
      setValue("universityId", preselectedUniId);
    }
  }, [existing, isEdit, reset, preselectedUniId, setValue]);

  function addDocument(): void {
    const trimmed = documentInput.trim();
    if (trimmed && !requiredDocuments.includes(trimmed)) {
      setValue("requiredDocuments", [...requiredDocuments, trimmed]);
      setDocumentInput("");
    }
  }

  function removeDocument(index: number): void {
    setValue("requiredDocuments", requiredDocuments.filter((_, i) => i !== index));
  }

  async function onSubmit(data: ProgramFormData): Promise<void> {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success("Program updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Program created successfully");
      }
      navigate(-1);
    } catch (err: unknown) {
      toast.error(isEdit ? getErrorMessage(err, "Failed to update program") : getErrorMessage(err, "Failed to create program"));
    }
  }

  if (isEdit && isLoading) {
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
        <h2 className="text-lg font-semibold">Program not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          {isEdit ? "Edit Program" : "Add Program"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Basic Information</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">Program Name <span className="text-red-500">*</span></Label>
              <Input id="name" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("name", { required: "Name is required" })} placeholder="e.g. MSc Computer Science" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">University <span className="text-red-500">*</span></Label>
              <Select
                value={(watch("universityId") as string) ?? ""}
                onValueChange={(v) => setValue("universityId", v)}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select university..." />
                </SelectTrigger>
                <SelectContent>
                  {universities?.universities?.map((u) => (
                    <SelectItem key={u._id} value={u._id}>{u.name} — {u.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.universityId && <p className="text-sm text-red-500">{errors.universityId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="degreeLevel" className="text-sm font-medium text-slate-700">Degree Level</Label>
              <Select
                value={watch("degreeLevel")}
                onValueChange={(v) => setValue("degreeLevel", v as ProgramFormData["degreeLevel"])}
              >
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEGREE_LEVELS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium text-slate-700">Language <span className="text-red-500">*</span></Label>
              <Input id="language" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("languageOfInstruction", { required: "Language is required" })} placeholder="e.g. English" />
              {errors.languageOfInstruction && <p className="text-sm text-red-500">{errors.languageOfInstruction.message}</p>}
            </div>
          </div>
        </div>

        {/* Costs & Requirements */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Costs & Requirements</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tuitionFee" className="text-sm font-medium text-slate-700">Tuition Fee <span className="text-red-500">*</span></Label>
              <Input id="tuitionFee" type="number" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("tuitionFee", { required: true, setValueAs: (v) => Number(v) })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuitionCurrency" className="text-sm font-medium text-slate-700">Currency</Label>
              <Select value={watch("tuitionCurrency")} onValueChange={(v) => setValue("tuitionCurrency", v)}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuitionPeriod" className="text-sm font-medium text-slate-700">Per</Label>
              <Select value={watch("tuitionPeriod")} onValueChange={(v) => setValue("tuitionPeriod", v as ProgramFormData["tuitionPeriod"])}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>{TUITION_PERIODS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpaRequirement" className="text-sm font-medium text-slate-700">GPA Requirement</Label>
              <Input id="gpaRequirement" type="number" step="0.1" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("gpaRequirement", { setValueAs: (v) => v === "" ? undefined : Number(v) })} placeholder="e.g. 3.0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ieltsRequirement" className="text-sm font-medium text-slate-700">IELTS Requirement</Label>
              <Input id="ieltsRequirement" type="number" step="0.5" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("ieltsRequirement", { setValueAs: (v) => v === "" ? undefined : Number(v) })} placeholder="e.g. 6.5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toeflRequirement" className="text-sm font-medium text-slate-700">TOEFL Requirement</Label>
              <Input id="toeflRequirement" type="number" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("toeflRequirement", { setValueAs: (v) => v === "" ? undefined : Number(v) })} placeholder="e.g. 90" />
            </div>
          </div>
        </div>

        {/* Application Info */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Application Info</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-medium text-slate-700">Application Deadline</Label>
              <Input id="deadline" type="date" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("applicationDeadline")} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium text-slate-700">Required Documents</Label>
              <div className="flex gap-2">
                <Input value={documentInput} onChange={(e) => setDocumentInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDocument(); } }}
                  className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                  placeholder="Add a document..." />
                <Button type="button" variant="outline" className="border-slate-200 hover:bg-slate-50 rounded-xl" onClick={addDocument}>Add</Button>
              </div>
              {requiredDocuments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {requiredDocuments.map((doc, i) => (
                    <span className="bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-sm inline-flex items-center gap-1">
                      {doc}
                      <button type="button" onClick={() => removeDocument(i)} className="ml-1 rounded-full hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2">
                <Checkbox id="scholarship" checked={scholarshipAvailable}
                  onCheckedChange={(c) => setValue("scholarshipAvailable", c === true)} />
                <Label htmlFor="scholarship" className="text-sm font-medium text-slate-700">Scholarship Available</Label>
              </div>
              {scholarshipAvailable && (
                <Textarea id="scholarshipDetails" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("scholarshipDetails")}
                  placeholder="Describe available scholarships..." rows={2} />
              )}
            </div>
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

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" className="border-slate-200 hover:bg-slate-50 rounded-xl" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              : <><Save className="mr-2 h-4 w-4" /> {isEdit ? "Update" : "Save"} Program</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
