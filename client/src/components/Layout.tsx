import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Bookmark,
  Building2,
  Ellipsis,
  FileText,
  GraduationCap,
  House,
  LogOut,
  Settings as SettingsIcon,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/authContext";
import { useCompareOptional } from "@/lib/compareContext";
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from "@/lib/api";
import { initials, timeAgo } from "@/lib/format";
import ThemeToggle from "@/components/ThemeToggle";
import { Wordmark } from "@/components/kit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = { to: string; label: string; end?: boolean; count?: number };
type TabItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

/** Top-bar links (always shown) and the overflow ("More") links for each role. */
function navFor(role: string | undefined, compareCount: number): { main: NavItem[]; more: NavItem[]; tabs: TabItem[] } {
  if (role === "student") {
    return {
      main: [
        { to: "/dashboard", label: "Dashboard", end: true },
        { to: "/applications", label: "Applications" },
        { to: "/programs", label: "Programs" },
        { to: "/universities", label: "Universities" },
        { to: "/matches", label: "Matches" },
        { to: "/saved", label: "Saved" },
        { to: "/compare", label: "Compare", count: compareCount },
      ],
      more: [
        { to: "/countries", label: "Countries" },
        { to: "/budget-calculator", label: "Budget" },
      ],
      tabs: [
        { to: "/dashboard", label: "Home", icon: House, end: true },
        { to: "/applications", label: "Applications", icon: FileText },
        { to: "/programs", label: "Programs", icon: GraduationCap },
        { to: "/saved", label: "Saved", icon: Bookmark },
      ],
    };
  }
  if (role === "admin") {
    return {
      main: [
        { to: "/dashboard", label: "Dashboard", end: true },
        { to: "/universities", label: "Universities" },
        { to: "/programs", label: "Programs" },
        { to: "/countries", label: "Countries" },
        { to: "/cities", label: "Cities" },
        { to: "/users", label: "Users" },
      ],
      more: [{ to: "/saved", label: "Saved" }],
      tabs: [
        { to: "/dashboard", label: "Home", icon: House, end: true },
        { to: "/universities", label: "Universities", icon: Building2 },
        { to: "/programs", label: "Programs", icon: GraduationCap },
        { to: "/users", label: "Users", icon: Users },
      ],
    };
  }
  if (role === "agency") {
    return {
      main: [
        { to: "/agency", label: "Dashboard", end: true },
        { to: "/agency/students", label: "Students" },
        { to: "/applications", label: "Applications" },
        { to: "/programs", label: "Programs" },
        { to: "/universities", label: "Universities" },
      ],
      more: [
        { to: "/agency/team", label: "Team" },
        { to: "/countries", label: "Countries" },
      ],
      tabs: [
        { to: "/agency", label: "Home", icon: House, end: true },
        { to: "/agency/students", label: "Students", icon: Users },
        { to: "/applications", label: "Applications", icon: FileText },
        { to: "/programs", label: "Programs", icon: GraduationCap },
      ],
    };
  }
  return {
    main: [
      { to: "/login", label: "Sign in" },
      { to: "/register", label: "Create account" },
    ],
    more: [],
    tabs: [],
  };
}

function TopNav({ main, more }: { main: NavItem[]; more: NavItem[] }): React.ReactElement {
  const location = useLocation();
  const moreActive = more.some((m) => location.pathname.startsWith(m.to));
  return (
    <nav aria-label="Main" className="no-scrollbar hidden min-w-0 flex-1 overflow-x-auto md:block">
      <ul className="flex items-center gap-1">
        {main.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
                  isActive ? "bg-paper-sunken text-ink" : "text-ink-3 hover:bg-paper-hover hover:text-ink",
                )
              }
            >
              <span>{item.label}</span>
              {!!item.count && (
                <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-on-brand tnum">
                  {item.count}
                </span>
              )}
            </NavLink>
          </li>
        ))}
        {more.length > 0 && (
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                    moreActive ? "bg-paper-sunken text-ink" : "text-ink-3 hover:bg-paper-hover hover:text-ink",
                  )}
                >
                  More
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {more.map((m) => (
                  <DropdownMenuItem key={m.to} asChild className="cursor-pointer font-medium">
                    <Link to={m.to}>{m.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        )}
      </ul>
    </nav>
  );
}

/** Phone tab bar: four main places plus everything else under "More". */
function BottomTabs({ tabs, rest }: { tabs: TabItem[]; rest: NavItem[] }): React.ReactElement | null {
  const location = useLocation();
  if (tabs.length === 0) return null;
  const restActive = rest.some((m) => location.pathname.startsWith(m.to));
  const tabCls = "flex flex-1 flex-col items-center gap-1 pt-2 pb-1.5 text-[11px] font-semibold transition-colors";
  return (
    <nav
      aria-label="Tabs"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper-raised/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {tabs.map((t) => (
          <li key={t.to} className="flex flex-1">
            <NavLink
              to={t.to}
              end={t.end}
              className={({ isActive }) => cn(tabCls, isActive ? "text-brand" : "text-ink-3")}
            >
              <t.icon className="size-[22px]" strokeWidth={2} />
              {t.label}
            </NavLink>
          </li>
        ))}
        <li className="flex flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={cn(tabCls, restActive ? "text-brand" : "text-ink-3")}>
                <Ellipsis className="size-[22px]" />
                More
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="mb-2 w-52">
              {rest.map((m) => (
                <DropdownMenuItem key={m.to} asChild className="cursor-pointer font-medium">
                  <Link to={m.to}>
                    {m.label}
                    {!!m.count && <span className="ml-auto text-xs font-bold text-brand tnum">{m.count}</span>}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>
    </nav>
  );
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
        <button
          type="button"
          className="relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-paper-sunken hover:text-ink"
          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-stamp px-1 text-[10px] font-bold text-white ring-2 ring-paper-raised tnum">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-base font-bold">Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              className="text-[13px] font-semibold text-brand-ink hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto p-1.5">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-3">You're all caught up.</p>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <DropdownMenuItem
                key={n._id}
                className={cn("flex cursor-pointer flex-col items-start gap-0.5 rounded-xl px-3 py-2.5", !n.read && "bg-brand-soft/50")}
                onClick={() => {
                  if (!n.read) markRead.mutate(n._id);
                  if (n.link) navigate(n.link);
                }}
              >
                <div className="flex w-full items-baseline gap-2">
                  {!n.read && <span className="size-2 shrink-0 -translate-y-px rounded-full bg-brand" />}
                  <span className={cn("flex-1 text-sm", n.read ? "text-ink-2" : "font-semibold text-ink")}>{n.title}</span>
                  <span className="shrink-0 text-xs text-ink-4">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-3">{n.message}</p>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu(): React.ReactElement | null {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  function handleLogout(): void {
    logout();
    navigate("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="ml-1 inline-flex size-10 items-center justify-center rounded-full bg-brand-soft text-[13px] font-bold text-brand-ink transition-shadow hover:ring-4 hover:ring-brand-soft/70"
          aria-label="Account"
        >
          {initials(user.name)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="px-2.5 py-2">
          <p className="text-sm font-bold text-ink">{user.name}</p>
          <p className="mt-0.5 truncate text-[13px] font-normal text-ink-3">{user.email}</p>
          <p className="mt-2 inline-flex rounded-full bg-paper-sunken px-2 py-0.5 text-xs font-semibold text-ink-2">
            {user.agencyRole === "counsellor" ? (
              <>Counsellor{user.agencyName ? ` at ${user.agencyName}` : ""}</>
            ) : user.role === "agency" ? (
              <>Agency owner</>
            ) : (
              <>
                <span className="capitalize">{user.role}</span>&nbsp;account
              </>
            )}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer font-medium">
          <Link to="/settings">
            <SettingsIcon />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer font-medium">
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Layout(): React.ReactElement {
  const { user } = useAuth();
  const location = useLocation();
  const compare = useCompareOptional();
  const home = user?.role === "agency" ? "/agency" : "/dashboard";
  const { main, more, tabs } = navFor(user?.role, compare?.compareIds.length ?? 0);
  // Everything not on the phone tab bar goes into its "More" menu
  const tabPaths = new Set(tabs.map((t) => t.to));
  const phoneRest = [...main, ...more].filter((m) => !tabPaths.has(m.to));

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-30 border-b border-rule bg-paper-raised/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link to={home} className="shrink-0 text-[15px]" aria-label="Suhayl — home">
            <Wordmark />
          </Link>
          <TopNav main={main} more={more} />
          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            {user && <NotificationBell />}
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 sm:px-6 md:pb-12 lg:px-8">
        <div key={location.pathname} className="mx-auto max-w-[1180px] animate-settle pt-6 sm:pt-8">
          <Outlet />
        </div>
      </main>

      <BottomTabs tabs={tabs} rest={phoneRest} />
    </div>
  );
}
