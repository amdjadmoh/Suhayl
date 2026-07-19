import { Link } from "react-router-dom";
import { useAgencyApplications, useStudents, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap,
  Users,
  PlusCircle,
  AlertCircle,
  UserPlus,
  FileText,
  ArrowRight,
  Download,
} from "lucide-react";

async function exportApplicationsCsv(): Promise<void> {
  const response = await api.get("/agency/applications/export.csv", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `agency-applications-${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default function AgencyDashboard(): React.ReactElement {
  const {
    data: applications,
    isLoading: uniLoading,
    isError: uniError,
  } = useAgencyApplications();

  const {
    data: students,
    isLoading: studentsLoading,
  } = useStudents();

  const totalApplications = applications?.length ?? 0;
  const totalStudents = students?.length ?? 0;

  if (uniError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load data</h2>
      </div>
    );
  }

  const isLoading = uniLoading || studentsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Agency Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your students and applications
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl border-border"
          onClick={exportApplicationsCsv}
        >
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{totalStudents}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <FileText className="h-5 w-5 text-violet-500" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">{totalApplications}</p>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold text-foreground">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="outline" className="h-auto flex-col gap-2 rounded-xl border-border p-6 hover:border-border hover:shadow-md transition-all" asChild>
              <Link to="/agency/students">
                <Users className="h-6 w-6 text-primary" />
                <span className="font-medium">Manage Students</span>
                <span className="text-xs text-muted-foreground">View, add, edit students</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 rounded-xl border-border p-6 hover:border-border hover:shadow-md transition-all" asChild>
              <Link to="/agency/students">
                <UserPlus className="h-6 w-6 text-primary" />
                <span className="font-medium">Add Student</span>
                <span className="text-xs text-muted-foreground">Create a new student record</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 rounded-xl border-border p-6 hover:border-border hover:shadow-md transition-all" asChild>
              <Link to="/universities/new">
                <PlusCircle className="h-6 w-6 text-primary" />
                <span className="font-medium">Add Application</span>
                <span className="text-xs text-muted-foreground">New university application</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Recent applications */}
      {!isLoading && applications && applications.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-base font-semibold text-foreground">Recent Applications</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/applications">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {applications.slice(0, 5).map((a) => {
                const progName = typeof a.programId === "object" ? a.programId?.name : "Program";
                const uniName = typeof a.programId === "object" && a.programId?.universityId?.name ? a.programId.universityId.name : "";
                return (
                  <Link
                    key={a._id}
                    to={`/applications/${a._id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-all hover:border-border hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{progName}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {a.studentName}{uniName ? ` · ${uniName}` : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && applications?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
          <GraduationCap className="mb-4 h-16 w-16 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold text-foreground">No applications yet</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Start by adding a student and then a university application
          </p>
          <Button asChild>
            <Link to="/agency/students">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
