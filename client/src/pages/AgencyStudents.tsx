import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useImportStudents,
  useAgencyApplications,
} from "@/lib/api";
import type { Student } from "@/types/student";
import { getErrorMessage } from "@/lib/utils";
import { plural } from "@/lib/format";
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
import { EmptyState, ErrorState, Field, LoadingRows, PageHeader } from "@/components/kit";
import { StudentProfileFields } from "@/components/StudentProfileFields";
import { useAgencyDocuments } from "@/lib/api-documents";
import { EMPTY_PROFILE, profileToForm, profileToPayload, type StudentProfileForm } from "@/lib/studentProfile";
import { StudentRoster } from "@/components/StudentRoster";

type StudentFormData = {
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const TEMPLATE_HREF =
  "data:text/csv;charset=utf-8,name,email,phone,notes%0AJohn Doe,john@example.com,+1234567890,My notes here";

export default function AgencyStudents(): React.ReactElement {
  const { data: students, isLoading, isError, error } = useStudents();
  const { data: applications } = useAgencyApplications();
  const { data: documents } = useAgencyDocuments();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();
  const importMutation = useImportStudents();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [toDelete, setToDelete] = useState<Student | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: { row: number; message: string }[];
  } | null>(null);
  const [profile, setProfile] = useState<StudentProfileForm>(EMPTY_PROFILE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>();

  function openCreateDialog(): void {
    setEditingStudent(null);
    reset({ name: "", email: "", phone: "", notes: "" });
    setProfile(EMPTY_PROFILE);
    setDialogOpen(true);
  }

  function openEditDialog(student: Student): void {
    setEditingStudent(student);
    reset({ name: student.name, email: student.email, phone: student.phone ?? "", notes: student.notes ?? "" });
    setProfile(profileToForm(student));
    setDialogOpen(true);
  }

  function openImport(): void {
    setImportFile(null);
    setImportResult(null);
    setImportDialogOpen(true);
  }

  async function onSubmit(data: StudentFormData): Promise<void> {
    // Empty strings clear a field; undefined would leave the old value in place
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone.trim(),
      notes: data.notes.trim(),
      ...profileToPayload(profile),
    };
    try {
      if (editingStudent) {
        await updateMutation.mutateAsync({ id: editingStudent._id, data: payload });
        toast.success("Student updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`${data.name} added`);
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, editingStudent ? "Failed to update student" : "Failed to create student"));
    }
  }

  async function handleDelete(): Promise<void> {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete._id);
      toast.success("Student deleted");
      setToDelete(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete student"));
    }
  }

  async function handleImport(): Promise<void> {
    if (!importFile) return;
    try {
      const result = await importMutation.mutateAsync(importFile);
      setImportResult(result);
      toast.success(`Imported ${plural(result.imported, "student")}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to import students"));
    }
  }

  if (isError) {
    return <ErrorState title="Students didn't load">{error instanceof Error ? error.message : "Unknown error"}</ErrorState>;
  }

  return (
    <>
      <PageHeader
        kicker={isLoading ? "Agency" : `Agency · ${plural(students?.length ?? 0, "student")}`}
        title="Students"
        actions={
          <>
            <Button variant="outline" onClick={openImport}>
              Import a spreadsheet
            </Button>
            <Button variant="primary" onClick={openCreateDialog}>
              Add a student
            </Button>
          </>
        }
      >
        Everyone you're helping apply. Open a student's file to see their applications or start a new one for them.
      </PageHeader>

      {isLoading ? (
        <LoadingRows rows={5} />
      ) : !students || students.length === 0 ? (
        <EmptyState
          title="Add your first student"
          action={
            <>
              <Button variant="outline" onClick={openImport}>
                Import a spreadsheet
              </Button>
              <Button variant="primary" onClick={openCreateDialog}>
                Add a student
              </Button>
            </>
          }
        >
          Add them one at a time, or upload a CSV with their names and emails.
        </EmptyState>
      ) : (
        <StudentRoster
          students={students}
          applications={applications ?? []}
          documents={documents ?? []}
          onEdit={openEditDialog}
          onDelete={setToDelete}
        />
      )}

      {/* Add / edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>{editingStudent ? `Edit ${editingStudent.name}` : "Add a student"}</DialogTitle>
              <DialogDescription>
                Use the email they'll apply with. The profile is optional; it lets you match programs to them.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <Field label="Name" htmlFor="s-name" required error={errors.name?.message}>
                <Input id="s-name" {...register("name", { required: "Name is required" })} placeholder="Yasmine Haddad" />
              </Field>
              <Field label="Email" htmlFor="s-email" required error={errors.email?.message}>
                <Input id="s-email" type="email" {...register("email", { required: "Email is required" })} placeholder="yasmine@example.com" />
              </Field>
              <Field label="Phone" htmlFor="s-phone">
                <Input id="s-phone" className="tnum" {...register("phone")} placeholder="+213 …" />
              </Field>
              <Field label="Notes" htmlFor="s-notes">
                <Textarea id="s-notes" {...register("notes")} placeholder="Interests, constraints, what they've told you…" rows={3} />
              </Field>
              <div className="border-t border-rule-soft pt-4">
                <p className="mb-3 text-[15px] font-bold text-ink">Academic profile</p>
                <StudentProfileFields idPrefix="s" value={profile} onChange={setProfile} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                {editingStudent ? "Save" : "Add student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {toDelete?.name}?</DialogTitle>
            <DialogDescription>All of their applications are deleted with them. This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Keep
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="animate-spin" />}
              Delete student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import from a spreadsheet</DialogTitle>
            <DialogDescription>
              A CSV file with the columns <span className="text-ink tnum">name</span>,{" "}
              <span className="text-ink tnum">email</span>, <span className="text-ink tnum">phone</span> and{" "}
              <span className="text-ink tnum">notes</span>. Rows with an email you already have are skipped.
            </DialogDescription>
          </DialogHeader>

          {importResult ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-paper-raised py-3">
                  <p className="kicker">Imported</p>
                  <p className="text-2xl text-moss tnum font-bold tracking-[-0.02em]">{importResult.imported}</p>
                </div>
                <div className="bg-paper-raised py-3 pl-4">
                  <p className="kicker">Skipped</p>
                  <p className="text-2xl text-ochre tnum font-bold tracking-[-0.02em]">{importResult.skipped}</p>
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <ul className="max-h-48 space-y-1 overflow-y-auto rounded-2xl bg-stamp-soft px-4 py-3 text-xs text-ink-2">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>
                      <span className="text-stamp tnum">Row {err.row}</span> — {err.message}
                    </li>
                  ))}
                </ul>
              )}
              <DialogFooter>
                <Button
                  variant="primary"
                  onClick={() => {
                    setImportDialogOpen(false);
                    setImportResult(null);
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
              {importFile ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-paper-sunken px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{importFile.name}</p>
                    <p className="text-xs text-ink-3 tnum">{(importFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setImportFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-rule px-4 py-8 text-center transition-colors hover:border-brand hover:bg-brand-soft"
                >
                  <p className="text-base font-semibold">Choose a .csv file</p>
                  <p className="mt-1 text-xs text-ink-3">Exported from Excel, Sheets or Numbers</p>
                </button>
              )}
              <a href={TEMPLATE_HREF} download="students_template.csv" className="link-ink w-fit text-[13px]">
                Download a blank template
              </a>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="primary" disabled={!importFile || importMutation.isPending} onClick={handleImport}>
                  {importMutation.isPending && <Loader2 className="animate-spin" />}
                  Import
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
