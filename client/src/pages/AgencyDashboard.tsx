import { Link } from "react-router-dom";
import { useAgencyApplications, useStudents } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap,
  Users,
  PlusCircle,
  AlertCircle,
  UserPlus,
  FileText,
  ArrowRight,
} from "lucide-react";

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agency Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your students and applications
        </p>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalStudents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalApplications}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="outline" className="h-auto flex-col gap-2 py-6" asChild>
              <Link to="/agency/students">
                <Users className="h-6 w-6" />
                <span className="font-medium">Manage Students</span>
                <span className="text-xs text-muted-foreground">View, add, edit students</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-6" asChild>
              <Link to="/agency/students">
                <UserPlus className="h-6 w-6" />
                <span className="font-medium">Add Student</span>
                <span className="text-xs text-muted-foreground">Create a new student record</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-6" asChild>
              <Link to="/universities/new">
                <PlusCircle className="h-6 w-6" />
                <span className="font-medium">Add Application</span>
                <span className="text-xs text-muted-foreground">New university application</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent applications */}
      {!isLoading && applications && applications.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Applications</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/applications">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {applications.slice(0, 5).map((a) => {
                const progName = typeof a.programId === "object" ? a.programId?.name : "Program";
                const uniName = typeof a.programId === "object" && a.programId?.universityId?.name ? a.programId.universityId.name : "";
                return (
                  <Link
                    key={a._id}
                    to={`/applications/${a._id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{progName}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {a.studentName}{uniName ? ` · ${uniName}` : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && applications?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="text-lg font-semibold">No applications yet</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Start by adding a student and then a university application
            </p>
            <Button asChild>
              <Link to="/agency/students">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Student
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
