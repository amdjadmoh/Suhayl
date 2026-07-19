import { useAdminStats, useAgencyApplications, useStudents, useApplications } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { STATUS_COLORS } from "@/lib/constants";
import type { Application } from "@/types/application";
import {
  GraduationCap,
  Globe,
  MapPin,
  Building2,
  Users,
  Award,
  CalendarClock,
  Clock,
  AlertCircle,
  FileText,
  UserPlus,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

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
    <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
          <Award className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Application Status</h3>
          <p className="text-sm text-muted-foreground">Overview of all applications</p>
        </div>
      </div>
      <div className="space-y-4">
        {byStatus.map((item) => {
          const pct =
            total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.status} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={STATUS_COLORS[item.status]}
                  >
                    {item.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        {byStatus.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No applications yet</p>
          </div>
        )}
      </div>
    </div>
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
    <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
          <CalendarClock className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Upcoming Deadlines</h3>
          <p className="text-sm text-muted-foreground">Next 90 days</p>
        </div>
      </div>
      {upcoming.length === 0 ? (
        <div className="text-center py-8">
          <CalendarClock className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No deadlines in the next 90 days</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.map((a) => {
            const days = daysUntil(a.applicationDeadline!);
            const isUrgent = days <= 14;
            const progObj = typeof a.programId === "object" ? a.programId : null;
            const uniName = progObj?.universityId?.name ?? "University";
            return (
              <Link
                key={a._id}
                to={`/applications/${a._id}`}
                className="flex items-center justify-between rounded-xl border border-border p-4 transition-all hover:border-primary/30 hover:shadow-md group"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground group-hover:text-primary transition-colors">{uniName}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.studentName}
                  </p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  {isUrgent && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      isUrgent
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {days}d left
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
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
    <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
          <Clock className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recently Added</h3>
          <p className="text-sm text-muted-foreground">Latest applications</p>
        </div>
      </div>
      {recent.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No applications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recent.map((a) => {
            const progObj = typeof a.programId === "object" ? a.programId : null;
            const uniName = progObj?.universityId?.name ?? "University";
            return (
              <Link
                key={a._id}
                to={`/applications/${a._id}`}
                className="flex items-center gap-4 rounded-xl border border-border p-4 transition-all hover:border-primary/30 hover:shadow-md group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-cyan-500/10 flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground group-hover:text-primary transition-colors">{uniName}</p>
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
    </div>
  );
}

function StatCardSkeleton(): React.ReactElement {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

function StudentDashboard(): React.ReactElement {
  const { data: appsData, isLoading: appsLoading } = useApplications();
  const { user } = useAuth();

  const applications = appsData?.applications ?? [];
  const isLoading = appsLoading;

  const byStatus: { status: string; count: number }[] = [];
  const statusMap = new Map<string, number>();
  const countries = new Set<string>();
  for (const a of applications) {
    statusMap.set(a.applicationStatus, (statusMap.get(a.applicationStatus) ?? 0) + 1);
    const progObj = typeof a.programId === "object" ? a.programId : null;
    const country = progObj?.universityId?.country;
    if (country) countries.add(country);
  }
  for (const [status, count] of statusMap.entries()) {
    byStatus.push({ status, count });
  }

  const acceptedCount = statusMap.get("Accepted") ?? 0;
  const enrolledCount = statusMap.get("Enrolled") ?? 0;

  // Find closest upcoming deadline
  const now = new Date();
  const upcoming = applications
    .filter((a) => {
      if (!a.applicationDeadline) return false;
      return new Date(a.applicationDeadline) >= now;
    })
    .sort((a, b) => new Date(a.applicationDeadline!).getTime() - new Date(b.applicationDeadline!).getTime());
  const nextDeadlineDays = upcoming.length > 0 ? daysUntil(upcoming[0]!.applicationDeadline!) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-cyan-500 blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="mt-2 text-slate-300">Here's what's happening with your applications</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="group rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan-500 shadow-lg shadow-primary/20">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{applications.length}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <span>{byStatus.length} status{byStatus.length !== 1 ? "es" : ""}</span>
              </div>
            </div>

            <div className="group rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Countries Exploring</p>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                  <Globe className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{countries.size}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <MapPin className="h-3 w-3" />
                <span>{countries.size > 0 ? [...countries].slice(0, 2).join(", ") + (countries.size > 2 ? "…" : "") : "Add your first"}</span>
              </div>
            </div>

            <div className="group rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{acceptedCount + enrolledCount}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                {enrolledCount > 0 && <><CheckCircle2 className="h-3 w-3" /> {enrolledCount} enrolled</>}
                {acceptedCount > 0 && !enrolledCount && <><CheckCircle2 className="h-3 w-3" /> Offers in hand</>}
                {acceptedCount === 0 && enrolledCount === 0 && <span>Keep applying</span>}
              </div>
            </div>

            <div className="group rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-lg hover:border-amber-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Next Deadline</p>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                  <CalendarClock className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {nextDeadlineDays !== null ? nextDeadlineDays : "—"}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs">
                {nextDeadlineDays !== null ? (
                  nextDeadlineDays <= 7 ? (
                    <><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-red-500">Urgent — {nextDeadlineDays} day{nextDeadlineDays !== 1 ? "s" : ""}</span></>
                  ) : nextDeadlineDays <= 30 ? (
                    <span className="text-amber-600 dark:text-amber-400">{nextDeadlineDays} days away</span>
                  ) : (
                    <span className="text-muted-foreground">{nextDeadlineDays} days away</span>
                  )
                ) : (
                  <span className="text-muted-foreground">No deadlines set</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Status breakdown + Deadlines */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-40 w-full" />
            </div>
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
        <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <RecentlyAdded applications={applications} />
      )}
    </div>
  );
}

function AdminDashboard(): React.ReactElement {
  const { data: stats, isLoading, isError, error } = useAdminStats();

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-foreground">Failed to load platform stats</h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-violet-500 blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
          <p className="mt-2 text-slate-300">Key metrics across the entire platform</p>
        </div>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-lg hover:border-rose-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/20">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.totalUsers ?? 0}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>Active accounts</span>
            </div>
          </div>
          <div className="group rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-lg hover:border-violet-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Universities</p>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.totalUniversities ?? 0}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Registered</span>
            </div>
          </div>
          <div className="group rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-lg hover:border-indigo-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Programs</p>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/20">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.totalPrograms ?? 0}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-3 w-3" />
              <span>Available</span>
            </div>
          </div>
          <div className="group rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Countries</p>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                <Globe className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.totalCountries ?? 0}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <Globe className="h-3 w-3" />
              <span>Worldwide</span>
            </div>
          </div>
          <div className="group rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-lg hover:border-cyan-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Cities</p>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                <MapPin className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.totalCities ?? 0}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <MapPin className="h-3 w-3" />
              <span>Tracked</span>
            </div>
          </div>
          <div className="group rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-lg hover:border-orange-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Agencies</p>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.totalAgencies ?? 0}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <Building2 className="h-3 w-3" />
              <span>Active</span>
            </div>
          </div>
          <div className="group rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-lg hover:border-rose-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Students Managed</p>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/20">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.totalStudentsManaged ?? 0}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <Users className="h-3 w-3" />
              <span>Under guidance</span>
            </div>
          </div>
        </div>
      )}

      {/* Role Breakdown */}
      {!isLoading && stats && (
        <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Users by Role</h3>
              <p className="text-sm text-muted-foreground">Distribution across user types</p>
            </div>
          </div>
          <div className="space-y-4">
            {(stats.byRole ?? []).map((item) => {
              const total = stats.totalUsers || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.role} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize text-foreground">{item.role}</span>
                    <span className="text-muted-foreground">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!stats.byRole || stats.byRole.length === 0) && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No user data available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AgencyOverview(): React.ReactElement {
  const { data: applications, isLoading: appLoading } = useAgencyApplications();
  const { data: students, isLoading: studentsLoading } = useStudents();

  const isLoading = appLoading || studentsLoading;
  const totalApplications = applications?.length ?? 0;
  const totalStudents = students?.length ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-card blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-pink-500 blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">Agency Dashboard</h1>
          <p className="mt-2 text-purple-100">Manage your students and track their progress</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="group rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-lg hover:border-rose-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/20">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <Users className="h-3 w-3" />
              <span>Under your guidance</span>
            </div>
          </div>
          <div className="group rounded-2xl bg-card p-6 shadow-sm border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan-500 shadow-lg shadow-primary/20">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalApplications}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <FileText className="h-3 w-3" />
              <span>Being tracked</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Applications */}
      {!isLoading && applications && applications.length > 0 && (
        <div className="rounded-2xl bg-card p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Recent Applications</h3>
                <p className="text-sm text-muted-foreground">Latest student applications</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/applications" className="text-primary hover:text-primary/90">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {applications.slice(0, 5).map((a) => {
              const progObj = typeof a.programId === "object" ? a.programId : null;
              const uniName = progObj?.universityId?.name ?? "University";
              return (
                <Link
                  key={a._id}
                  to={`/applications/${a._id}`}
                  className="flex items-center justify-between rounded-xl border border-border p-4 transition-all hover:border-primary/30 hover:shadow-md group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground group-hover:text-primary transition-colors">{uniName}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {a.studentName}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!isLoading && applications?.length === 0 && (
        <div className="rounded-2xl bg-card p-12 shadow-sm border border-border text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-cyan-500/10 mx-auto mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No applications yet</h2>
          <p className="text-muted-foreground mb-6">
            Start by adding a student and a university application
          </p>
          <Button asChild className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
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

export default function Dashboard(): React.ReactElement {
  const { user } = useAuth();

  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "agency") return <AgencyOverview />;
  return <StudentDashboard />;
}
