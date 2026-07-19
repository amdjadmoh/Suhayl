import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useImportStudents,
} from "@/lib/api";
import type { Student } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
   Users,
   Plus,
   Pencil,
   Trash2,
   ExternalLink,
   Loader2,
   AlertCircle,
   Mail,
   Phone,
   FileText,
   Upload,
   Download,
   CheckCircle2,
   XCircle,
 } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

type StudentFormData = {
  name: string;
  email: string;
  phone: string;
  notes: string;
};

export default function AgencyStudents(): React.ReactElement {
  const { data: students, isLoading, isError, error } = useStudents();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: { row: number; message: string }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportStudents();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>();

  function openCreateDialog(): void {
    setEditingStudent(null);
    reset({ name: "", email: "", phone: "", notes: "" });
    setDialogOpen(true);
  }

  function openEditDialog(student: Student): void {
    setEditingStudent(student);
    reset({
      name: student.name,
      email: student.email,
      phone: student.phone ?? "",
      notes: student.notes ?? "",
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: StudentFormData): Promise<void> {
    try {
      if (editingStudent) {
        await updateMutation.mutateAsync({
          id: editingStudent._id,
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone || undefined,
            notes: data.notes || undefined,
          },
        });
        toast.success("Student updated");
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          notes: data.notes || undefined,
        });
        toast.success("Student created");
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, editingStudent ? "Failed to update student" : "Failed to create student"));
    }
  }

  async function handleDelete(student: Student): Promise<void> {
    if (
      !window.confirm(
        `Delete student "${student.name}"? This will also delete all their university applications.`,
      )
    )
      return;
    try {
      await deleteMutation.mutateAsync(student._id);
      toast.success("Student deleted");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete student"));
    }
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold text-foreground">Failed to load students</h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Students</h1>
          <p className="text-sm text-muted-foreground">
            Manage the students you work with
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setImportFile(null);
                  setImportResult(null);
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import Students from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file with columns: <strong>name</strong>,{" "}
                  <strong>email</strong>, <strong>phone</strong>,{" "}
                  <strong>notes</strong>
                </DialogDescription>
              </DialogHeader>

              {importResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span>
                        Imported: <strong>{importResult.imported}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <XCircle className="h-5 w-5 text-amber-500" />
                      <span>
                        Skipped: <strong>{importResult.skipped}</strong>
                      </span>
                    </div>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Errors:</p>
                      {importResult.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-500">
                          Row {err.row}: {err.message}
                        </p>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => {
                      setImportDialogOpen(false);
                      setImportResult(null);
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setImportFile(file);
                      }}
                    />
                    {importFile ? (
                      <div className="space-y-2">
                        <FileText className="h-8 w-8 text-primary mx-auto" />
                        <p className="text-sm font-medium text-foreground">
                          {importFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(importFile.size / 1024).toFixed(1)} KB
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setImportFile(null);
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground/70">
                          Click to select CSV file
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          or drag and drop
                        </p>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <a
                      href="data:text/csv;charset=utf-8,name,email,phone,notes%0AJohn Doe,john@example.com,+1234567890,My notes here"
                      download="students_template.csv"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Template
                    </a>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setImportDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={!importFile || importMutation.isPending}
                      onClick={async () => {
                        if (!importFile) return;
                        try {
                          const result = await importMutation.mutateAsync(
                            importFile,
                          );
                          setImportResult(result);
                          toast.success(
                            `Imported ${result.imported} student${result.imported !== 1 ? "s" : ""}`,
                          );
                        } catch (err: unknown) {
                          toast.error(
                            getErrorMessage(err, "Failed to import students"),
                          );
                        }
                      }}
                    >
                      {importMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Import
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? "Edit Student" : "Add Student"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="s-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="s-name"
                  className="rounded-xl"
                  {...register("name", { required: "Name is required" })}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="s-email"
                  type="email"
                  className="rounded-xl"
                  {...register("email", { required: "Email is required" })}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-phone">Phone</Label>
                <Input
                  id="s-phone"
                  className="rounded-xl"
                  {...register("phone")}
                  placeholder="+1 234 567 890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-notes">Notes</Label>
                <Textarea
                  id="s-notes"
                  className="rounded-xl"
                  {...register("notes")}
                  placeholder="Any notes about this student..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingStudent ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : students && students.length > 0 ? (
        <div className="space-y-3">
          {students.map((student) => (
            <div
              key={student._id}
              className="rounded-xl border border-border bg-card p-4 transition-all hover:border-border hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <Link
                      to={`/agency/students/${student._id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {student.name}
                    </Link>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {student.email}
                    </span>
                    {student.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {student.phone}
                      </span>
                    )}
                    {student.notes && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">{student.notes}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/agency/students/${student._id}`}>
                      <ExternalLink className="mr-1 h-3.5 w-3.5" />
                      View Apps
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(student)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(student)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
          <Users className="mb-4 h-16 w-16 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold text-foreground">No students yet</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Add your first student to get started
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      )}
    </div>
  );
}
