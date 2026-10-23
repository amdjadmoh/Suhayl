import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { useStudent, useUpdateStudent, useDeleteStudent, useAgencyApplications } from "@/lib/api";
import type { Application } from "@/types/application";
import { getErrorMessage } from "@/lib/utils";
import { formatDate, formatMoney, listJoin } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BackLink, EmptyState, ErrorState, Fact, Facts, Field, LoadingPage, PageHeader, Section } from "@/components/kit";
import { ApplicationList, StatusBreakdown } from "@/components/ledger";
import { countByStatus } from "@/lib/applications";
import { StudentProfileFields } from "@/components/StudentProfileFields";
import { StudentDocuments } from "@/components/StudentDocuments";
import { FamilyLink } from "@/components/FamilyLink";
import { FollowUps, Payments } from "@/components/StudentWork";
import { CounsellorPicker } from "@/components/CounsellorPicker";
import {
  EMPTY_PROFILE,
  belongsTo,
  hasProfile,
  matchesHref,
  profileToForm,
  profileToPayload,
  type StudentProfileForm,
} from "@/lib/studentProfile";

type StudentForm = { name: string; email: string; phone: string; notes: string };

export default function AgencyStudentDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: student, isLoading, isError, error } = useStudent(id ?? "");
  const { data: applications } = useAgencyApplications();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfileForm>(EMPTY_PROFILE);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentForm>();

  function openEdit(): void {
    if (!student) return;
    reset({ name: student.name, email: student.email, phone: student.phone ?? "", notes: student.notes ?? "" });
    setProfile(profileToForm(student));
    setEditOpen(true);
  }

  async function handleEditSubmit(data: StudentForm): Promise<void> {
    if (!student) return;
    try {
      await updateMutation.mutateAsync({
        id: student._id,
        // Empty strings clear a field; undefined would leave the old value in place
        data: { name: data.name, email: data.email, phone: data.phone.trim(), notes: data.notes.trim(), ...profileToPayload(profile) },
      });
      toast.success("Student updated");
      setEditOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update student"));
    }
  }

  async function handleDelete(): Promise<void> {
    if (!student) return;
    try {
      await deleteMutation.mutateAsync(student._id);
      toast.success("Student deleted");
      navigate("/agency/students");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete student"));
    }
  }

  const studentApplications: Application[] = student ? (applications ?? []).filter((a) => belongsTo(a, student)) : [];

  if (isLoading) return <LoadingPage />;

  if (isError || !student) {
    return (
      <ErrorState title="Student not found" action={<Button variant="outline" asChild><Link to="/agency/students">All students</Link></Button>}>
        {error instanceof Error ? error.message : undefined}
      </ErrorState>
    );
  }

  const newAppHref = `/applications/new?studentEmail=${encodeURIComponent(student.email)}&studentName=${encodeURIComponent(student.name)}`;
  const firstName = student.name.split(" ")[0] ?? student.name;
  const aiming = [student.degreeLevel, student.targetIntake].filter(Boolean).join(" · ");

  return (
    <>
      <PageHeader
        back={<BackLink to="/agency/students">Students</BackLink>}
        kicker="Student file"
        title={student.name}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={openEdit}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="text-stamp hover:bg-stamp-soft hover:text-stamp" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link to={newAppHref}>Start an application</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-10">
          <FollowUps student={student} />
          <Section title="Applications" count={studentApplications.length}>
            {studentApplications.length > 0 ? (
              <ApplicationList applications={studentApplications} />
            ) : (
              <EmptyState
                title={`No applications for ${student.name.split(" ")[0]} yet`}
                action={
                  <Button variant="primary" asChild>
                    <Link to={newAppHref}>Start an application</Link>
                  </Button>
                }
              />
            )}
          </Section>
          <StudentDocuments studentId={student._id} firstName={firstName} />
          {studentApplications.length > 1 && (
            <Section title="Where things stand">
              <div className="pt-2">
                <StatusBreakdown counts={countByStatus(studentApplications)} />
              </div>
            </Section>
          )}
        </div>

        <aside>
          <CounsellorPicker student={student} />
          <div className="mb-8">
            <FamilyLink student={student} />
          </div>
          <div className="mb-8">
            <Payments key={student._id} student={student} />
          </div>
          <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">Profile</p>
          {hasProfile(student) || aiming ? (
            <Facts className="card px-5 py-1">
              {aiming && <Fact label="Aiming for">{aiming}</Fact>}
              <Fact label="GPA">{student.gpa ?? <span className="text-ink-4">not given</span>}</Fact>
              <Fact label="IELTS">{student.ieltsScore ?? <span className="text-ink-4">not given</span>}</Fact>
              <Fact label="Budget">
                {student.monthlyBudget != null ? `${formatMoney(student.monthlyBudget, "EUR")} / month` : <span className="text-ink-4">not given</span>}
              </Fact>
              {!!student.preferredCountries?.length && <Fact label="Countries">{listJoin(student.preferredCountries)}</Fact>}
            </Facts>
          ) : (
            <div className="card-soft px-5 py-4 text-[13px] leading-relaxed text-ink-3">
              Add {firstName}'s GPA, IELTS, budget and countries to match programs to them.{" "}
              <button type="button" onClick={openEdit} className="link-ink font-semibold">
                Add profile
              </button>
            </div>
          )}
          <Button variant="secondary" className="mt-3 w-full" asChild>
            <Link to={matchesHref(student)}>
              <Sparkles />
              Find programs for {firstName}
            </Link>
          </Button>

          <p className="mt-8 mb-3 text-[17px] font-bold tracking-[-0.01em]">Contact</p>
          <Facts className="card px-5 py-1">
            <Fact label="Email">
              <a href={`mailto:${student.email}`} className="link-ink break-all">
                {student.email}
              </a>
            </Fact>
            <Fact label="Phone">{student.phone ? <span className="text-[13px] tnum">{student.phone}</span> : <span className="text-ink-4">not given</span>}</Fact>
            <Fact label="On file since">{formatDate(student.createdAt)}</Fact>
          </Facts>
          {student.notes && (
            <>
              <p className="mt-8 mb-3 text-[17px] font-bold tracking-[-0.01em]">Notes</p>
              <p className="card-soft px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-ink-2">
                {student.notes}
              </p>
            </>
          )}
        </aside>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
          <form onSubmit={handleSubmit(handleEditSubmit)} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>Edit {student.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <Field label="Name" htmlFor="e-name" required error={errors.name?.message}>
                <Input id="e-name" {...register("name", { required: "Name is required" })} />
              </Field>
              <Field label="Email" htmlFor="e-email" required error={errors.email?.message}>
                <Input id="e-email" type="email" {...register("email", { required: "Email is required" })} />
              </Field>
              <Field label="Phone" htmlFor="e-phone">
                <Input id="e-phone" className="tnum" {...register("phone")} />
              </Field>
              <Field label="Notes" htmlFor="e-notes">
                <Textarea id="e-notes" {...register("notes")} rows={3} />
              </Field>
              <div className="border-t border-rule-soft pt-4">
                <p className="mb-3 text-[15px] font-bold text-ink">Academic profile</p>
                <StudentProfileFields idPrefix="e" value={profile} onChange={setProfile} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {student.name}?</DialogTitle>
            <DialogDescription>All of their applications are deleted with them. This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Keep
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="animate-spin" />}
              Delete student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
