import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  role?: "admin" | "student" | "agency";
  children?: React.ReactElement;
}

export default function ProtectedRoute({
  role,
  children,
}: ProtectedRouteProps): React.ReactElement {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
}
