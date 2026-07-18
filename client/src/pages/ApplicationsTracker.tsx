import { Link } from "react-router-dom";
import { useApplications } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { STATUS_COLORS, APPLICATION_STATUSES } from "@/lib/constants";
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
      className="group block relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#0EA5E9]/30 transition-all duration-300">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h4 className="text-lg font-semibold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors truncate">
              {getProgName(application)}
            </h4>
            {getUniName(application) && (
              <p className="text-sm text-slate-500 truncate mt-1">{getUniName(application)}</p>
            )}
          </div>
          {isUrgent && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
          {isOverdue && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <GraduationCap className="h-4 w-4" />
          {application.studentName}
        </div>

        {application.applicationDeadline && (
          <div className={`flex items-center gap-2 mb-4 ${
            isOverdue ? "text-orange-600" : isUrgent ? "text-red-500" : "text-slate-500"
          }`}>
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isOverdue ? `${Math.abs(days!)}d overdue` : days === 0 ? "Due today" : `${days}d left`}
            </span>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100">
          <Badge variant="secondary" className={`${STATUS_COLORS[application.applicationStatus]} rounded-full`}>
            {application.applicationStatus}
          </Badge>
        </div>
      </div>
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
    return APPLICATION_STATUSES.find((s) => (byStatus[s]?.length ?? 0) > 0) ?? "Preparing";
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-[#0F172A]">Failed to load applications</h2>
        <p className="text-sm text-slate-500">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  const canAdd = user?.role === "student" || user?.role === "agency";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0EA5E9] via-sky-600 to-cyan-700 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-sky-400 blur-3xl" />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Applications Tracker</h1>
            <p className="mt-2 text-sky-100">{applications.length} application{applications.length === 1 ? "" : "s"} tracked</p>
          </div>
          {canAdd && (
            <Button asChild className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl">
              <Link to="/applications/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Application
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Status Filters */}
      {!isLoading && applications.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {APPLICATION_STATUSES.map((status) => {
            const count = byStatus[status]?.length ?? 0;
            const isActive = selectedStatus === status;
            return (
              <button key={status} onClick={() => setSelectedStatus(status)}
                className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all ${
                  isActive 
                    ? "bg-gradient-to-br from-[#0EA5E9] to-[#06B6D4] text-white shadow-lg shadow-[#0EA5E9]/20" 
                    : "bg-white border border-slate-100 hover:border-[#0EA5E9]/30 hover:shadow-md"
                } ${count === 0 ? "opacity-50" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isActive ? "text-white" : "text-slate-700"}`}>{status}</span>
                  <span className={`text-2xl font-bold ${isActive ? "text-white" : "text-[#0F172A]"}`}>{count}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-48 rounded-2xl" />))}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 shadow-sm border border-slate-100 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0EA5E9]/10 to-[#06B6D4]/10 mx-auto mb-4">
            <GraduationCap className="h-10 w-10 text-[#0EA5E9]" />
          </div>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">No applications yet</h2>
          {canAdd && (
            <Button asChild className="mt-4 bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] hover:from-[#0284C7] hover:to-[#0891B2] text-white rounded-xl shadow-lg shadow-[#0EA5E9]/20">
              <Link to="/applications/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Application
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className={`${STATUS_COLORS[selectedStatus]} rounded-full px-4 py-1.5`}>{selectedStatus}</Badge>
            <span className="text-sm text-slate-500">{byStatus[selectedStatus]?.length ?? 0} application{(byStatus[selectedStatus]?.length ?? 0) === 1 ? "" : "s"}</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {byStatus[selectedStatus]?.map((a) => (<ApplicationCard key={a._id} application={a} />))}
          </div>
        </>
      )}
    </div>
  );
}
