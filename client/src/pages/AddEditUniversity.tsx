import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { UniversityFormData } from "@/types/university";
import {
  useCreateUniversity,
  useUpdateUniversity,
  useUniversity,
} from "@/lib/api";
import {
  CURRENCIES,
  DEGREE_LEVELS,
  APPLICATION_STATUSES,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, X, AlertCircle, Loader2 } from "lucide-react";

export default function AddEditUniversity(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: existing, isLoading } = useUniversity(id ?? "");
  const createMutation = useCreateUniversity();
  const updateMutation = useUpdateUniversity();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UniversityFormData>({
    defaultValues: {
      name: "",
      country: "",
      city: "",
      ranking: undefined,
      websiteUrl: "",
      program: "",
      degreeLevel: "Master",
      languageOfInstruction: "",
      tuitionFee: 0,
      tuitionCurrency: "EUR",
      tuitionPeriod: "Year",
      livingCostEstimate: undefined,
      gpaRequirement: undefined,
      ieltsRequirement: undefined,
      toeflRequirement: undefined,
      visaRequirements: "",
      requiredDocuments: [],
      scholarshipAvailable: false,
      scholarshipDetails: "",
      applicationDeadline: "",
      applicationStatus: "Wishlist",
      notes: "",
    },
  });

  const scholarshipAvailable = watch("scholarshipAvailable");
  const requiredDocuments = watch("requiredDocuments") ?? [];
  const [documentInput, setDocumentInput] = useState("");

  useEffect(() => {
    if (existing && isEdit) {
      reset({
        name: existing.name,
        country: existing.country,
        city: existing.city,
        ranking: existing.ranking,
        websiteUrl: existing.websiteUrl ?? "",
        program: existing.program,
        degreeLevel: existing.degreeLevel,
        languageOfInstruction: existing.languageOfInstruction,
        tuitionFee: existing.tuitionFee,
        tuitionCurrency: existing.tuitionCurrency,
        tuitionPeriod: existing.tuitionPeriod,
        livingCostEstimate: existing.livingCostEstimate,
        gpaRequirement: existing.gpaRequirement,
        ieltsRequirement: existing.ieltsRequirement,
        toeflRequirement: existing.toeflRequirement,
        visaRequirements: existing.visaRequirements ?? "",
        requiredDocuments: existing.requiredDocuments,
        scholarshipAvailable: existing.scholarshipAvailable,
        scholarshipDetails: existing.scholarshipDetails ?? "",
        applicationDeadline: existing.applicationDeadline
          ? existing.applicationDeadline.split("T")[0] ?? ""
          : "",
        applicationStatus: existing.applicationStatus,
        notes: existing.notes ?? "",
      });
    }
  }, [existing, isEdit, reset]);

  function addDocument(): void {
    const trimmed = documentInput.trim();
    if (trimmed && !requiredDocuments.includes(trimmed)) {
      setValue("requiredDocuments", [...requiredDocuments, trimmed]);
      setDocumentInput("");
    }
  }

  function removeDocument(index: number): void {
    setValue(
      "requiredDocuments",
      requiredDocuments.filter((_, i) => i !== index),
    );
  }

  async function onSubmit(data: UniversityFormData): Promise<void> {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success("University updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("University added successfully");
      }
      navigate("/universities");
    } catch {
      toast.error(
        isEdit ? "Failed to update university" : "Failed to add university",
      );
    }
  }

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEdit && !existing) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">University not found</h2>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? "Edit University" : "Add University"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">
                University Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="e.g. Technical University of Munich"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-destructive">*</span>
              </Label>
              <Input
                id="country"
                {...register("country", { required: "Country is required" })}
                placeholder="e.g. Germany"
              />
              {errors.country && (
                <p className="text-sm text-destructive">
                  {errors.country.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                {...register("city", { required: "City is required" })}
                placeholder="e.g. Munich"
              />
              {errors.city && (
                <p className="text-sm text-destructive">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ranking">Ranking</Label>
              <Input
                id="ranking"
                type="number"
                {...register("ranking", {
                  setValueAs: (v) =>
                    v === "" || v === undefined ? undefined : Number(v),
                })}
                placeholder="e.g. 50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                {...register("websiteUrl")}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Program Details */}
        <Card>
          <CardHeader>
            <CardTitle>Program Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="program">
                Program <span className="text-destructive">*</span>
              </Label>
              <Input
                id="program"
                {...register("program", { required: "Program is required" })}
                placeholder="e.g. Computer Science"
              />
              {errors.program && (
                <p className="text-sm text-destructive">
                  {errors.program.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="degreeLevel">Degree Level</Label>
              <Select
                defaultValue={watch("degreeLevel")}
                onValueChange={(v: string) =>
                  setValue(
                    "degreeLevel",
                    v as UniversityFormData["degreeLevel"],
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEGREE_LEVELS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languageOfInstruction">
                Language <span className="text-destructive">*</span>
              </Label>
              <Input
                id="languageOfInstruction"
                {...register("languageOfInstruction", {
                  required: "Language is required",
                })}
                placeholder="e.g. English"
              />
              {errors.languageOfInstruction && (
                <p className="text-sm text-destructive">
                  {errors.languageOfInstruction.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Costs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tuitionFee">
                Tuition Fee <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tuitionFee"
                type="number"
                {...register("tuitionFee", {
                  required: "Tuition fee is required",
                  setValueAs: (v) => Number(v),
                })}
                placeholder="0"
              />
              {errors.tuitionFee && (
                <p className="text-sm text-destructive">
                  {errors.tuitionFee.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tuitionCurrency">Currency</Label>
              <Select
                defaultValue={watch("tuitionCurrency")}
                onValueChange={(v: string) => setValue("tuitionCurrency", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tuitionPeriod">Per</Label>
              <Select
                defaultValue={watch("tuitionPeriod")}
                onValueChange={(v: string) =>
                  setValue(
                    "tuitionPeriod",
                    v as UniversityFormData["tuitionPeriod"],
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TUITION_PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="livingCostEstimate">
                Living Cost Estimate / Month
              </Label>
              <Input
                id="livingCostEstimate"
                type="number"
                {...register("livingCostEstimate", {
                  setValueAs: (v) =>
                    v === "" || v === undefined ? undefined : Number(v),
                })}
                placeholder="e.g. 800"
              />
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gpaRequirement">GPA Requirement</Label>
              <Input
                id="gpaRequirement"
                type="number"
                step="0.1"
                {...register("gpaRequirement", {
                  setValueAs: (v) =>
                    v === "" || v === undefined ? undefined : Number(v),
                })}
                placeholder="e.g. 3.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ieltsRequirement">IELTS Requirement</Label>
              <Input
                id="ieltsRequirement"
                type="number"
                step="0.5"
                {...register("ieltsRequirement", {
                  setValueAs: (v) =>
                    v === "" || v === undefined ? undefined : Number(v),
                })}
                placeholder="e.g. 6.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toeflRequirement">TOEFL Requirement</Label>
              <Input
                id="toeflRequirement"
                type="number"
                {...register("toeflRequirement", {
                  setValueAs: (v) =>
                    v === "" || v === undefined ? undefined : Number(v),
                })}
                placeholder="e.g. 90"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visaRequirements">Visa Requirements</Label>
              <Input
                id="visaRequirements"
                {...register("visaRequirements")}
                placeholder="e.g. Student visa, blocked account"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Required Documents</Label>
              <div className="flex gap-2">
                <Input
                  value={documentInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocumentInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDocument();
                    }
                  }}
                  placeholder="Add a document..."
                />
                <Button type="button" variant="outline" onClick={addDocument}>
                  Add
                </Button>
              </div>
              {requiredDocuments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {requiredDocuments.map((doc, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 px-3">
                      {doc}
                      <button
                        type="button"
                        onClick={() => removeDocument(i)}
                        className="ml-1 rounded-full hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scholarship */}
        <Card>
          <CardHeader>
            <CardTitle>Scholarship</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="scholarshipAvailable"
                checked={scholarshipAvailable}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setValue("scholarshipAvailable", checked === true)
                }
              />
              <Label htmlFor="scholarshipAvailable">
                Scholarship Available
              </Label>
            </div>
            {scholarshipAvailable && (
              <div className="space-y-2">
                <Label htmlFor="scholarshipDetails">
                  Scholarship Details
                </Label>
                <Textarea
                  id="scholarshipDetails"
                  {...register("scholarshipDetails")}
                  placeholder="Describe available scholarships..."
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application */}
        <Card>
          <CardHeader>
            <CardTitle>Application</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="applicationDeadline">Deadline</Label>
              <Input
                id="applicationDeadline"
                type="date"
                {...register("applicationDeadline")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationStatus">Status</Label>
              <Select
                defaultValue={watch("applicationStatus")}
                onValueChange={(v: string) =>
                  setValue(
                    "applicationStatus",
                    v as UniversityFormData["applicationStatus"],
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Any additional notes..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/universities")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? "Update" : "Save"} University
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
