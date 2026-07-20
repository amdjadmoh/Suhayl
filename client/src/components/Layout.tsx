import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
import ThemeToggle from "@/components/ThemeToggle";
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  end?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

function navSections(role: string | undefined): NavSection[] {
  if (role === "student") {
    return [
      {
        label: "Overview",
        items: [
          { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
        ],
      },
      {
        label: "Explore",
        items: [
          { to: "/universities", icon: GraduationCap, label: "Universities" },
          { to: "/programs", icon: BookOpen, label: "Programs" },
          { to: "/matches", icon: Sparkles, label: "Matches" },
        ],
      },
      {
        label: "My Journey",
        items: [
          { to: "/applications", icon: ClipboardList, label: "Applications" },
          { to: "/compare", icon: GitCompare, label: "Compare" },
          { to: "/saved", icon: Bookmark, label: "Saved" },
        ],
      },
    ];
  }
  if (role === "admin") {
    return [
      {
        label: "Overview",
        items: [
          { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
        ],
      },
      {
        label: "Catalog",
        items: [
          { to: "/countries", icon: Globe, label: "Countries" },
          { to: "/universities", icon: GraduationCap, label: "Universities" },
          { to: "/programs", icon: BookOpen, label: "Programs" },
        ],
      },
      {
        label: "People",
        items: [
          { to: "/users", icon: Users, label: "Users" },
          { to: "/saved", icon: Bookmark, label: "Saved" },
        ],
      },
    ];
  }
  if (role === "agency") {
    return [
      {
        label: "Overview",
        items: [{ to: "/agency", icon: Building2, label: "Dashboard", end: true }],
      },
      {
        label: "Manage",
        items: [
          { to: "/agency/students", icon: Users, label: "Students" },
          { to: "/applications", icon: ClipboardList, label: "Applications" },
        ],
      },
    ];
  }
  return [
    {
      label: "Account",
      items: [
        { to: "/login", icon: LogIn, label: "Login" },
        { to: "/register", icon: UserPlus, label: "Register" },
      ],
    },
  ];
}

function SidebarNav({
  onItemClick,
}: {
  onItemClick?: () => void;
}): React.ReactElement {
  const { user } = useAuth();
  const sections = navSections(user?.role);

  return (
    <nav className="flex flex-col gap-5 px-3">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            {section.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onItemClick}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-200",
                        isActive ? "opacity-100 scale-100" : "opacity-0 scale-50"
                      )}
                    />
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground/80 group-hover:text-foreground"
                      )}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
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
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-accent">
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
            <button onClick={() => markAll.mutate()} className="text-xs text-primary hover:underline">
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <DropdownMenuItem
              key={n._id}
              className={`flex flex-col items-start gap-1 px-3 py-2.5 cursor-pointer ${!n.read ? "bg-accent/60" : ""}`}
              onClick={() => {
                if (!n.read) markRead.mutate(n._id);
                if (n.link) navigate(n.link);
              }}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={`text-sm font-medium flex-1 ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                  {n.title}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">{timeAgo(n.createdAt)}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
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
  const location = useLocation();

  function handleLogout(): void {
    logout();
    navigate("/login");
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan-500 shadow-md shadow-primary/25 p-[5px]">
          <img src="/logo.svg" alt="" className="h-full w-full" />
        </div>
        <div className="leading-tight">
          <span className="block font-display text-lg font-bold tracking-tight text-foreground">
            Suhayl
          </span>
          <span className="block text-[11px] font-medium text-muted-foreground">
            Study abroad OS
          </span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>

      {/* User section */}
      {user && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan-500 text-sm font-bold text-white shadow-sm shadow-primary/25">
              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs capitalize text-muted-foreground">
                {user.role}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-border bg-card lg:flex">
        {sidebarContent}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop top bar */}
        <header className="hidden h-14 items-center justify-end gap-2 border-b border-border bg-card/70 backdrop-blur-md px-6 lg:flex">
          <ThemeToggle />
          {user && <NotificationBell />}
        </header>

        {/* Mobile top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card/70 backdrop-blur-md px-4 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-r border-border bg-card p-0">
              <div className="flex h-full flex-col">
                {sidebarContent}
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-cyan-500 p-[3px]">
              <img src="/logo.svg" alt="" className="h-full w-full" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">Suhayl</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {user && <NotificationBell />}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div
            key={location.pathname}
            className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 animate-fade-up"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
