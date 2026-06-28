import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  GitCompare,
  Globe,
  MapPin,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    to: "/",
    icon: LayoutDashboard,
    label: "Dashboard",
    end: true,
  },
  {
    to: "/countries",
    icon: Globe,
    label: "Countries",
    end: false,
  },
  {
    to: "/cities",
    icon: MapPin,
    label: "Cities",
    end: false,
  },
  {
    to: "/universities",
    icon: GraduationCap,
    label: "Universities",
    end: false,
  },
  {
    to: "/applications",
    icon: ClipboardList,
    label: "Applications",
    end: false,
  },
  {
    to: "/compare",
    icon: GitCompare,
    label: "Compare",
    end: false,
  },
] as const;

function SidebarNav({
  onItemClick,
}: {
  onItemClick?: () => void;
}): React.ReactElement {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {sidebarItems.map((item) => (
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-sidebar border-r border-sidebar-border lg:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
          <img src="/icon.png" alt="" className="h-7 w-7 rounded-lg" />
          <span className="text-lg font-semibold text-sidebar-foreground tracking-tight">
            WannaOut
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>
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
                <img src="/icon.png" alt="" className="h-7 w-7 rounded-lg" />
                <span className="text-lg font-semibold text-sidebar-foreground tracking-tight">
                  WannaOut
                </span>
              </div>
              <div className="py-4">
                <SidebarNav onItemClick={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <img src="/icon.png" alt="" className="h-6 w-6 rounded-md" />
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
