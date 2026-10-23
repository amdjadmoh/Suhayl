import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { ProgramFormData } from "@/types/program";
import {
  useCreateProgram,
  useUpdateProgram,
  useProgram,
  useUniversity,
  useUniversities,
  useCountries,
  useCreateUniversity,
} from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { CURRENCIES, DEGREE_LEVELS, TUITION_PERIODS } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackLink, ErrorState, Field, FormSection, LoadingPage, PageHeader, Token } from "@/components/kit";

const COMMON_TESTS = ["GPA", "IELTS", "TOEFL", "TCF", "DELF", "DALF", "SAT", "GRE", "GMAT"];

export default function AddEditProgram(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedUniId = searchParams.get("universityId") ?? "";
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [showCustomUniForm, setShowCustomUniForm] = useState(false);
  const [customUniName, setCustomUniName] = useState("");
  const [customUniCity, setCustomUniCity] = useState("");

  // One-shot guard so the preselect runs at most once even if queries refetch.
  const preselectApplied = useRef(false);

  const { data: existing, isLoading } = useProgram(id ?? "");
  // Fetch the preselected university directly so we know its country immediately
  const { data: preselectedUni } = useUniversity(preselectedUniId);
  const { data: universities } = useUniversities(selectedCountry ? { country: selectedCountry } : undefined);
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

  // Populate form when editing an existing program.
  useEffect(() => {
    if (isEdit && existing) {
      const uniCountry = typeof existing.universityId === "object" ? existing.universityId?.country ?? "" : "";
      reset({
        name: existing.name,
        universityId: typeof existing.universityId === "string" ? existing.universityId : existing.universityId?._id ?? "",
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
        applicationDeadline: existing.applicationDeadline ? existing.applicationDeadline.split("T")[0] ?? "" : "",
        programUrl: existing.programUrl ?? "",
        notes: existing.notes ?? "",
      });
      setTestReqs(existing.testRequirements ?? []);
      if (uniCountry) setSelectedCountry(uniCountry);
    }
  }, [existing, isEdit, reset]);

  // Pre-populate country + university as soon as the preselected university loads.
  useEffect(() => {
    if (!isEdit && preselectedUniId && preselectedUni && !preselectApplied.current) {
      setSelectedCountry(preselectedUni.country);
      setValue("universityId", preselectedUniId);
      preselectApplied.current = true;
    }
  }, [preselectedUni, preselectedUniId, isEdit, setValue]);

  function handleCountryChange(value: string): void {
    setSelectedCountry(value);
    setValue("universityId", "");
    setShowCustomUniForm(false);
    setCustomUniName("");
    setCustomUniCity("");
  }

  async function handleCreateCustomUniversity(): Promise<void> {
    const name = customUniName.trim();
    const city = customUniCity.trim();
    if (!selectedCountry || !name || !city) return;
    try {
      const created = await createUniversityMutation.mutateAsync({ name, country: selectedCountry, city });
      setValue("universityId", created._id);
      setShowCustomUniForm(false);
      setCustomUniName("");
      setCustomUniCity("");
      toast.success(`${name} added`);
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
    if (!data.universityId) {
      toast.error("Choose the university first");
      return;
    }
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success("Program updated");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Program added");
      }
      navigate(-1);
    } catch (err: unknown) {
      toast.error(isEdit ? getErrorMessage(err, "Failed to update program") : getErrorMessage(err, "Failed to create program"));
    }
  }

  if (isEdit && isLoading) return <LoadingPage />;

  if (isEdit && !existing) {
    return <ErrorState title="Program not found" action={<Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>} />;
  }

  // True when the form was opened from a university page — lock the uni fields.
  const uniLocked = !isEdit && Boolean(preselectedUniId && preselectedUni);
  const canAddTest = !!((selectedTest && selectedTest !== "Custom") || (selectedTest === "Custom" && customTestName.trim())) && !!newTestScore;

  return (
    <>
      <PageHeader
        back={<BackLink onClick={() => navigate(-1)}>Back</BackLink>}
        kicker={isEdit ? "Edit program" : isAdmin ? "New official program" : "New program"}
        title={isEdit ? existing?.name ?? "Edit program" : "Add a program"}
      >
        {isEdit
          ? "Changes show up for everyone who can see this program."
          : isAdmin
            ? "Official programs are visible to everyone."
            : "Copy what the university's website says. Programs you add stay private to you until an admin makes them official."}
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="The program" description="Where it is and what it's called.">
          <Field label="Program name" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2">
            <Input id="name" {...register("name", { required: "Name is required" })} placeholder="MSc Computer Science" />
          </Field>

          <Field label="Country" required>
            {uniLocked ? (
              <div className="flex h-10 items-center rounded-xl bg-paper-sunken px-3.5 text-sm text-ink-2">
                {preselectedUni!.country}
              </div>
            ) : (
              <Select value={selectedCountry} onValueChange={handleCountryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((c) => (
                    <SelectItem key={c._id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          <Field label="University" required error={errors.universityId?.message}>
            {uniLocked ? (
              <div className="flex h-10 items-center truncate rounded-xl bg-paper-sunken px-3.5 text-sm text-ink-2">
                {preselectedUni!.name} — {preselectedUni!.city}
              </div>
            ) : (
              <Select
                value={(watch("universityId") as string) ?? ""}
                onValueChange={(v) => setValue("universityId", v)}
                disabled={!selectedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCountry ? "Choose a university" : "Country first"} />
                </SelectTrigger>
                <SelectContent>
                  {universities?.universities?.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name} <span className="text-ink-3">— {u.city}</span>
                    </SelectItem>
                  ))}
                  {selectedCountry && universities?.universities?.length === 0 && (
                    <div className="px-3 py-2 text-sm text-ink-3">No universities here yet</div>
                  )}
                </SelectContent>
              </Select>
            )}
          </Field>

          {!uniLocked && (
            <div className="sm:col-span-2">
              {!showCustomUniForm ? (
                <button
                  type="button"
                  onClick={() => setShowCustomUniForm(true)}
                  disabled={!selectedCountry}
                  className="link-ink text-[13px] disabled:cursor-not-allowed disabled:text-ink-4 disabled:no-underline"
                >
                  University not in the list? Add it.
                </button>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-rule p-5">
                  <p className="text-[13px] text-ink-2">
                    Adding a university in <span className="font-medium text-ink">{selectedCountry}</span>
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="University name" htmlFor="customUniName">
                      <Input id="customUniName" value={customUniName} onChange={(e) => setCustomUniName(e.target.value)} placeholder="University of Oxford" />
                    </Field>
                    <Field label="City" htmlFor="customUniCity">
                      <Input id="customUniCity" value={customUniCity} onChange={(e) => setCustomUniCity(e.target.value)} placeholder="Oxford" />
                    </Field>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCustomUniForm(false);
                        setCustomUniName("");
                        setCustomUniCity("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateCustomUniversity}
                      disabled={!customUniName.trim() || !customUniCity.trim() || createUniversityMutation.isPending}
                    >
                      {createUniversityMutation.isPending && <Loader2 className="animate-spin" />}
                      Add university
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <Field label="Degree">
            <Select value={watch("degreeLevel")} onValueChange={(v) => setValue("degreeLevel", v as ProgramFormData["degreeLevel"])}>
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
          </Field>

          <Field label="Taught in" htmlFor="language" required error={errors.languageOfInstruction?.message}>
            <Input id="language" {...register("languageOfInstruction", { required: "Language is required" })} placeholder="English" />
          </Field>
        </FormSection>

        <FormSection title="Money" description="Tuition as the university quotes it. The application fee is what you pay to apply.">
          <Field label="Tuition fee" htmlFor="tuitionFee" required>
            <Input id="tuitionFee" type="number" className="tnum" {...register("tuitionFee", { required: true, setValueAs: (v) => Number(v) })} placeholder="0" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Currency">
              <Select value={watch("tuitionCurrency")} onValueChange={(v) => setValue("tuitionCurrency", v)}>
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
            </Field>
            <Field label="Per">
              <Select value={watch("tuitionPeriod")} onValueChange={(v) => setValue("tuitionPeriod", v as ProgramFormData["tuitionPeriod"])}>
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
            </Field>
          </div>
          <Field label="Application fee (€)" htmlFor="appFee" hint="Leave empty if you don't know.">
            <Input
              id="appFee"
              type="number"
              className="tnum"
              {...register("applicationFee", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              placeholder="75"
            />
          </Field>
          <div className="space-y-2 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
              <Checkbox checked={scholarshipAvailable} onCheckedChange={(c) => setValue("scholarshipAvailable", c === true)} />
              There's a scholarship
            </label>
            {scholarshipAvailable && (
              <Textarea {...register("scholarshipDetails")} placeholder="Who it's for, how much, how to apply…" rows={2} />
            )}
          </div>
        </FormSection>

        <FormSection title="Requirements" description="Each of these becomes a line on the checklist of anyone who applies.">
          <Field label="Minimum scores" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              <Select
                value={selectedTest}
                onValueChange={(v) => {
                  setSelectedTest(v);
                  if (v !== "Custom") setCustomTestName("");
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Test" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TESTS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                  <SelectItem value="Custom">Other…</SelectItem>
                </SelectContent>
              </Select>
              {selectedTest === "Custom" && (
                <Input value={customTestName} onChange={(e) => setCustomTestName(e.target.value)} placeholder="Test name" className="w-36" />
              )}
              <Input
                type="number"
                value={newTestScore}
                onChange={(e) => setNewTestScore(e.target.value)}
                placeholder="Min score"
                className="w-28 tnum"
              />
              <Button type="button" variant="outline" onClick={addTestRequirement} disabled={!canAddTest}>
                Add
              </Button>
            </div>
            {testReqs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {testReqs.map((t, i) => (
                  <Token key={i} onRemove={() => removeTestRequirement(i)}>
                    {t.name} <span className="text-xs text-ink-3 tnum">{t.minimumScore}</span>
                  </Token>
                ))}
              </div>
            )}
          </Field>

          <Field label="Documents to send" className="sm:col-span-2" hint="Press Enter to add each one.">
            <div className="flex gap-2">
              <Input
                value={documentInput}
                onChange={(e) => setDocumentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDocument();
                  }
                }}
                placeholder="Transcript, CV, passport copy…"
              />
              <Button type="button" variant="outline" onClick={addDocument}>
                Add
              </Button>
            </div>
            {requiredDocuments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {requiredDocuments.map((doc, i) => (
                  <Token key={i} onRemove={() => removeDocument(i)}>
                    {doc}
                  </Token>
                ))}
              </div>
            )}
          </Field>

          <label className="flex cursor-pointer items-center gap-2.5 self-end pb-2 text-sm text-ink">
            <Checkbox checked={watch("requiresSOP") || false} onCheckedChange={(c) => setValue("requiresSOP", c === true)} />
            Needs a statement of purpose
          </label>
          <Field label="Letters of recommendation" htmlFor="recLetters">
            <Input id="recLetters" type="number" min="0" className="tnum" {...register("recommendationLetters", { setValueAs: (v) => Number(v) })} placeholder="0" />
          </Field>
        </FormSection>

        <FormSection title="Dates & links">
          <Field label="Application deadline" htmlFor="deadline">
            <Input id="deadline" type="date" className="text-sm tnum" {...register("applicationDeadline")} />
          </Field>
          <Field label="Program page" htmlFor="programUrl">
            <Input id="programUrl" {...register("programUrl")} placeholder="https://…" />
          </Field>
          <Field label="Notes" htmlFor="notes" className="sm:col-span-2">
            <Textarea id="notes" {...register("notes")} placeholder="Anything that didn't fit above" rows={4} />
          </Field>
        </FormSection>

        <div className="flex items-center justify-end gap-2 pt-6">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEdit ? "Save changes" : "Add program"}
          </Button>
        </div>
      </form>
    </>
  );
}
