import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  useStudent,
  useUpdateStudent,
  useDeleteStudent,
  useAgencyApplications,
} from "@/lib/api";
import type { Application } from "@/types/application";
import { STATUS_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
   ArrowLeft,
   User,
   Mail,
   Phone,
   FileText,
   Pencil,
   Trash2,
   PlusCircle,
   GraduationCap,
   Loader2,
   AlertCircle,
 } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

export default function AgencyStudentDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: student, isLoading, isError, error } = useStudent(id ?? "");
  const { data: applications } = useAgencyApplications();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  const [editOpen, setEditOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ name: string; email: string; phone: string; notes: string }>();

  function openEdit(): void {
    if (!student) return;
    reset({
      name: student.name,
      email: student.email,
      phone: student.phone ?? "",
      notes: student.notes ?? "",
    });
    setEditOpen(true);
  }

  async function handleEditSubmit(data: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  }): Promise<void> {
    if (!student) return;
    try {
      await updateMutation.mutateAsync({
        id: student._id,
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          notes: data.notes || undefined,
        },
      });
      toast.success("Student updated");
      setEditOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update student"));
    }
  }

  async function handleDelete(): Promise<void> {
    if (!student) return;
    if (
      !window.confirm(
        `Delete student "${student.name}"? This will also delete all their university applications.`,
      )
    )
      return;
    try {
      await deleteMutation.mutateAsync(student._id);
      toast.success("Student deleted");
      navigate("/agency/students");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete student"));
    }
  }

  // Filter applications for this student
  const studentApplications: Application[] = (applications ?? []).filter((a) => {
    if (!student) return false;
    return a.studentEmail === student.email;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold text-foreground">Student not found</h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : ""}
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/agency/students">Back to Students</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/agency/students">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{student.name}</h1>
            <p className="text-sm text-muted-foreground">Student Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={openEdit}>
                <Pencil className="mr-1 h-4 w-4" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Student</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="e-name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="e-name"
                    className="rounded-xl"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e-email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="e-email"
                    type="email"
                    className="rounded-xl"
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e-phone">Phone</Label>
                  <Input id="e-phone" className="rounded-xl" {...register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e-notes">Notes</Label>
                  <Textarea id="e-notes" className="rounded-xl" {...register("notes")} rows={3} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-1 h-4 w-4 text-destructive" />
            )}
            Delete
          </Button>
          <Button size="sm" asChild>
            <Link to={`/applications/new?studentEmail=${encodeURIComponent(student.email)}&studentName=${encodeURIComponent(student.name)}`}>
              <PlusCircle className="mr-1 h-4 w-4" />
              Add Application
            </Link>
          </Button>
        </div>
      </div>

      {/* Student info card */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <User className="h-5 w-5 text-muted-foreground" />
            Contact Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium text-foreground">
                  {student.phone ?? "Not provided"}
                </p>
              </div>
            </div>
            {student.notes && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="whitespace-pre-wrap text-sm font-medium text-foreground">{student.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applications */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold text-foreground">
            Applications ({studentApplications.length})
          </h3>
        </div>
        <div className="p-6">
          {studentApplications.length > 0 ? (
            <div className="space-y-2">
              {studentApplications.map((a) => {
                const progName = typeof a.programId === "object" ? a.programId?.name : "Program";
                return (
                  <Link
                    key={a._id}
                    to={`/applications/${a._id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-all hover:border-border hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {progName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {a.applicationDeadline && (
                          <>
                            <span>Deadline: {new Date(a.applicationDeadline).toLocaleDateString()}</span>
                            <span>·</span>
                          </>
                        )}
                        <span className="truncate">{a.studentName}</span>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`ml-3 flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[a.applicationStatus]}`}
                    >
                      {a.applicationStatus}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <GraduationCap className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No applications yet
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to={`/applications/new?studentEmail=${encodeURIComponent(student.email)}&studentName=${encodeURIComponent(student.name)}`}>
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Add Application
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
