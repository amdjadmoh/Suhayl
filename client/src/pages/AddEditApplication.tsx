import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import type { ApplicationFormData } from "@/types/application";
import {
  useCreateApplication,
  useUpdateApplication,
  useApplication,
  usePrograms,
  useStudents,
  useApplications,
} from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { cn, getErrorMessage } from "@/lib/utils";
import { formatDate, formatTuition } from "@/lib/format";
import { belongsTo } from "@/lib/studentProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BackLink, CountryPlate, ErrorState, Fact, Facts, Field, FormSection, LoadingPage, PageHeader, StatusTag,
} from "@/components/kit";

export default function AddEditApplication(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedProgramId = searchParams.get("programId") ?? "";
  const preselectedStudentEmail = searchParams.get("studentEmail") ?? "";
  const preselectedStudentName = searchParams.get("studentName") ?? "";
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const isAgency = user?.role === "agency";

  const { data: existing, isLoading: appLoading } = useApplication(id ?? "");
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: students } = useStudents(isAgency);
  const { data: existingApps } = useApplications();
  const createMutation = useCreateApplication();
  const updateMutation = useUpdateApplication();

  const [programQuery, setProgramQuery] = useState("");
  const [studentId, setStudentId] = useState("");

  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { isSubmitting },
  } = useForm<ApplicationFormData>({
    defaultValues: {
      programId: preselectedProgramId || "",
      studentName: isAgency ? preselectedStudentName : user?.name ?? "",
      studentEmail: isAgency ? preselectedStudentEmail : user?.email ?? "",
      applicationStatus: "Preparing",
      notes: "",
    },
  });

  const programId = watch("programId") as string;
  const selectedProg = programs?.programs?.find((p) => p._id === programId);

  // Agencies arriving from a student's file: pick that student automatically
  useEffect(() => {
    if (!isAgency || studentId || !students || !preselectedStudentEmail) return;
    const match = students.find((s) => s.email === preselectedStudentEmail);
    if (match) setStudentId(match._id);
  }, [isAgency, students, preselectedStudentEmail, studentId]);

  function chooseStudent(sid: string): void {
    setStudentId(sid);
    const s = students?.find((st) => st._id === sid);
    if (s) {
      setValue("studentName", s.name);
      setValue("studentEmail", s.email);
    }
  }

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

  const chosenStudent = isAgency ? students?.find((s) => s._id === studentId) : undefined;

  // Programs this student already has an open application for: a second one would split the checklist
  const alreadyOpen = useMemo(() => {
    const ids = new Set<string>();
    if (isAgency && !chosenStudent) return ids;
    for (const a of existingApps?.applications ?? []) {
      if (!["Preparing", "Applied", "Waitlisted"].includes(a.applicationStatus)) continue;
      if (chosenStudent && !belongsTo(a, chosenStudent)) continue;
      ids.add(typeof a.programId === "object" ? a.programId._id : a.programId);
    }
    return ids;
  }, [existingApps, chosenStudent, isAgency]);

  // For an agency, programs matching the student's degree and countries go first
  const fitsProfile = (p: NonNullable<typeof programs>["programs"][number]): boolean => {
    if (!chosenStudent) return false;
    const uni = typeof p.universityId === "object" ? p.universityId : null;
    const degreeOk = !chosenStudent.degreeLevel || p.degreeLevel === chosenStudent.degreeLevel;
    const countryOk = !chosenStudent.preferredCountries?.length || (!!uni && chosenStudent.preferredCountries.includes(uni.country));
    return degreeOk && countryOk && !!(chosenStudent.degreeLevel || chosenStudent.preferredCountries?.length);
  };

  const filteredPrograms = useMemo(() => {
    const all = programs?.programs ?? [];
    const q = programQuery.trim().toLowerCase();
    const matching = !q
      ? all
      : all.filter((p) => {
          const uni = typeof p.universityId === "object" ? p.universityId : null;
          return [p.name, uni?.name, uni?.country, uni?.city].filter(Boolean).join(" ").toLowerCase().includes(q);
        });
    return matching.slice().sort((a, b) => Number(fitsProfile(b)) - Number(fitsProfile(a)));
    // fitsProfile only depends on the chosen student
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programs, programQuery, chosenStudent]);

  async function onCreate(data: ApplicationFormData): Promise<void> {
    if (isAgency && (!data.studentName || !data.studentEmail)) {
      toast.error("Choose which student this application is for");
      return;
    }
    try {
      const result = await createMutation.mutateAsync({
        ...data,
        ...(isAgency && studentId ? { studentId } : {}),
        applicationStatus: "Preparing",
        applicationProgress: {},
      } as ApplicationFormData);
      toast.success("Application started");
      navigate(`/applications/${result._id}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create application"));
    }
  }

  async function onUpdate(data: ApplicationFormData): Promise<void> {
    try {
      await updateMutation.mutateAsync({ id: id!, data: { ...data } });
      toast.success("Saved");
      navigate(`/applications/${id}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update"));
    }
  }

  if (isEdit && appLoading) return <LoadingPage />;

  if (isEdit && !existing) {
    return (
      <ErrorState
        title="Application not found"
        action={<Button variant="outline" onClick={() => navigate("/applications")}>Back to applications</Button>}
      />
    );
  }

  // ─── NEW APPLICATION ───────────────────────────────────────────────
  if (!isEdit) {
    const selectedUni = selectedProg && typeof selectedProg.universityId === "object" ? selectedProg.universityId : null;
    return (
      <>
        <PageHeader
          back={<BackLink onClick={() => navigate(-1)}>Back</BackLink>}
          kicker="New application"
          title="Which program is it for?"
        >
          Choose the program and Suhayl copies its requirements — documents, tests, letters, the fee and the deadline —
          into a checklist you can tick off.
        </PageHeader>

        <form onSubmit={handleSubmit(onCreate)}>
          {isAgency && (
            <FormSection title="Student" description="Applications are filed under one of your students.">
              <Field label="Student" required className="sm:col-span-2">
                <Select value={studentId} onValueChange={chooseStudent}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={!students ? "Loading students…" : students.length ? "Choose a student…" : "Add a student first"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {students?.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name} <span className="text-ink-3">· {s.email}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FormSection>
          )}

          <FormSection
            title="Program"
            description="Can't find it? Add it from the Programs page first — custom programs stay private to you."
          >
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-4" />
                <Input
                  value={programQuery}
                  onChange={(e) => setProgramQuery(e.target.value)}
                  placeholder="Search by program, university or country"
                  className="pl-8"
                  aria-label="Search programs"
                />
              </div>
              <div
                role="radiogroup"
                aria-label="Programs"
                className="mt-2 max-h-[22rem] overflow-y-auto rounded-2xl border border-rule bg-paper-raised"
              >
                {programsLoading ? (
                  <p className="px-4 py-6 text-sm text-ink-3">Loading programs…</p>
                ) : filteredPrograms.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-ink-3">Nothing matches “{programQuery}”.</p>
                ) : (
                  <ul className="divide-y divide-rule-soft">
                    {filteredPrograms.map((p) => {
                      const uni = typeof p.universityId === "object" ? p.universityId : null;
                      const active = p._id === programId;
                      const taken = alreadyOpen.has(p._id);
                      return (
                        <li key={p._id}>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setValue("programId", p._id)}
                            disabled={taken}
                            className={cn("flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                              active ? "bg-brand-soft" : taken ? "cursor-not-allowed opacity-60" : "hover:bg-paper-hover",
                            )}
                          >
                            <span
                              className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-full border-2",
                                active ? "border-brand" : "border-input",
                              )}
                            >
                              {active && <span className="size-2 rounded-full bg-brand" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                              <span className="block truncate text-xs text-ink-3">
                                {uni ? `${uni.name} · ${uni.city}` : ""} · {p.degreeLevel}
                              </span>
                            </span>
                            {taken ? (
                              <span className="rounded-full bg-paper-sunken px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-ink-3">Already applying</span>
                            ) : fitsProfile(p) ? (
                              <span className="rounded-full bg-moss-soft px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-moss">Fits profile</span>
                            ) : null}
                            {uni && <CountryPlate country={uni.country} />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {selectedProg && (
              <div className="sm:col-span-2">
                <p className="kicker mb-1">You picked</p>
                <p className="text-lg leading-tight font-semibold">{selectedProg.name}</p>
                {selectedUni && <p className="text-sm text-ink-3">{selectedUni.name}, {selectedUni.country}</p>}
                <Facts className="mt-3 max-w-md">
                  <Fact label="Degree">{selectedProg.degreeLevel} · {selectedProg.languageOfInstruction}</Fact>
                  <Fact label="Tuition">
                    {formatTuition(selectedProg.tuitionFee, selectedProg.tuitionCurrency, selectedProg.tuitionPeriod)}
                  </Fact>
                  <Fact label="Deadline">{formatDate(selectedProg.applicationDeadline, "not published")}</Fact>
                  <Fact label="Documents">{selectedProg.requiredDocuments.length || "none listed"}</Fact>
                </Facts>
              </div>
            )}
          </FormSection>

          <div className="flex items-center justify-end gap-2 pt-6">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || !programId || (isAgency && !studentId)}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Start application
            </Button>
          </div>
        </form>
      </>
    );
  }

  // ─── EDIT APPLICATION (metadata only) ──────────────────────────────
  const status = watch("applicationStatus") ?? "Preparing";
  return (
    <>
      <PageHeader
        back={<BackLink to={`/applications/${id}`}>Application</BackLink>}
        kicker="Edit application"
        title={selectedProg?.name ?? "Application details"}
      >
        The checklist lives on the application page. Here you can correct the status, deadline and notes.
      </PageHeader>

      <form onSubmit={handleSubmit(onUpdate)}>
        <FormSection title="Status & deadline" description="Normally the status moves on its own as you record decisions.">
          <Field label="Status">
            <Select
              value={status}
              onValueChange={(v) => setValue("applicationStatus", v as ApplicationFormData["applicationStatus"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    <StatusTag status={s} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Deadline" htmlFor="deadline">
            <Input id="deadline" type="date" className="text-sm tnum" {...register("applicationDeadline")} />
          </Field>
        </FormSection>

        <FormSection title="Notes" description="Anything worth remembering — a contact at admissions, a portal password hint, a feeling.">
          <Field label="Notes" htmlFor="notes" className="sm:col-span-2">
            <Textarea id="notes" rows={5} placeholder="Write anything…" {...register("notes")} />
          </Field>
        </FormSection>

        <div className="flex items-center justify-end gap-2 pt-6">
          <Button type="button" variant="ghost" onClick={() => navigate(`/applications/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </>
  );
}
