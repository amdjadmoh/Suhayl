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
  Plus,
  Compass,
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

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/* ---------- Shared building blocks ---------- */

function PageHero({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8">
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_80%_at_80%_20%,black,transparent)]" />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{todayLabel()}</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1.5 text-muted-foreground">{subtitle}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tint,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  sub?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 card-hover">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      {sub && <div className="mt-1.5 flex items-center gap-1 text-xs">{sub}</div>}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  tint,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatCardSkeleton(): React.ReactElement {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

/* ---------- Student dashboard ---------- */

function StatusBreakdown({
  byStatus,
}: {
  byStatus: { status: string; count: number }[];
}): React.ReactElement {
  const total = byStatus.reduce((sum, s) => sum + s.count, 0);

  return (
    <SectionCard
      title="Application Status"
      subtitle="Overview of all applications"
      icon={Award}
      tint="bg-violet-500/10 text-violet-500"
    >
      <div className="space-y-4">
        {byStatus.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.status} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={STATUS_COLORS[item.status]}>
                    {item.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        {byStatus.length === 0 && (
          <div className="py-8 text-center">
            <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No applications yet</p>
          </div>
        )}
      </div>
    </SectionCard>
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
    <SectionCard
      title="Upcoming Deadlines"
      subtitle="Next 90 days"
      icon={CalendarClock}
      tint="bg-amber-500/10 text-amber-500"
    >
      {upcoming.length === 0 ? (
        <div className="py-8 text-center">
          <CalendarClock className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
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
                className="group flex items-center justify-between rounded-xl border border-border p-4 card-hover"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground transition-colors group-hover:text-primary">
                    {uniName}
                  </p>
                  <p className="text-sm text-muted-foreground">{a.studentName}</p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  {isUrgent && <AlertCircle className="h-4 w-4 text-red-500" />}
                  <span className={`text-sm font-medium ${isUrgent ? "text-red-500" : "text-muted-foreground"}`}>
                    {days}d left
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

function RecentlyAdded({
  applications,
}: {
  applications: Application[];
}): React.ReactElement {
  const recent = applications
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <SectionCard
      title="Recently Added"
      subtitle="Latest applications"
      icon={Clock}
      tint="bg-emerald-500/10 text-emerald-500"
    >
      {recent.length === 0 ? (
        <div className="py-8 text-center">
          <Clock className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
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
                className="group flex items-center gap-4 rounded-xl border border-border p-4 card-hover"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-cyan-500/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground transition-colors group-hover:text-primary">
                    {uniName}
                  </p>
                  <p className="text-xs text-muted-foreground">{a.studentName}</p>
                </div>
                <Badge variant="secondary" className={STATUS_COLORS[a.applicationStatus]}>
                  {a.applicationStatus}
                </Badge>
              </Link>
            );
          })}
        </div>
      )}
    </SectionCard>
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
      <PageHero
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        subtitle="Here's what's happening with your applications"
        actions={
          <>
            <Button variant="outline" asChild className="rounded-xl">
              <Link to="/programs">
                <Compass className="mr-2 h-4 w-4" />
                Explore programs
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/applications/new">
                <Plus className="mr-2 h-4 w-4" />
                New application
              </Link>
            </Button>
          </>
        }
      />

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
            <StatCard
              label="Total Applications"
              value={applications.length}
              icon={FileText}
              tint="bg-primary/10 text-primary"
              sub={
                <span className="text-muted-foreground">
                  {byStatus.length} status{byStatus.length !== 1 ? "es" : ""}
                </span>
              }
            />
            <StatCard
              label="Countries Exploring"
              value={countries.size}
              icon={Globe}
              tint="bg-emerald-500/10 text-emerald-500"
              sub={
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <MapPin className="h-3 w-3" />
                  {countries.size > 0
                    ? [...countries].slice(0, 2).join(", ") + (countries.size > 2 ? "…" : "")
                    : "Add your first"}
                </span>
              }
            />
            <StatCard
              label="Accepted"
              value={acceptedCount + enrolledCount}
              icon={CheckCircle2}
              tint="bg-emerald-500/10 text-emerald-500"
              sub={
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  {enrolledCount > 0 && (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> {enrolledCount} enrolled
                    </>
                  )}
                  {acceptedCount > 0 && !enrolledCount && (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> Offers in hand
                    </>
                  )}
                  {acceptedCount === 0 && enrolledCount === 0 && (
                    <span className="text-muted-foreground">Keep applying</span>
                  )}
                </span>
              }
            />
            <StatCard
              label="Next Deadline"
              value={nextDeadlineDays !== null ? nextDeadlineDays : "—"}
              icon={CalendarClock}
              tint="bg-amber-500/10 text-amber-500"
              sub={
                nextDeadlineDays !== null ? (
                  nextDeadlineDays <= 7 ? (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      Urgent — {nextDeadlineDays} day{nextDeadlineDays !== 1 ? "s" : ""}
                    </span>
                  ) : nextDeadlineDays <= 30 ? (
                    <span className="text-amber-600 dark:text-amber-400">{nextDeadlineDays} days away</span>
                  ) : (
                    <span className="text-muted-foreground">{nextDeadlineDays} days away</span>
                  )
                ) : (
                  <span className="text-muted-foreground">No deadlines set</span>
                )
              }
            />
          </>
        )}
      </div>

      {/* Status breakdown + Deadlines */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <div className="rounded-2xl border border-border bg-card p-6">
              <Skeleton className="mb-4 h-6 w-40" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <Skeleton className="mb-4 h-6 w-40" />
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
        <div className="rounded-2xl border border-border bg-card p-6">
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <RecentlyAdded applications={applications} />
      )}
    </div>
  );
}

/* ---------- Admin dashboard ---------- */

function AdminDashboard(): React.ReactElement {
  const { data: stats, isLoading, isError, error } = useAdminStats();

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold text-foreground">Failed to load platform stats</h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHero
        title="Platform Overview"
        subtitle="Key metrics across the entire platform"
      />

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={Users}
            tint="bg-rose-500/10 text-rose-500"
            sub={
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" /> Active accounts
              </span>
            }
          />
          <StatCard
            label="Universities"
            value={stats?.totalUniversities ?? 0}
            icon={GraduationCap}
            tint="bg-violet-500/10 text-violet-500"
            sub={
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Registered
              </span>
            }
          />
          <StatCard
            label="Programs"
            value={stats?.totalPrograms ?? 0}
            icon={BookOpen}
            tint="bg-indigo-500/10 text-indigo-500"
            sub={
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <BookOpen className="h-3 w-3" /> Available
              </span>
            }
          />
          <StatCard
            label="Countries"
            value={stats?.totalCountries ?? 0}
            icon={Globe}
            tint="bg-emerald-500/10 text-emerald-500"
            sub={
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Globe className="h-3 w-3" /> Worldwide
              </span>
            }
          />
          <StatCard
            label="Cities"
            value={stats?.totalCities ?? 0}
            icon={MapPin}
            tint="bg-cyan-500/10 text-cyan-500"
            sub={
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <MapPin className="h-3 w-3" /> Tracked
              </span>
            }
          />
          <StatCard
            label="Agencies"
            value={stats?.totalAgencies ?? 0}
            icon={Building2}
            tint="bg-orange-500/10 text-orange-500"
            sub={
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Building2 className="h-3 w-3" /> Active
              </span>
            }
          />
          <StatCard
            label="Students Managed"
            value={stats?.totalStudentsManaged ?? 0}
            icon={Users}
            tint="bg-rose-500/10 text-rose-500"
            sub={
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Users className="h-3 w-3" /> Under guidance
              </span>
            }
          />
        </div>
      )}

      {/* Role Breakdown */}
      {!isLoading && stats && (
        <SectionCard
          title="Users by Role"
          subtitle="Distribution across user types"
          icon={Users}
          tint="bg-primary/10 text-primary"
        >
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
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!stats.byRole || stats.byRole.length === 0) && (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No user data available</p>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* ---------- Agency dashboard ---------- */

function AgencyOverview(): React.ReactElement {
  const { data: applications, isLoading: appLoading } = useAgencyApplications();
  const { data: students, isLoading: studentsLoading } = useStudents();

  const isLoading = appLoading || studentsLoading;
  const totalApplications = applications?.length ?? 0;
  const totalStudents = students?.length ?? 0;

  return (
    <div className="space-y-8">
      <PageHero
        title="Agency Dashboard"
        subtitle="Manage your students and track their progress"
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/agency/students">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <StatCard
            label="Total Students"
            value={totalStudents}
            icon={Users}
            tint="bg-rose-500/10 text-rose-500"
            sub={
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Users className="h-3 w-3" /> Under your guidance
              </span>
            }
          />
          <StatCard
            label="Total Applications"
            value={totalApplications}
            icon={FileText}
            tint="bg-primary/10 text-primary"
            sub={
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-3 w-3" /> Being tracked
              </span>
            }
          />
        </div>
      )}

      {/* Recent Applications */}
      {!isLoading && applications && applications.length > 0 && (
        <SectionCard
          title="Recent Applications"
          subtitle="Latest student applications"
          icon={Clock}
          tint="bg-emerald-500/10 text-emerald-500"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/applications" className="text-primary hover:text-primary/90">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <div className="space-y-3">
            {applications.slice(0, 5).map((a) => {
              const progObj = typeof a.programId === "object" ? a.programId : null;
              const uniName = progObj?.universityId?.name ?? "University";
              return (
                <Link
                  key={a._id}
                  to={`/applications/${a._id}`}
                  className="group flex items-center justify-between rounded-xl border border-border p-4 card-hover"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground transition-colors group-hover:text-primary">
                      {uniName}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{a.studentName}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </SectionCard>
      )}

      {!isLoading && applications?.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-cyan-500/10">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mb-2 font-display text-xl font-semibold text-foreground">No applications yet</h2>
          <p className="mb-6 text-muted-foreground">
            Start by adding a student and a university application
          </p>
          <Button asChild className="rounded-xl">
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
