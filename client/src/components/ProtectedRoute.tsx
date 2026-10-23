import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { StarGlyph } from "@/components/kit";

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
      <div className="flex h-screen items-center justify-center bg-paper">
        <StarGlyph className="size-5 animate-pulse text-ink-4" />
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
