import { useStats, useAdminStats, useAgencyApplications, useStudents, useApplications } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { STATUS_COLORS, COUNTRY_FLAGS } from "@/lib/constants";
import type { Application } from "@/types/application";
import type { University } from "@/types/university";
import {
  GraduationCap,
  Globe,
  MapPin,
  Building2,
  Users,
  DollarSign,
  Award,
  CalendarClock,
  Clock,
  AlertCircle,
  FileText,
  UserPlus,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

// ─── Student Dashboard ──────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function StatusBreakdown({
  byStatus,
}: {
  byStatus: { status: string; count: number }[];
}): React.ReactElement {
  const total = byStatus.reduce((sum, s) => sum + s.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Application Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {byStatus.map((item) => {
            const pct =
              total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={STATUS_COLORS[item.status]}
                    >
                      {item.status}
                    </Badge>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                  <span className="text-muted-foreground">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {byStatus.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No applications yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingDeadlines({
  applications,
}: {
  applications: Application[];
}): React.ReactElement {
  const now = new Date();
  const ninetyDays = new Date();
  ninetyDays.setDate(ninetyDays.getDate() + 90);

  const upcoming = applications
    .filter((a) => {
      if (!a.applicationDeadline) return false;
      const d = new Date(a.applicationDeadline);
      return d >= now && d <= ninetyDays;
    })
    .sort(
      (a, b) =>
        new Date(a.applicationDeadline!).getTime() -
        new Date(b.applicationDeadline!).getTime(),
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            No deadlines in the next 90 days
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((a) => {
              const days = daysUntil(a.applicationDeadline!);
              const isUrgent = days <= 14;
              const uniName =
                typeof a.universityId === "object" ? a.universityId?.name : "University";
              return (
                <Link
                  key={a._id}
                  to={`/applications/${a._id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{uniName}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.studentName}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    {isUrgent && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={
                        isUrgent
                          ? "text-sm font-medium text-red-500"
                          : "text-sm text-muted-foreground"
                      }
                    >
                      {days}d left
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentlyAdded({
  applications,
}: {
  applications: Application[];
}): React.ReactElement {
  const recent = applications
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recently Added
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            No applications yet
          </p>
        ) : (
          <div className="space-y-3">
            {recent.map((a) => {
              const uniName =
                typeof a.universityId === "object" ? a.universityId?.name : "University";
              return (
                <Link
                  key={a._id}
                  to={`/applications/${a._id}`}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-lg">
                    🎓
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{uniName}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.studentName}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={STATUS_COLORS[a.applicationStatus]}
                  >
                    {a.applicationStatus}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton(): React.ReactElement {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

function StudentDashboard(): React.ReactElement {
  const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErrorObj } = useStats();
  const { data: appsData, isLoading: appsLoading } = useApplications();

  const applications = appsData?.applications ?? [];
  const isLoading = statsLoading || appsLoading;

  // Build byStatus from applications
  const byStatus: { status: string; count: number }[] = [];
  const statusMap = new Map<string, number>();
  for (const a of applications) {
    statusMap.set(a.applicationStatus, (statusMap.get(a.applicationStatus) ?? 0) + 1);
  }
  for (const [status, count] of statusMap.entries()) {
    byStatus.push({ status, count });
  }

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
        <p className="text-sm text-muted-foreground">
          {statsErrorObj instanceof Error ? statsErrorObj.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Total Applications
                </div>
                <p className="mt-1 text-3xl font-bold">
                  {applications.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  Total Universities
                </div>
                <p className="mt-1 text-3xl font-bold">
                  {stats?.totalUniversities ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  Countries
                </div>
                <p className="mt-1 text-3xl font-bold">
                  {stats?.countriesCount ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Avg Tuition / Year
                </div>
                <p className="mt-1 text-3xl font-bold">
                  {stats ? formatCurrency(stats.avgTuition) : "€0"}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Status breakdown + Deadlines */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <StatusBreakdown byStatus={byStatus} />
            <UpcomingDeadlines applications={applications} />
          </>
        )}
      </div>

      {/* Recently Added */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ) : (
        <RecentlyAdded applications={applications} />
      )}
    </div>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────

function AdminDashboard(): React.ReactElement {
  const { data: stats, isLoading, isError, error } = useAdminStats();

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load platform stats</h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-sm text-muted-foreground">
          Key metrics across the entire platform
        </p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Total Users
              </div>
              <p className="mt-1 text-3xl font-bold">{stats?.totalUsers ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                Total Universities
              </div>
              <p className="mt-1 text-3xl font-bold">{stats?.totalUniversities ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                Total Programs
              </div>
              <p className="mt-1 text-3xl font-bold">{stats?.totalPrograms ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                Total Countries
              </div>
              <p className="mt-1 text-3xl font-bold">{stats?.totalCountries ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Total Cities
              </div>
              <p className="mt-1 text-3xl font-bold">{stats?.totalCities ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Total Agencies
              </div>
              <p className="mt-1 text-3xl font-bold">{stats?.totalAgencies ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Students Managed
              </div>
              <p className="mt-1 text-3xl font-bold">{stats?.totalStudentsManaged ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role Breakdown */}
      {!isLoading && stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats.byRole ?? []).map((item) => {
                const total = stats.totalUsers || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.role} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{item.role}</span>
                      <span className="text-muted-foreground">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted">
                      <div
                        className="h-2.5 rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {(!stats.byRole || stats.byRole.length === 0) && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No user data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Agency Overview ─────────────────────────────────────────────────────────

function AgencyOverview(): React.ReactElement {
  const { data: applications, isLoading: appLoading } = useAgencyApplications();
  const { data: students, isLoading: studentsLoading } = useStudents();

  const isLoading = appLoading || studentsLoading;
  const totalApplications = applications?.length ?? 0;
  const totalStudents = students?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agency Overview</h1>
        <p className="text-sm text-muted-foreground">
          Summary of your students and applications
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Total Students
              </div>
              <p className="mt-1 text-3xl font-bold">{totalStudents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Total Applications
              </div>
              <p className="mt-1 text-3xl font-bold">{totalApplications}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Applications */}
      {!isLoading && applications && applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {applications.slice(0, 5).map((a) => {
                const uniName =
                  typeof a.universityId === "object" ? a.universityId?.name : "University";
                return (
                  <Link
                    key={a._id}
                    to={`/applications/${a._id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{uniName}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {a.studentName}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && applications?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="text-lg font-semibold">No applications yet</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Start by adding a student and a university application
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

// ─── Main Dashboard (role-aware) ──────────────────────────────────────────────

export default function Dashboard(): React.ReactElement {
  const { user } = useAuth();

  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "agency") return <AgencyOverview />;
  return <StudentDashboard />;
}
