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
  Bookmark,
  Menu,
  LogOut,
  LogIn,
  UserPlus,
  Sparkles,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/authContext";
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      { to: "/matches", icon: Sparkles, label: "Matches" },
      { to: "/applications", icon: ClipboardList, label: "Applications" },
      { to: "/compare", icon: GitCompare, label: "Compare" },
      { to: "/saved", icon: Bookmark, label: "Saved" },
    );
  } else if (user.role === "admin") {
    items.push(
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
      { to: "/countries", icon: Globe, label: "Countries" },
      { to: "/universities", icon: GraduationCap, label: "Universities" },
      { to: "/programs", icon: BookOpen, label: "Programs" },
      { to: "/users", icon: Users, label: "Users" },
      { to: "/saved", icon: Bookmark, label: "Saved" },
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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NotificationBell(): React.ReactElement | null {
  const { user } = useAuth();
  const { data: notifData } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();
  const navigate = useNavigate();

  if (!user) return null;

  const unreadCount = notifData?.unreadCount ?? 0;
  const notifications = notifData?.notifications ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-[#0F172A] hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button onClick={() => markAll.mutate()} className="text-xs text-[#0EA5E9] hover:underline">
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-slate-400">No notifications yet</div>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <DropdownMenuItem
              key={n._id}
              className={`flex flex-col items-start gap-1 px-3 py-2.5 cursor-pointer ${!n.read ? "bg-slate-50" : ""}`}
              onClick={() => {
                if (!n.read) markRead.mutate(n._id);
                if (n.link) navigate(n.link);
              }}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={`text-sm font-medium flex-1 ${!n.read ? "text-[#0F172A]" : "text-slate-600"}`}>
                  {n.title}
                </span>
                <span className="text-xs text-slate-400 shrink-0">{timeAgo(n.createdAt)}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
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
              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
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

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop top bar */}
        <header className="hidden h-14 items-center justify-end gap-3 border-b border-slate-100 bg-white/90 backdrop-blur-md px-6 lg:flex">
          {user && <NotificationBell />}
        </header>

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
          <div className="flex items-center gap-2">
            {user && <NotificationBell />}
          </div>
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
