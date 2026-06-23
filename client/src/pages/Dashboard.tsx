import { useStats } from "@/lib/api";
import { STATUS_COLORS, COUNTRY_FLAGS } from "@/lib/constants";
import type { University } from "@/types/university";
import {
  GraduationCap,
  Globe,
  DollarSign,
  Award,
  CalendarClock,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

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
              No universities yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingDeadlines({
  universities,
}: {
  universities: University[];
}): React.ReactElement {
  const now = new Date();
  const ninetyDays = new Date();
  ninetyDays.setDate(ninetyDays.getDate() + 90);

  const upcoming = universities
    .filter((u) => {
      if (!u.applicationDeadline) return false;
      const d = new Date(u.applicationDeadline);
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
            {upcoming.map((u) => {
              const days = daysUntil(u.applicationDeadline!);
              const isUrgent = days <= 14;
              return (
                <Link
                  key={u._id}
                  to={`/universities/${u._id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {u.city}, {u.country}
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
  universities,
}: {
  universities: University[];
}): React.ReactElement {
  const recent = universities
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
            No universities yet
          </p>
        ) : (
          <div className="space-y-3">
            {recent.map((u) => (
              <Link
                key={u._id}
                to={`/universities/${u._id}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-lg">
                  {COUNTRY_FLAGS[u.country] ?? "🎓"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.city}, {u.country}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={STATUS_COLORS[u.applicationStatus]}
                >
                  {u.applicationStatus}
                </Badge>
              </Link>
            ))}
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

export default function Dashboard(): React.ReactElement {
  const { data: stats, isLoading, isError, error } = useStats();

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4" />
                  Scholarships Available
                </div>
                <p className="mt-1 text-3xl font-bold">
                  {stats?.scholarshipCount ?? 0}
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
            <StatusBreakdown byStatus={stats?.byStatus ?? []} />
            <UpcomingDeadlines
              universities={stats?.upcomingDeadlines ?? []}
            />
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
        <RecentlyAdded
          universities={stats?.recentlyAdded ?? []}
        />
      )}
    </div>
  );
}
