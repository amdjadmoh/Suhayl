import { Link } from "react-router-dom";
import { useApplications } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { STATUS_COLORS, APPLICATION_STATUSES } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar, GraduationCap, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getProgName(a: any): string {
  if (typeof a.programId === "object" && a.programId?.name) return a.programId.name;
  return "Program";
}

function getUniName(a: any): string {
  if (typeof a.programId === "object" && a.programId?.universityId?.name) return a.programId.universityId.name;
  return "";
}

function ApplicationCard({ application }: { application: any }): React.ReactElement {
  const days = daysUntil(application.applicationDeadline);
  const isUrgent = days !== null && days <= 14 && days >= 0;
  const isOverdue = days !== null && days < 0;

  return (
    <Link to={`/applications/${application._id}`}
      className="group block rounded-lg border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium group-hover:text-primary truncate">{getProgName(application)}</h4>
          {getUniName(application) && (
            <p className="text-xs text-muted-foreground truncate">{getUniName(application)}</p>
          )}
        </div>
        {isUrgent && <AlertCircle className="h-4 w-4 text-red-500 ml-2 flex-shrink-0" />}
        {isOverdue && <AlertCircle className="h-4 w-4 text-orange-500 ml-2 flex-shrink-0" />}
      </div>

      <div className="text-xs text-muted-foreground mb-2">{application.studentName}</div>

      {application.applicationDeadline && (
        <div className={`flex items-center gap-1 text-xs mb-2 ${
          isOverdue ? "text-orange-600 font-medium" : isUrgent ? "text-red-500 font-medium" : "text-muted-foreground"
        }`}>
          <Calendar className="h-3 w-3" />
          {isOverdue ? `${Math.abs(days!)}d overdue` : days === 0 ? "Due today" : `${days}d left`}
        </div>
      )}

      <Badge variant="secondary" className={STATUS_COLORS[application.applicationStatus]}>
        {application.applicationStatus}
      </Badge>
    </Link>
  );
}

export default function ApplicationsTracker(): React.ReactElement {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useApplications();
  const applications = data?.applications ?? [];

  const byStatus: Record<string, typeof applications> = {};
  APPLICATION_STATUSES.forEach((s) => { byStatus[s] = applications.filter((a) => a.applicationStatus === s); });

  const [selectedStatus, setSelectedStatus] = useState(() => {
    return APPLICATION_STATUSES.find((s) => (byStatus[s]?.length ?? 0) > 0) ?? "Wishlist";
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load applications</h2>
        <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  const canAdd = user?.role === "student" || user?.role === "agency";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications Tracker</h1>
          <p className="text-sm text-muted-foreground">{applications.length} application{applications.length === 1 ? "" : "s"} tracked</p>
        </div>
        {canAdd && (
          <Button asChild><Link to="/applications/new"><PlusCircle className="mr-2 h-4 w-4" /> Add Application</Link></Button>
        )}
      </div>

      {!isLoading && applications.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {APPLICATION_STATUSES.map((status) => {
            const count = byStatus[status]?.length ?? 0;
            const isActive = selectedStatus === status;
            return (
              <button key={status} onClick={() => setSelectedStatus(status)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  isActive ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/30 hover:bg-muted/50"
                } ${count === 0 ? "opacity-50" : ""}`}>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className={STATUS_COLORS[status]}>{status}</Badge>
                  <span className="text-xl font-bold">{count}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-36" />))}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <GraduationCap className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="text-lg font-semibold">No applications yet</h2>
            {canAdd && <Button asChild className="mt-4"><Link to="/applications/new"><PlusCircle className="mr-2 h-4 w-4" /> Add Application</Link></Button>}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={STATUS_COLORS[selectedStatus]}>{selectedStatus}</Badge>
            <span className="text-sm text-muted-foreground">{byStatus[selectedStatus]?.length ?? 0} application{(byStatus[selectedStatus]?.length ?? 0) === 1 ? "" : "s"}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {byStatus[selectedStatus]?.map((a) => (<ApplicationCard key={a._id} application={a} />))}
          </div>
        </>
      )}
    </div>
  );
}
