import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  GitCompare,
  Globe,
  Users,
  Building2,
  BookOpen,
  Menu,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/authContext";

function SidebarNav({
  onItemClick,
}: {
  onItemClick?: () => void;
}): React.ReactElement {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const items: Array<{
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    end?: boolean;
  }> = [];

  if (!isAuthenticated) {
    items.push(
      { to: "/login", icon: LogIn, label: "Login" },
      { to: "/register", icon: UserPlus, label: "Register" },
    );
  } else if (user.role === "student") {
    items.push(
      { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
      { to: "/universities", icon: GraduationCap, label: "Universities" },
      { to: "/programs", icon: BookOpen, label: "Programs" },
      { to: "/applications", icon: ClipboardList, label: "Applications" },
      { to: "/compare", icon: GitCompare, label: "Compare" },
    );
  } else if (user.role === "admin") {
    items.push(
      { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
      { to: "/countries", icon: Globe, label: "Countries" },
      { to: "/universities", icon: GraduationCap, label: "Universities" },
      { to: "/programs", icon: BookOpen, label: "Programs" },
      { to: "/users", icon: Users, label: "Users" },
    );
  } else if (user.role === "agency") {
    items.push(
      { to: "/agency", icon: Building2, label: "Dashboard" },
      { to: "/agency/students", icon: Users, label: "Students" },
      { to: "/applications", icon: ClipboardList, label: "Applications" },
    );
  }

  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onItemClick}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )
          }
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout(): React.ReactElement {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout(): void {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-sidebar border-r border-sidebar-border lg:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
          <img src="/logo.svg" alt="" className="h-7 w-7 rounded-lg" />
          <span className="text-lg font-semibold text-sidebar-foreground tracking-tight">
            WannaOut
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>

        {/* User section at bottom */}
        {user && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {user.name}
                </p>
                <p className="truncate text-xs capitalize text-sidebar-foreground/60">
                  {user.role}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-3 border-b px-4 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 bg-sidebar border-r border-sidebar-border p-0"
            >
              <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
                <img src="/logo.svg" alt="" className="h-7 w-7 rounded-lg" />
                <span className="text-lg font-semibold text-sidebar-foreground tracking-tight">
                  WannaOut
                </span>
              </div>
              <div className="flex flex-1 flex-col overflow-y-auto py-4">
                <SidebarNav onItemClick={() => setMobileOpen(false)} />

                {/* Mobile user section */}
                {user && (
                  <div className="mt-auto border-t border-sidebar-border px-3 pt-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-sidebar-foreground">
                          {user.name}
                        </p>
                        <p className="truncate text-xs capitalize text-sidebar-foreground/60">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      Log out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <img src="/logo.svg" alt="" className="h-6 w-6 rounded-md" />
          <span className="text-lg font-semibold tracking-tight">WannaOut</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
