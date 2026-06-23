import { Link } from "react-router-dom";
import { useUniversities, useUpdateUniversity } from "@/lib/api";
import {
  STATUS_COLORS,
  COUNTRY_FLAGS,
  APPLICATION_STATUSES,
} from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  MapPin,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function UniversityCard({
  university,
  onStatusChange,
}: {
  university: {
    _id: string;
    name: string;
    country: string;
    city: string;
    program: string;
    applicationDeadline?: string;
    applicationStatus: string;
  };
  onStatusChange: (id: string, newStatus: string) => void;
}): React.ReactElement {
  const days = daysUntil(university.applicationDeadline);
  const isUrgent = days !== null && days <= 14 && days >= 0;
  const isOverdue = days !== null && days < 0;

  return (
    <Link
      to={`/universities/${university._id}`}
      className="group block rounded-lg border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className="mb-2 flex items-start justify-between">
        <span className="text-lg">{COUNTRY_FLAGS[university.country] ?? "🎓"}</span>
        {isUrgent && (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
        {isOverdue && (
          <AlertCircle className="h-4 w-4 text-orange-500" />
        )}
      </div>

      <h4 className="mb-1 font-medium text-sm text-card-foreground group-hover:text-primary line-clamp-2">
        {university.name}
      </h4>

      <p className="mb-2 text-xs text-muted-foreground line-clamp-1">
        {university.program}
      </p>

      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <MapPin className="h-3 w-3" />
        {university.city}
      </div>

      {university.applicationDeadline && (
        <div
          className={`flex items-center gap-1 text-xs ${
            isOverdue
              ? "text-orange-600 font-medium"
              : isUrgent
              ? "text-red-500 font-medium"
              : "text-muted-foreground"
          }`}
        >
          <Calendar className="h-3 w-3" />
          {isOverdue
            ? `${Math.abs(days)}d overdue`
            : days === 0
            ? "Due today"
            : `${days}d left`}
        </div>
      )}

      {/* Status changer */}
      <div className="mt-2 pt-2 border-t">
        <select
          value={university.applicationStatus}
          onClick={(e) => e.preventDefault()}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            e.preventDefault();
            onStatusChange(university._id, e.target.value);
          }}
          className="w-full text-xs bg-transparent border-none p-0 cursor-pointer hover:text-primary focus:outline-none"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </Link>
  );
}

function ColumnSkeleton(): React.ReactElement {
  return (
    <Card className="min-w-[280px] flex-1">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}

export default function ApplicationsTracker(): React.ReactElement {
  const { data, isLoading, isError, error } = useUniversities();
  const updateMutation = useUpdateUniversity();

  const universities = data?.universities ?? [];

  function handleStatusChange(id: string, newStatus: string): void {
    updateMutation.mutate(
      { id, data: { applicationStatus: newStatus as any } },
      {
        onSuccess: () => {
          toast.success(`Status updated to ${newStatus}`);
        },
        onError: () => {
          toast.error("Failed to update status");
        },
      }
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load applications</h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  // Group universities by status
  const byStatus: Record<string, typeof universities> = {};
  APPLICATION_STATUSES.forEach((status) => {
    byStatus[status] = universities.filter((u) => u.applicationStatus === status);
  });

  // Count total applications (exclude Wishlist)
  const activeApplications = universities.filter(
    (u) => u.applicationStatus !== "Wishlist"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Applications Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            {universities.length} universit
            {universities.length === 1 ? "y" : "ies"} tracked ·{" "}
            {activeApplications} active application
            {activeApplications === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          to="/universities"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all universities
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Summary Cards */}
      {!isLoading && universities.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {APPLICATION_STATUSES.map((status) => {
            const count = byStatus[status]?.length ?? 0;
            return (
              <Card key={status} className={count === 0 ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className={STATUS_COLORS[status]}
                    >
                      {status}
                    </Badge>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ColumnSkeleton key={i} />
          ))}
        </div>
      ) : universities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <GraduationCap className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="text-lg font-semibold">No universities yet</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Add your first university to start tracking applications
            </p>
            <Link
              to="/universities"
              className="text-primary hover:underline"
            >
              Go to Universities
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {APPLICATION_STATUSES.map((status) => {
            const statusUniversities = byStatus[status] ?? [];
            return (
              <div
                key={status}
                className="min-w-[280px] flex-1 max-w-[350px]"
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={STATUS_COLORS[status]}
                        >
                          {status}
                        </Badge>
                      </CardTitle>
                      <span className="text-xs text-muted-foreground font-medium">
                        {statusUniversities.length}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {statusUniversities.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-4">
                        No universities
                      </p>
                    ) : (
                      statusUniversities.map((u) => (
                        <UniversityCard
                          key={u._id}
                          university={u}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
