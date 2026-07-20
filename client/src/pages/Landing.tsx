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
  FileText,
  Shield,
  LayoutDashboard,
  BookOpen,
  GitCompare,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stagger = (i: number): React.CSSProperties => ({
  animationDelay: `${i * 90}ms`,
});

export default function Landing(): React.ReactElement {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan-500 shadow-md shadow-primary/25 p-[5px]">
              <img src="/logo.svg" alt="" className="h-full w-full" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Suhayl
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#roles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">For agencies</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate("/dashboard")} className="rounded-xl">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign in
                </Button>
                <Button onClick={() => navigate("/register")} className="rounded-xl">
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-24">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary animate-fade-up"
            >
              <Sparkles className="h-3.5 w-3.5" />
              The study abroad organizer
            </div>
            <h1
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05] animate-fade-up"
              style={stagger(1)}
            >
              Your path to
              <br />
              studying abroad,{" "}
              <span className="text-gradient">simplified.</span>
            </h1>
            <p
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground animate-fade-up"
              style={stagger(2)}
            >
              Discover universities, compare programs, and track every
              application — all in one beautifully organized platform.
            </p>
            <div
              className="mt-9 flex flex-wrap items-center justify-center gap-4 animate-fade-up"
              style={stagger(3)}
            >
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="h-12 rounded-xl px-8 text-base shadow-lg shadow-primary/30"
              >
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
                className="h-12 rounded-xl px-8 text-base"
              >
                Sign in
              </Button>
            </div>
            <div
              className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-up"
              style={stagger(4)}
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Free to use
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No credit card
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Set up in seconds
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div
            className="relative mx-auto mt-16 max-w-4xl animate-scale-in"
            style={stagger(5)}
          >
            <div className="absolute -inset-x-8 -top-8 bottom-0 rounded-[2rem] bg-gradient-to-b from-primary/15 to-transparent blur-2xl" />
            <div className="relative rounded-2xl border border-border bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur-sm p-6 sm:p-8">
              {/* Mock window chrome */}
              <div className="mb-6 flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-medium text-muted-foreground">
                  Suhayl — Dashboard
                </span>
              </div>

              {/* Mock stat row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Active applications", value: "12", icon: ClipboardList, tint: "bg-primary/10 text-primary" },
                  { label: "Universities tracked", value: "20+", icon: GraduationCap, tint: "bg-violet-500/10 text-violet-500" },
                  { label: "Days to deadline", value: "23", icon: MapPin, tint: "bg-amber-500/10 text-amber-500" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-muted/40 p-4">
                    <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${s.tint}`}>
                      <s.icon className="h-4.5 w-4.5" />
                    </div>
                    <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Mock applications */}
              <div className="mt-4 space-y-3">
                {[
                  { name: "TU Munich — Computer Science", status: "Under Review", color: "bg-amber-400", pct: "60%" },
                  { name: "ETH Zurich — Data Science", status: "Accepted", color: "bg-emerald-400", pct: "100%" },
                  { name: "TU Delft — Architecture", status: "Documents", color: "bg-primary", pct: "40%" },
                ].map((app) => (
                  <div key={app.name} className="rounded-xl border border-border bg-muted/40 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="truncate pr-4 text-sm font-medium text-foreground">{app.name}</p>
                      <span className="whitespace-nowrap text-xs text-muted-foreground">{app.status}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border">
                      <div className={`h-full rounded-full ${app.color}`} style={{ width: app.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating chips */}
            <div className="absolute -left-4 sm:-left-10 top-16 hidden sm:flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xl shadow-black/5 animate-float">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Offer received</p>
                <p className="text-xs text-muted-foreground">ETH Zurich</p>
              </div>
            </div>
            <div className="absolute -right-4 sm:-right-10 bottom-16 hidden sm:flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xl shadow-black/5 animate-float-slow">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">16 countries</p>
                <p className="text-xs text-muted-foreground">to explore</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "16", label: "Countries covered" },
              { value: "20+", label: "Universities listed" },
              { value: "20+", label: "Programs to browse" },
              { value: "3", label: "Roles supported" },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center animate-fade-up" style={stagger(i)}>
                <p className="font-display text-4xl font-extrabold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Features
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Everything you need to manage study abroad
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From discovery to enrollment, Suhayl keeps everything organized
              in one place.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Globe,
                title: "Explore Countries",
                desc: "Browse 16+ countries with detailed info on cities, universities, and living costs.",
                tint: "from-primary to-cyan-500",
              },
              {
                icon: GraduationCap,
                title: "Discover Universities",
                desc: "Find universities with QS, THE and ARWU rankings, locations, and program catalogs.",
                tint: "from-violet-500 to-purple-600",
              },
              {
                icon: BookOpen,
                title: "Browse Programs",
                desc: "Filter by degree, tuition, deadline, scholarships, GPA and language requirements.",
                tint: "from-amber-500 to-orange-600",
              },
              {
                icon: ClipboardList,
                title: "Track Applications",
                desc: "Monitor every application from wishlist to enrollment with progress tracking.",
                tint: "from-emerald-500 to-teal-600",
              },
              {
                icon: GitCompare,
                title: "Compare & Match",
                desc: "Put programs side by side and get smart matches based on your profile.",
                tint: "from-rose-500 to-pink-600",
              },
              {
                icon: Calculator,
                title: "Budget & Documents",
                desc: "Estimate total costs, write statements, and manage recommendation letters.",
                tint: "from-indigo-500 to-blue-600",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 card-hover animate-fade-up"
                style={stagger(i)}
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.tint} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-y border-border bg-muted/40 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Three steps to get started
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Getting started takes less than a minute.
            </p>
          </div>

          <div className="relative grid gap-10 md:grid-cols-3">
            {/* Connector line */}
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />
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
                icon: MapPin,
              },
              {
                step: "3",
                title: "Stay organized",
                desc: "Monitor progress, deadlines, and requirements — all in one dashboard.",
                icon: Shield,
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center animate-fade-up" style={stagger(i)}>
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-card shadow-lg shadow-primary/10">
                  <item.icon className="h-7 w-7 text-primary" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan-500 text-xs font-bold text-white shadow-md shadow-primary/30">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Built for everyone
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              One platform, built for you
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                role: "Student",
                desc: "Discover universities, browse programs, and track your applications from start to finish.",
                features: ["Browse universities & programs", "Track application progress", "Compare programs side by side"],
                tint: "from-primary to-cyan-500",
                ring: "border-primary/25",
                icon: GraduationCap,
              },
              {
                role: "Agency",
                desc: "Manage your students' applications, track deadlines, and guide them through the process.",
                features: ["Manage student profiles", "Track all applications", "Monitor progress & deadlines"],
                tint: "from-violet-500 to-purple-600",
                ring: "border-violet-500/25",
                icon: Users,
              },
            ].map((r, i) => (
              <div
                key={r.role}
                className={`rounded-2xl border ${r.ring} bg-card p-8 card-hover animate-fade-up`}
                style={stagger(i)}
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${r.tint} shadow-lg`}>
                  <r.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{r.role}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
                <ul className="mt-6 space-y-3">
                  {r.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
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
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 text-center sm:p-16">
            <div className="absolute inset-0 bg-mesh" />
            <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
            <div className="relative">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan-500 shadow-lg shadow-primary/30">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                Ready to start your journey?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
                Join Suhayl today and take the first step toward studying
                abroad.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="h-12 rounded-xl px-8 text-base shadow-lg shadow-primary/30"
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
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-cyan-500 p-1">
              <img src="/logo.svg" alt="" className="h-full w-full" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">Suhayl</span>
          </div>
          <p className="text-sm text-muted-foreground">Your study abroad organizer.</p>
        </div>
      </footer>
    </div>
  );
}
