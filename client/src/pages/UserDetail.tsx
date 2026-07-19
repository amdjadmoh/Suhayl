import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useUsers,
  useUniversities,
  usePrograms,
  useApplications,
  useToggleUniversityOfficial,
  useToggleProgramOfficial,
} from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  GraduationCap,
  Building2,
  BookOpen,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function UserDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const { data: users, isLoading: usersLoading } = useUsers();
  const user = users?.find((u) => u._id === id);

  const { data: unisData, isLoading: unisLoading } = useUniversities();
  const { data: progsData, isLoading: progsLoading } = usePrograms();
  const { data: appsData, isLoading: appsLoading } = useApplications();

  const userUnis =
    unisData?.universities.filter(
      (u) => u.createdBy === id && !u.isOfficial,
    ) ?? [];
  const userProgs =
    progsData?.programs.filter(
      (p) => p.createdBy === id && !p.isOfficial,
    ) ?? [];
  const userApps =
    appsData?.applications.filter(
      (a) => a.createdBy === id || a.studentEmail === user?.email,
    ) ?? [];

  const toggleUniOfficial = useToggleUniversityOfficial();
  const toggleProgOfficial = useToggleProgramOfficial();

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-foreground">Access denied</h2>
        <p className="text-sm text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  if (usersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-foreground">User not found</h2>
        <p className="text-sm text-muted-foreground">
          This user may have been deleted or the link is invalid.
        </p>
        <Button
          variant="outline"
          className="mt-4 rounded-xl"
          onClick={() => navigate("/users")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-5 w-5" />;
      case "agency":
        return <Building2 className="h-5 w-5" />;
      default:
        return <GraduationCap className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30";
      case "agency":
        return "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/users")}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      {/* User info header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-red-700 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-card blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-rose-400 blur-3xl" />
        </div>
        <div className="relative flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-rose-100">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {user.email}
              </span>
            </div>
            <div className="mt-3">
              <Badge
                className={`${getRoleColor(user.role)} border rounded-full px-3 py-1 text-xs`}
              >
                <span className="flex items-center gap-1.5">
                  {getRoleIcon(user.role)}
                  {user.role}
                </span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Universities */}
      <div className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-violet-500" />
            Custom Universities
            <span className="text-sm font-normal text-muted-foreground">
              ({userUnis.length})
            </span>
          </h3>
        </div>
        {unisLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : userUnis.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Building2 className="h-10 w-10 mb-2" />
            <p className="text-sm">No custom universities</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {userUnis.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <Link
                  to={`/universities/${u._id}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {u.name} — {u.city}, {u.country}
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs"
                  disabled={toggleUniOfficial.isPending}
                  onClick={async () => {
                    try {
                      await toggleUniOfficial.mutateAsync(u._id);
                      toast.success(
                        u.isOfficial
                          ? "University marked as custom"
                          : "University marked as official",
                      );
                    } catch {
                      toast.error("Failed to toggle official status");
                    }
                  }}
                >
                  {toggleUniOfficial.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : u.isOfficial ? (
                    "Make Custom"
                  ) : (
                    "Make Official"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Programs */}
      <div className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            Custom Programs
            <span className="text-sm font-normal text-muted-foreground">
              ({userProgs.length})
            </span>
          </h3>
        </div>
        {progsLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : userProgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BookOpen className="h-10 w-10 mb-2" />
            <p className="text-sm">No custom programs</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {userProgs.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <Link
                  to={`/programs/${p._id}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {p.name} — {p.degreeLevel}
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs"
                  disabled={toggleProgOfficial.isPending}
                  onClick={async () => {
                    try {
                      await toggleProgOfficial.mutateAsync(p._id);
                      toast.success(
                        p.isOfficial
                          ? "Program marked as custom"
                          : "Program marked as official",
                      );
                    } catch {
                      toast.error("Failed to toggle official status");
                    }
                  }}
                >
                  {toggleProgOfficial.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : p.isOfficial ? (
                    "Make Custom"
                  ) : (
                    "Make Official"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applications */}
      <div className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-500" />
            Applications
            <span className="text-sm font-normal text-muted-foreground">
              ({userApps.length})
            </span>
          </h3>
        </div>
        {appsLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : userApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <GraduationCap className="h-10 w-10 mb-2" />
            <p className="text-sm">No applications found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {userApps.map((a) => {
              const programName =
                typeof a.programId === "object" ? a.programId.name : "Program";
              return (
                <div
                  key={a._id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <Link
                    to={`/applications/${a._id}`}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {programName}
                  </Link>
                  <Badge
                    className={`rounded-full px-3 py-1 text-xs ${
                      a.applicationStatus === "Accepted"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                        : a.applicationStatus === "Rejected"
                          ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30"
                          : a.applicationStatus === "Enrolled"
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
                            : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                    }`}
                  >
                    {a.applicationStatus}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
