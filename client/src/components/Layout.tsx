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
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
      { to: "/universities", icon: GraduationCap, label: "Universities" },
      { to: "/programs", icon: BookOpen, label: "Programs" },
      { to: "/applications", icon: ClipboardList, label: "Applications" },
      { to: "/compare", icon: GitCompare, label: "Compare" },
    );
  } else if (user.role === "admin") {
    items.push(
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
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
    <nav className="flex flex-col gap-0.5 px-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onItemClick}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-[#0EA5E9]/10 text-[#0EA5E9]"
                : "text-slate-500 hover:text-[#0F172A] hover:bg-slate-50"
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

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 shadow-sm">
          <img src="/logo.svg" alt="" className="h-full w-full" />
        </div>
        <span className="text-xl font-bold tracking-tight text-[#0F172A]">
          Suhayl
        </span>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>

      {/* User section */}
      {user && (
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0EA5E9] text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#0F172A]">
                {user.name}
              </p>
              <p className="truncate text-xs capitalize text-slate-400">
                {user.role}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-400 hover:text-[#0F172A] hover:bg-slate-100"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-100 bg-white lg:flex">
        {sidebarContent}
      </aside>

      {/* Main content area — no header bar, content flows naturally */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-md px-4 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-500">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-r border-slate-100 bg-white p-0">
              <div className="flex h-full flex-col">
                {sidebarContent}
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
              <img src="/logo.svg" alt="" className="h-full w-full" />
            </div>
            <span className="text-lg font-bold text-[#0F172A]">Suhayl</span>
          </div>
          <div className="flex h-8 w-8" />
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
