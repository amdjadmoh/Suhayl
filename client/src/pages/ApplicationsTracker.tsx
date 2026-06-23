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
  Loader2,
} from "lucide-react";
import type { University, ApplicationProgress } from "@/types/university";
import React, { useState } from "react";

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
  onProgressUpdate,
}: {
  university: University;
  onStatusChange: (id: string, newStatus: string) => void;
  onProgressUpdate: (id: string, progress: Partial<ApplicationProgress>) => void;
}): React.ReactElement {
  const days = daysUntil(university.applicationDeadline);
  const isUrgent = days !== null && days <= 14 && days >= 0;
  const isOverdue = days !== null && days < 0;
  const [isUpdating, setIsUpdating] = useState(false);

  const progress = university.applicationProgress || {
    documentsObtained: [],
    ieltsTaken: false,
    toeflTaken: false,
    gpaVerified: false,
    recommendationsRequested: 0,
    recommendationsReceived: 0,
    sopStatus: "not_started",
    applicationFeePaid: false,
    visaApplied: false,
    interviewCompleted: false,
  };

  const handleUpdate = async (update: Partial<ApplicationProgress>) => {
    setIsUpdating(true);
    try {
      await onProgressUpdate(university._id, update);
    } finally {
      setIsUpdating(false);
    }
  };

  const docsTotal = university.requiredDocuments?.length || 0;
  const docsGot = progress.documentsObtained?.length || 0;
  const docsPercent = docsTotal > 0 ? (docsGot / docsTotal) * 100 : 0;

  const recsTotal = progress.recommendationsRequested || 0;
  const recsGot = progress.recommendationsReceived || 0;

  return (
    <div className="group relative block rounded-lg border bg-card p-3 transition-all hover:border-primary/30 shadow-sm flex flex-col">
      {isUpdating && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Basic Info */}
      <Link to={`/universities/${university._id}`} className="block mb-2">
        <div className="mb-2 flex items-start justify-between">
          <span className="text-lg">{COUNTRY_FLAGS[university.country] ?? "🎓"}</span>
          {isUrgent && <AlertCircle className="h-4 w-4 text-red-500" />}
          {isOverdue && <AlertCircle className="h-4 w-4 text-orange-500" />}
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
      </Link>

      <div className="mt-2 pt-2 border-t">
        <select
          value={university.applicationStatus}
          onChange={(e) => onStatusChange(university._id, e.target.value)}
          className="w-full text-xs bg-transparent border border-input rounded p-1 mb-3 cursor-pointer hover:border-primary focus:outline-none"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Progress Checklist */}
      <div className="flex-1 text-xs space-y-3 pt-2">
        <h5 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Progress Checklist</h5>

        {/* Documents */}
        {docsTotal > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Documents</span>
              <span>{docsGot} / {docsTotal}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${docsPercent}%` }} />
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {university.requiredDocuments.map((doc) => {
                const checked = progress.documentsObtained?.includes(doc);
                return (
                  <label key={doc} className="flex items-center gap-1 bg-secondary hover:bg-secondary/80 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="w-3 h-3 cursor-pointer accent-primary"
                      checked={checked}
                      onChange={(e) => {
                        const newDocs = e.target.checked
                          ? [...(progress.documentsObtained || []), doc]
                          : (progress.documentsObtained || []).filter(d => d !== doc);
                        handleUpdate({ documentsObtained: newDocs });
                      }}
                    />
                    <span className="truncate max-w-[120px]">{doc}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Language Tests */}
        {(university.ieltsRequirement || university.toeflRequirement) && (
          <div className="space-y-1">
            {university.ieltsRequirement ? (
              <div className="flex items-center gap-2 justify-between">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3 h-3 accent-primary"
                    checked={progress.ieltsTaken}
                    onChange={(e) => handleUpdate({ ieltsTaken: e.target.checked })}
                  />
                  <span>IELTS</span>
                </label>
                {progress.ieltsTaken && (
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Score"
                    className="w-16 h-6 px-1 text-xs border rounded bg-transparent text-right"
                    value={progress.ieltsScore || ""}
                    onChange={(e) => handleUpdate({ ieltsScore: parseFloat(e.target.value) || undefined })}
                  />
                )}
              </div>
            ) : null}

            {university.toeflRequirement ? (
              <div className="flex items-center gap-2 justify-between">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3 h-3 accent-primary"
                    checked={progress.toeflTaken}
                    onChange={(e) => handleUpdate({ toeflTaken: e.target.checked })}
                  />
                  <span>TOEFL</span>
                </label>
                {progress.toeflTaken && (
                  <input
                    type="number"
                    placeholder="Score"
                    className="w-16 h-6 px-1 text-xs border rounded bg-transparent text-right"
                    value={progress.toeflScore || ""}
                    onChange={(e) => handleUpdate({ toeflScore: parseInt(e.target.value) || undefined })}
                  />
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* GPA */}
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            className="w-3 h-3 accent-primary"
            checked={progress.gpaVerified}
            onChange={(e) => handleUpdate({ gpaVerified: e.target.checked })}
          />
          <span>GPA Verified</span>
        </label>

        {/* Recommendations */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Recommendations</span>
            <span>{recsGot} / {Math.max(recsTotal, recsGot, 1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded">
              <button
                className="px-2 hover:bg-muted"
                onClick={() => handleUpdate({ recommendationsRequested: Math.max(0, recsTotal - 1) })}
              >-</button>
              <span className="w-4 text-center">{recsTotal}</span>
              <button
                className="px-2 hover:bg-muted"
                onClick={() => handleUpdate({ recommendationsRequested: recsTotal + 1 })}
              >+</button>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase">Req</span>

            <div className="flex items-center border rounded ml-auto">
              <button
                className="px-2 hover:bg-muted"
                onClick={() => handleUpdate({ recommendationsReceived: Math.max(0, recsGot - 1) })}
              >-</button>
              <span className="w-4 text-center">{recsGot}</span>
              <button
                className="px-2 hover:bg-muted"
                onClick={() => handleUpdate({ recommendationsReceived: recsGot + 1 })}
              >+</button>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase">Got</span>
          </div>
        </div>

        {/* SOP */}
        <div className="flex items-center justify-between">
          <span>Statement of Purpose</span>
          <select
            className="text-xs border rounded p-0.5 bg-transparent"
            value={progress.sopStatus}
            onChange={(e) => handleUpdate({ sopStatus: e.target.value as any })}
          >
            <option value="not_started">Not Started</option>
            <option value="draft">Drafting</option>
            <option value="final">Final</option>
          </select>
        </div>

        {/* Application Fee */}
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            className="w-3 h-3 accent-primary"
            checked={progress.applicationFeePaid}
            onChange={(e) => handleUpdate({ applicationFeePaid: e.target.checked })}
          />
          <span>Fee Paid</span>
        </label>

        {/* Submission Date */}
        <div className="flex items-center justify-between">
          <span>Submitted On</span>
          <input
            type="date"
            className="text-xs border rounded p-0.5 bg-transparent w-24"
            value={progress.applicationSubmittedDate?.split('T')[0] || ""}
            onChange={(e) => handleUpdate({ applicationSubmittedDate: e.target.value || undefined })}
          />
        </div>

        {/* Visa */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3 accent-primary"
              checked={progress.visaApplied}
              onChange={(e) => handleUpdate({ visaApplied: e.target.checked })}
            />
            <span>Visa Applied</span>
          </label>
          {progress.visaApplied && (
            <label className="flex items-center gap-1.5 cursor-pointer ml-4">
              <input
                type="checkbox"
                className="w-3 h-3 accent-primary"
                checked={progress.visaApproved || false}
                onChange={(e) => handleUpdate({ visaApproved: e.target.checked })}
              />
              <span>Visa Approved</span>
            </label>
          )}
        </div>

        {/* Interview */}
        <div className="space-y-1 border-t pt-1">
          <div className="flex items-center justify-between">
            <span>Interview</span>
            <input
              type="date"
              className="text-xs border rounded p-0.5 bg-transparent w-24"
              value={progress.interviewScheduled?.split('T')[0] || ""}
              onChange={(e) => handleUpdate({ interviewScheduled: e.target.value || undefined })}
            />
          </div>
          {progress.interviewScheduled && (
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-3 h-3 accent-primary"
                checked={progress.interviewCompleted}
                onChange={(e) => handleUpdate({ interviewCompleted: e.target.checked })}
              />
              <span>Interview Completed</span>
            </label>
          )}
        </div>

      </div>
    </div>
  );
}

function ColumnSkeleton(): React.ReactElement {
  return (
    <Card className="min-w-[300px] flex-1">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
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

  function handleProgressUpdate(id: string, progressUpdate: Partial<ApplicationProgress>): Promise<void> {
    return new Promise((resolve, reject) => {
      const university = universities.find(u => u._id === id);
      if (!university) {
        reject(new Error("University not found"));
        return;
      }
      
      const updatedProgress = {
        ...(university.applicationProgress || {}),
        ...progressUpdate
      };

      updateMutation.mutate(
        { id, data: { applicationProgress: updatedProgress as any } },
        {
          onSuccess: () => {
            resolve();
          },
          onError: () => {
            toast.error("Failed to update progress");
            reject();
          },
        }
      );
    });
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
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)] min-h-[600px]">
          {APPLICATION_STATUSES.map((status) => {
            const statusUniversities = byStatus[status] ?? [];
            return (
              <div
                key={status}
                className="min-w-[320px] flex-1 max-w-[380px] h-full flex flex-col"
              >
                <Card className="h-full flex flex-col border-muted bg-muted/20">
                  <CardHeader className="pb-3 shrink-0">
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
                  <CardContent className="space-y-3 overflow-y-auto flex-1 pb-4">
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
                          onProgressUpdate={handleProgressUpdate}
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
