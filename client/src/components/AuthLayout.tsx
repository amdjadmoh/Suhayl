import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const HIGHLIGHTS = [
  "Track every application in one place",
  "Compare programs side by side",
  "Never miss a deadline again",
];

/**
 * Split-screen layout for auth pages: form on the left,
 * branded visual panel on the right (hidden on small screens).
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left: form */}
      <div className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-[45%] lg:px-16">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan-500 shadow-md shadow-primary/25 p-[5px]">
              <img src="/logo.svg" alt="Suhayl" className="h-full w-full" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Suhayl
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>

        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-sm animate-fade-up">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          </div>
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
        <div className="absolute inset-0 bg-mesh opacity-80" />
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_40%,black,transparent)]" />

        <div className="relative flex h-full flex-col justify-center px-14 xl:px-20">
          <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              The study abroad organizer
            </div>
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
              Your journey abroad
              <br />
              <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                starts here.
              </span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-300">
              Join students and agencies organizing applications, deadlines,
              and documents — all in one place.
            </p>
            <ul className="mt-8 space-y-3.5">
              {HIGHLIGHTS.map((h, i) => (
                <li
                  key={h}
                  className="flex items-center gap-3 text-sm text-slate-200 animate-fade-up"
                  style={{ animationDelay: `${250 + i * 100}ms` }}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Floating stat card */}
          <div
            className="mt-12 flex max-w-md items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm animate-float"
          >
            <div className="grid flex-1 grid-cols-3 gap-4 text-center">
              {[
                { v: "16", l: "Countries" },
                { v: "20+", l: "Universities" },
                { v: "20+", l: "Programs" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-2xl font-bold text-white">{s.v}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
