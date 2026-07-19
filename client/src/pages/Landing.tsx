import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import {
  GraduationCap,
  ClipboardList,
  Users,
  Globe,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  FileText,
  TrendingUp,
  Shield,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Landing(): React.ReactElement {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card border border-border shadow-sm p-1">
              <img src="/logo.svg" alt="" className="h-full w-full" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Suhayl</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For agencies</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm rounded-lg"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-foreground/70 hover:text-foreground text-sm"
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="bg-foreground text-background hover:bg-foreground/90 text-sm rounded-lg"
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 to-background dark:from-sky-950/40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08),transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-medium">
                <Sparkles className="mr-1.5 h-3 w-3" />
                Study Abroad Platform
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-foreground leading-[1.1]">
                Your path to
                <br />
                studying abroad,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">
                  simplified.
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
                Discover universities, compare programs, and track every application — all in one beautifully organized platform.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-7 h-12 text-base rounded-xl shadow-lg shadow-primary/20"
                >
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="border-border text-foreground hover:bg-muted h-12 px-7 text-base rounded-xl"
                >
                  Sign in
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Free to use
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  No credit card
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main card */}
                <div className="rounded-2xl bg-card border border-border shadow-2xl shadow-black/10 p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Applications</p>
                      <p className="text-2xl font-bold text-foreground mt-0.5">12 Active</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-3">
                    {[
                      { name: "TU Munich — Computer Science", status: "Under Review", color: "bg-amber-400", pct: "60%" },
                      { name: "ETH Zurich — Data Science", status: "Accepted", color: "bg-emerald-400", pct: "100%" },
                      { name: "TU Delft — Architecture", status: "Documents", color: "bg-primary", pct: "40%" },
                    ].map((app) => (
                      <div key={app.name} className="rounded-xl bg-muted p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-foreground truncate pr-4">{app.name}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{app.status}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div className={`h-full rounded-full ${app.color}`} style={{ width: app.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating card: University */}
                <div className="absolute -top-6 -right-6 rounded-xl bg-card border border-border shadow-lg p-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">20+ Universities</p>
                    <p className="text-xs text-muted-foreground">Across Europe</p>
                  </div>
                </div>

                {/* Floating card: Country */}
                <div className="absolute -bottom-4 -left-6 rounded-xl bg-card border border-border shadow-lg p-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                    <Globe className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">16 Countries</p>
                    <p className="text-xs text-muted-foreground">Explore & compare</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "16", label: "Countries" },
              { value: "20+", label: "Universities" },
              { value: "20+", label: "Programs" },
              { value: "3", label: "User roles" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-muted text-foreground/70 border-border text-xs">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Everything you need to
              <br />
              manage study abroad
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From discovery to enrollment, Suhayl keeps everything organized in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Globe,
                title: "Explore Countries",
                desc: "Browse 16+ countries with detailed info on cities, universities, and living costs.",
                color: "bg-primary/10 text-primary",
              },
              {
                icon: GraduationCap,
                title: "Discover Universities",
                desc: "Find universities with rankings, locations, and detailed program catalogs.",
                color: "bg-violet-500/10 text-violet-500",
              },
              {
                icon: FileText,
                title: "Browse Programs",
                desc: "Filter programs by degree, tuition, deadline, scholarship, and requirements.",
                color: "bg-amber-500/10 text-amber-500",
              },
              {
                icon: ClipboardList,
                title: "Track Applications",
                desc: "Monitor every application from wishlist to enrollment with progress tracking.",
                color: "bg-emerald-500/10 text-emerald-500",
              },
              {
                icon: MapPin,
                title: "City Management",
                desc: "Explore cities within each country — discover where you could be studying.",
                color: "bg-rose-500/10 text-rose-500",
              },
              {
                icon: Users,
                title: "Agency Tools",
                desc: "Agencies can manage students, track their applications, and guide them end-to-end.",
                color: "bg-foreground/10 text-foreground",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-border hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-muted text-foreground/70 border-border text-xs">How it works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Three steps to get started
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Getting started takes less than a minute.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create your account",
                desc: "Sign up as a student or agency. It's free and takes seconds.",
                icon: Sparkles,
              },
              {
                step: "2",
                title: "Explore & apply",
                desc: "Browse universities, compare programs, and start tracking applications.",
                icon: Calendar,
              },
              {
                step: "3",
                title: "Stay organized",
                desc: "Monitor progress, deadlines, and requirements — all in one dashboard.",
                icon: Shield,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">Step {item.step}</span>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-muted text-foreground/70 border-border text-xs">Built for everyone</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              One platform, built for you
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                role: "Student",
                desc: "Discover universities, browse programs, and track your applications from start to finish.",
                features: ["Browse universities & programs", "Track application progress", "Compare programs side by side"],
                color: "border-primary/20 bg-primary/5",
                iconColor: "text-primary",
                icon: GraduationCap,
              },
              {
                role: "Agency",
                desc: "Manage your students' applications, track deadlines, and guide them through the process.",
                features: ["Manage student profiles", "Track all applications", "Monitor progress & deadlines"],
                color: "border-violet-500/20 bg-violet-500/5",
                iconColor: "text-violet-500",
                icon: Users,
              },
            ].map((r) => (
              <div key={r.role} className={`rounded-2xl border p-8 ${r.color}`}>
                <r.icon className={`h-8 w-8 ${r.iconColor} mb-4`} />
                <h3 className="text-xl font-bold text-foreground">{r.role}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                <ul className="mt-6 space-y-3">
                  {r.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground/70">
                      <CheckCircle2 className={`h-4 w-4 ${r.iconColor} flex-shrink-0`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-12 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary blur-3xl" />
              <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-primary blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Ready to start your journey?
              </h2>
              <p className="mt-4 text-lg text-slate-300 max-w-lg mx-auto">
                Join Suhayl today and take the first step toward studying abroad.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base rounded-xl shadow-lg shadow-primary/20"
                >
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border p-1">
              <img src="/logo.svg" alt="" className="h-full w-full" />
            </div>
            <span className="text-lg font-bold text-foreground">Suhayl</span>
          </div>
          <p className="text-sm text-muted-foreground">Your study abroad organizer.</p>
        </div>
      </footer>
    </div>
  );
}
