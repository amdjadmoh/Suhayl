import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { ProgramFormData } from "@/types/program";
import {
  useCreateProgram,
  useUpdateProgram,
  useProgram,
  useUniversities,
  useCountries,
  useCreateUniversity,
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, X, AlertCircle, Loader2, Plus, Building2 } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

export default function AddEditProgram(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedUniId = searchParams.get("universityId") ?? "";
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Country is a transient filter (not part of ProgramFormData — the chosen
  // university already carries its country), so it lives in local state.
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [showCustomUniForm, setShowCustomUniForm] = useState(false);
  const [customUniName, setCustomUniName] = useState("");
  const [customUniCity, setCustomUniCity] = useState("");

  // One-shot guard so the ?universityId= preselect runs at most once, even if
  // the universities query refetches (e.g. after creating a custom university).
  const preselectApplied = useRef(false);

  const { data: existing, isLoading } = useProgram(id ?? "");
  const { data: universities } = useUniversities(
    selectedCountry ? { country: selectedCountry } : undefined,
  );
  const { data: countries } = useCountries();
  const createMutation = useCreateProgram();
  const updateMutation = useUpdateProgram();
  const createUniversityMutation = useCreateUniversity();

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
      universityId: preselectedUniId || "",
      degreeLevel: "Master",
      languageOfInstruction: "",
      tuitionFee: 0,
      tuitionCurrency: "EUR",
      tuitionPeriod: "Year",
      testRequirements: [],
      scholarshipAvailable: false,
      scholarshipDetails: "",
      requiresSOP: false,
      recommendationLetters: 0,
      applicationFee: undefined,
      requiredDocuments: [],
      applicationDeadline: "",
      programUrl: "",
      notes: "",
    },
  });

  const scholarshipAvailable = watch("scholarshipAvailable");
  const requiredDocuments = watch("requiredDocuments") ?? [];
  const [documentInput, setDocumentInput] = useState("");

  const [testReqs, setTestReqs] = useState<{ name: string; minimumScore: number }[]>([]);
  const [selectedTest, setSelectedTest] = useState("");
  const [customTestName, setCustomTestName] = useState("");
  const [newTestScore, setNewTestScore] = useState("");

  const COMMON_TESTS = ["GPA", "IELTS", "TOEFL", "TCF", "DELF", "DALF", "SAT", "GRE", "GMAT"];

  useEffect(() => {
    if (isEdit && existing) {
      const uniCountry =
        typeof existing.universityId === "object"
          ? existing.universityId?.country ?? ""
          : "";
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
        testRequirements: existing.testRequirements,
        scholarshipAvailable: existing.scholarshipAvailable,
        scholarshipDetails: existing.scholarshipDetails ?? "",
        requiresSOP: existing.requiresSOP,
        recommendationLetters: existing.recommendationLetters,
        applicationFee: existing.applicationFee,
        requiredDocuments: existing.requiredDocuments,
        applicationDeadline: existing.applicationDeadline
          ? existing.applicationDeadline.split("T")[0] ?? ""
          : "",
        programUrl: existing.programUrl ?? "",
        notes: existing.notes ?? "",
      });
      setTestReqs(existing.testRequirements ?? []);
      if (uniCountry) setSelectedCountry(uniCountry);
    } else if (
      !isEdit &&
      preselectedUniId &&
      !preselectApplied.current &&
      universities
    ) {
      const uni = universities.universities.find(
        (u) => u._id === preselectedUniId,
      );
      if (uni) {
        setValue("universityId", preselectedUniId);
        setSelectedCountry(uni.country);
        preselectApplied.current = true;
      }
    }
  }, [existing, isEdit, reset, preselectedUniId, setValue, universities]);

  function handleCountryChange(value: string): void {
    setSelectedCountry(value);
    // The previously chosen university may no longer be in the filtered list,
    // so clear it to keep the form consistent.
    setValue("universityId", "");
    // Reset the custom-uni expander since it was scoped to the previous country.
    setShowCustomUniForm(false);
    setCustomUniName("");
    setCustomUniCity("");
  }

  async function handleCreateCustomUniversity(): Promise<void> {
    const name = customUniName.trim();
    const city = customUniCity.trim();
    if (!selectedCountry || !name || !city) return;
    try {
      const created = await createUniversityMutation.mutateAsync({
        name,
        country: selectedCountry,
        city,
      });
      setValue("universityId", created._id);
      setShowCustomUniForm(false);
      setCustomUniName("");
      setCustomUniCity("");
      toast.success("University added");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to add university"));
    }
  }

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

  function addTestRequirement(): void {
    const name = selectedTest === "Custom" ? customTestName.trim() : selectedTest;
    if (name && newTestScore) {
      const updated = [...testReqs, { name, minimumScore: Number(newTestScore) }];
      setTestReqs(updated);
      setValue("testRequirements", updated);
      setSelectedTest("");
      setCustomTestName("");
      setNewTestScore("");
    }
  }

  function removeTestRequirement(index: number): void {
    const updated = testReqs.filter((_, i) => i !== index);
    setTestReqs(updated);
    setValue("testRequirements", updated);
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
        <div className="rounded-xl border border-border bg-card p-6"><Skeleton className="h-96 w-full" /></div>
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
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isEdit ? "Edit Program" : "Add Program"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-base font-semibold text-foreground">Basic Information</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Program Name <span className="text-red-500">*</span></Label>
              <Input id="name" className="rounded-lg border-border focus:border-primary focus:ring-primary/20" {...register("name", { required: "Name is required" })} placeholder="e.g. MSc Computer Science" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium text-foreground">Country <span className="text-red-500">*</span></Label>
              <Select value={selectedCountry} onValueChange={handleCountryChange}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select country first..." />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((c) => (
                    <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium text-foreground">University <span className="text-red-500">*</span></Label>
              <Select
                value={(watch("universityId") as string) ?? ""}
                onValueChange={(v) => setValue("universityId", v)}
                disabled={!selectedCountry}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder={selectedCountry ? "Select university..." : "Select a country first"} />
                </SelectTrigger>
                <SelectContent>
                  {universities?.universities?.map((u) => (
                    <SelectItem key={u._id} value={u._id}>{u.name} — {u.city}</SelectItem>
                  ))}
                  {selectedCountry && universities?.universities?.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No universities yet for this country</div>
                  )}
                </SelectContent>
              </Select>
              {errors.universityId && <p className="text-sm text-red-500">{errors.universityId.message}</p>}
              {!showCustomUniForm ? (
                <button
                  type="button"
                  onClick={() => setShowCustomUniForm(true)}
                  disabled={!selectedCountry}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline disabled:text-muted-foreground disabled:cursor-not-allowed disabled:no-underline"
                >
                  <Plus className="h-3 w-3" /> Don&apos;t see your university? Add it
                </button>
              ) : (
                <div className="mt-2 rounded-lg border border-border bg-muted p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>Adding to</span>
                    <Badge className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 rounded-full">{selectedCountry}</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="customUniName" className="text-xs font-medium text-muted-foreground">University Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="customUniName"
                        value={customUniName}
                        onChange={(e) => setCustomUniName(e.target.value)}
                        placeholder="e.g. University of Oxford"
                        className="rounded-lg border-border"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="customUniCity" className="text-xs font-medium text-muted-foreground">City <span className="text-red-500">*</span></Label>
                      <Input
                        id="customUniCity"
                        value={customUniCity}
                        onChange={(e) => setCustomUniCity(e.target.value)}
                        placeholder="e.g. Oxford"
                        className="rounded-lg border-border"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCustomUniForm(false);
                        setCustomUniName("");
                        setCustomUniCity("");
                      }}
                      className="border-border hover:bg-muted rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreateCustomUniversity}
                      disabled={
                        !customUniName.trim() ||
                        !customUniCity.trim() ||
                        createUniversityMutation.isPending
                      }
                      className="bg-foreground text-background hover:bg-foreground/90 rounded-xl"
                    >
                      {createUniversityMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                      ) : (
                        <><Plus className="mr-2 h-4 w-4" /> Add University</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="degreeLevel" className="text-sm font-medium text-foreground">Degree Level</Label>
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
              <Label htmlFor="language" className="text-sm font-medium text-foreground">Language <span className="text-red-500">*</span></Label>
              <Input id="language" className="rounded-lg border-border focus:border-primary focus:ring-primary/20" {...register("languageOfInstruction", { required: "Language is required" })} placeholder="e.g. English" />
              {errors.languageOfInstruction && <p className="text-sm text-red-500">{errors.languageOfInstruction.message}</p>}
            </div>
          </div>
        </div>

        {/* Costs & Requirements */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-base font-semibold text-foreground">Costs & Requirements</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tuitionFee" className="text-sm font-medium text-foreground">Tuition Fee <span className="text-red-500">*</span></Label>
              <Input id="tuitionFee" type="number" className="rounded-lg border-border focus:border-primary focus:ring-primary/20" {...register("tuitionFee", { required: true, setValueAs: (v) => Number(v) })} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuitionCurrency" className="text-sm font-medium text-foreground">Currency</Label>
              <Select value={watch("tuitionCurrency")} onValueChange={(v) => setValue("tuitionCurrency", v)}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuitionPeriod" className="text-sm font-medium text-foreground">Per</Label>
              <Select value={watch("tuitionPeriod")} onValueChange={(v) => setValue("tuitionPeriod", v as ProgramFormData["tuitionPeriod"])}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>{TUITION_PERIODS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-3 space-y-2">
              <Label className="text-sm font-medium text-foreground">Test Requirements</Label>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedTest} onValueChange={(v) => { setSelectedTest(v); if (v !== "Custom") setCustomTestName(""); }}>
                  <SelectTrigger className="rounded-lg w-40">
                    <SelectValue placeholder="Select test..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_TESTS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {selectedTest === "Custom" && (
                  <Input value={customTestName} onChange={(e) => setCustomTestName(e.target.value)}
                    placeholder="Test name..." className="rounded-lg border-border w-40" />
                )}
                <Input type="number" value={newTestScore} onChange={(e) => setNewTestScore(e.target.value)}
                  placeholder="Min score" className="rounded-lg border-border w-32" />
                <Button type="button" variant="outline"
                  className="border-border hover:bg-muted rounded-xl"
                  onClick={addTestRequirement}
                  disabled={!((selectedTest && selectedTest !== "Custom") || (selectedTest === "Custom" && customTestName.trim())) || !newTestScore}>
                  Add
                </Button>
              </div>
              {testReqs.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {testReqs.map((t, i) => (
                    <span key={i} className="bg-muted text-foreground rounded-full px-3 py-1 text-sm inline-flex items-center gap-1">
                      {t.name}: {t.minimumScore}
                      <button type="button" onClick={() => removeTestRequirement(i)} className="ml-1 rounded-full hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application Info */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-base font-semibold text-foreground">Application Info</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-medium text-foreground">Application Deadline</Label>
              <Input id="deadline" type="date" className="rounded-lg border-border focus:border-primary focus:ring-primary/20" {...register("applicationDeadline")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="programUrl" className="text-sm font-medium text-foreground">Program URL</Label>
              <Input id="programUrl" className="rounded-lg border-border focus:border-primary focus:ring-primary/20" {...register("programUrl")} placeholder="https://..." />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium text-foreground">Required Documents</Label>
              <div className="flex gap-2">
                <Input value={documentInput} onChange={(e) => setDocumentInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDocument(); } }}
                  className="rounded-lg border-border focus:border-primary focus:ring-primary/20"
                  placeholder="Add a document..." />
                <Button type="button" variant="outline" className="border-border hover:bg-muted rounded-xl" onClick={addDocument}>Add</Button>
              </div>
              {requiredDocuments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {requiredDocuments.map((doc, i) => (
                    <span className="bg-muted text-foreground rounded-full px-3 py-1 text-sm inline-flex items-center gap-1">
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
                <Label htmlFor="scholarship" className="text-sm font-medium text-foreground">Scholarship Available</Label>
              </div>
              {scholarshipAvailable && (
                <Textarea id="scholarshipDetails" className="rounded-lg border-border focus:border-primary focus:ring-primary/20" {...register("scholarshipDetails")}
                  placeholder="Describe available scholarships..." rows={2} />
              )}
            </div>

            {/* SOP, Recommendations & Fee */}
            <div className="space-y-2 sm:col-span-2">
              <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Checkbox id="requiresSOP" checked={watch("requiresSOP") || false}
                    onCheckedChange={(c) => setValue("requiresSOP", c === true)} />
                  <Label htmlFor="requiresSOP" className="text-sm font-medium text-foreground">Requires SOP</Label>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="recLetters" className="text-xs font-medium text-muted-foreground">Recommendation Letters</Label>
                  <Input id="recLetters" type="number" min="0" className="rounded-lg border-border" {...register("recommendationLetters", { setValueAs: (v) => Number(v) })} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="appFee" className="text-xs font-medium text-muted-foreground">Application Fee (€)</Label>
                  <Input id="appFee" type="number" className="rounded-lg border-border" {...register("applicationFee", { setValueAs: (v) => v === "" ? undefined : Number(v) })} placeholder="Optional" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-base font-semibold text-foreground">Notes</h3>
          </div>
          <div className="p-6">
            <Textarea className="rounded-lg border-border focus:border-primary focus:ring-primary/20" {...register("notes")} placeholder="Any additional notes..." rows={4} />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" className="border-border hover:bg-muted rounded-xl" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-foreground text-background hover:bg-foreground/90 rounded-xl">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              : <><Save className="mr-2 h-4 w-4" /> {isEdit ? "Update" : "Save"} Program</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
