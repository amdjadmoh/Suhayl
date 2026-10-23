import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { useCountries } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CountryPlate, StatusTag, Wordmark } from "@/components/kit";
import { NightSky } from "@/components/NightSky";
import ThemeToggle from "@/components/ThemeToggle";

/* Static previews of the real UI — illustration, not data. */

function HeroPreview(): React.ReactElement {
  return (
    <div className="relative mx-auto w-full max-w-[30rem]">
      <div className="card rounded-[1.75rem] p-4 shadow-[0_30px_80px_-40px_rgb(41_82_204/0.45)] sm:p-5 sm:pb-14">
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-[13px] text-ink-3">Hi Yasmine</p>
            <p className="text-lg font-bold tracking-[-0.02em]">You have 2 deadlines this month</p>
          </div>
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-ink">YH</span>
        </div>
        <div className="mt-4 grid grid-cols-[1.35fr_1fr] gap-2.5">
          <div className="rounded-2xl bg-brand p-4 text-on-brand">
            <p className="text-xs opacity-80">Due in 14 days</p>
            <p className="mt-1 text-[15px] leading-snug font-bold">MSc Data Science</p>
            <p className="text-xs opacity-80">TU Delft</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
                <span className="block h-full w-3/5 rounded-full bg-white" />
              </span>
              <span className="text-xs font-bold">6/10</span>
            </div>
          </div>
          <div className="card-soft p-4">
            <p className="text-xs text-ink-3">Offers</p>
            <p className="mt-1 text-3xl font-bold tracking-[-0.03em]">2</p>
            <p className="text-xs font-semibold text-moss">Aalto, Uppsala</p>
          </div>
        </div>
        <p className="mt-4 mb-2 px-1 text-sm font-bold">Up next</p>
        <ul className="space-y-2">
          {[
            { c: "Germany", t: "Send certified transcript", s: "TU München · Friday" },
            { c: "Finland", t: "Book a visa appointment", s: "Aalto · next week" },
            { c: "France", t: "Finish statement of purpose", s: "Paris-Saclay · 412 / 800 words" },
          ].map((r) => (
            <li key={r.t} className="flex items-center gap-3 rounded-2xl border border-rule-soft px-3 py-2.5">
              <CountryPlate country={r.c} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{r.t}</span>
                <span className="block truncate text-xs text-ink-3">{r.s}</span>
              </span>
              <span className="size-5 shrink-0 rounded-full border-2 border-input" />
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute -bottom-6 left-6 hidden rounded-2xl border border-rule bg-paper-raised px-4 py-3 shadow-[0_20px_40px_-24px_rgb(0_0_0/0.35)] sm:block">
        <StatusTag status="Accepted" />
        <p className="mt-1.5 text-[13px] font-semibold">Aalto University said yes</p>
      </div>
    </div>
  );
}

function ChecklistPreview(): React.ReactElement {
  const items: [string, boolean][] = [
    ["Passport copy", true],
    ["Bachelor transcript", true],
    ["IELTS · 6.5 or higher", true],
    ["Two recommendation letters", false],
    ["Statement of purpose", false],
  ];
  return (
    <ul className="space-y-2">
      {items.map(([t, done]) => (
        <li key={t} className="flex items-center gap-2.5 text-[13px]">
          <span
            className={
              done
                ? "flex size-5 items-center justify-center rounded-full bg-moss-solid text-white"
                : "size-5 rounded-full border-2 border-input bg-paper-raised"
            }
          >
            {done && <Check className="size-3" strokeWidth={3.5} />}
          </span>
          <span className={done ? "text-ink-3" : "font-semibold text-ink"}>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function DeadlinePreview(): React.ReactElement {
  return (
    <ul className="space-y-2">
      {[
        { d: "04", m: "nov", t: "TU Delft", l: "14 days left", tone: "text-stamp" },
        { d: "15", m: "nov", t: "TU München", l: "25 days left", tone: "text-ochre" },
        { d: "15", m: "jan", t: "Paris-Saclay", l: "86 days left", tone: "text-ink-3" },
      ].map((r) => (
        <li key={r.t} className="flex items-center gap-3 rounded-2xl bg-paper-raised px-3 py-2">
          <span className="flex size-10 flex-col items-center justify-center rounded-xl bg-paper-sunken leading-none">
            <span className="text-sm font-bold">{r.d}</span>
            <span className="text-[10px] font-semibold text-ink-3">{r.m}</span>
          </span>
          <span className="flex-1 text-[13px] font-semibold">{r.t}</span>
          <span className={`text-xs font-semibold ${r.tone}`}>{r.l}</span>
        </li>
      ))}
    </ul>
  );
}

function CostPreview(): React.ReactElement {
  const rows: [string, string][] = [
    ["Tuition", "€3,500"],
    ["Rent and living", "€10,800"],
    ["Blocked account", "€11,208"],
    ["Insurance", "€1,320"],
  ];
  return (
    <div className="rounded-2xl bg-paper-raised p-4">
      {rows.map(([l, v]) => (
        <div key={l} className="flex justify-between py-1 text-[13px]">
          <span className="text-ink-3">{l}</span>
          <span className="font-semibold tnum">{v}</span>
        </div>
      ))}
      <div className="mt-2 flex items-baseline justify-between border-t border-rule pt-2">
        <span className="text-[13px] font-bold">First year</span>
        <span className="text-xl font-bold tracking-[-0.02em] tnum">€26,828</span>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: "A checklist for every application",
    body: "Documents, test scores, letters and fees come straight from what the program asks for. Tick them off as you go.",
    preview: <ChecklistPreview />,
    tint: "bg-moss-soft",
  },
  {
    title: "Deadlines you won't miss",
    body: "Everything sorted by what's due first, red when it's two weeks out, and exportable to your calendar.",
    preview: <DeadlinePreview />,
    tint: "bg-brand-soft",
  },
  {
    title: "The real cost, added up",
    body: "Tuition plus rent, the visa deposit and insurance for that city — so you plan around the actual number.",
    preview: <CostPreview />,
    tint: "bg-ochre-soft",
  },
];

const ROUTE = ["Started", "Documents", "Submitted", "Interview", "Decision", "Visa", "Enrolled"];

export default function Landing(): React.ReactElement {
  const { user } = useAuth();
  const { data: countries } = useCountries();
  const home = user?.role === "agency" ? "/agency" : "/dashboard";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-rule bg-paper-raised/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-[15px]" aria-label="Suhayl">
            <Wordmark />
          </Link>
          <nav className="flex items-center gap-1">
            <a href="#features" className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-ink-3 hover:bg-paper-sunken hover:text-ink md:inline">
              Features
            </a>
            <a href="#agencies" className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-ink-3 hover:bg-paper-sunken hover:text-ink md:inline">
              For agencies
            </a>
            <ThemeToggle />
            {user ? (
              <Button variant="primary" asChild>
                <Link to={home}>Open the app</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button variant="primary" asChild>
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1180px] items-center gap-x-12 gap-y-14 pt-14 pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:pt-20 lg:pb-24">
          <div className="animate-settle">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[13px] font-semibold text-brand-ink">
              Free for students
              {countries?.length ? <span className="text-brand-ink/70">· visa rules for {countries.length} countries</span> : null}
            </span>
            <h1 className="mt-5 text-[44px] leading-[1.02] font-bold tracking-[-0.04em] sm:text-[60px] lg:text-[64px]">
              Study abroad, without the spreadsheet.
            </h1>
            <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-ink-3">
              Keep every program you're weighing, the documents each one wants, and every deadline in one place — and
              always know what to do next.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" asChild>
                <Link to={user ? home : "/register"}>
                  {user ? "Open the app" : "Get started — it's free"}
                  <ArrowRight />
                </Link>
              </Button>
              {!user && (
                <Button variant="ghost" size="lg" asChild>
                  <Link to="/login">I have an account</Link>
                </Button>
              )}
            </div>
          </div>
          <div className="animate-settle [animation-delay:100ms]">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1180px] py-16">
          <h2 className="max-w-xl text-[32px] leading-tight font-bold tracking-[-0.03em] sm:text-[40px]">
            Everything you'd otherwise keep in six tabs and your head.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className={`flex flex-col rounded-3xl p-6 ${f.tint}`}>
                <h3 className="text-lg leading-snug font-bold tracking-[-0.01em]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{f.body}</p>
                <div className="mt-6 flex-1">{f.preview}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              ["Compare side by side", "Up to three programs, with the cheapest and the first deadline pointed out."],
              ["Matches that fit you", "Tell it your budget, GPA and IELTS; get programs ranked by fit and admit chance."],
              ["Letters, collected", "Send each recommender a private link. Their letter lands on your application."],
            ].map(([t, b]) => (
              <div key={t} className="card p-6">
                <h3 className="text-base font-bold">{t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-3">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The route */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="card-soft mx-auto max-w-[1180px] rounded-[2rem] px-6 py-12 sm:px-12">
          <h2 className="text-center text-[26px] font-bold tracking-[-0.02em] sm:text-[30px]">Always know where you are</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-[15px] text-ink-3">
            Every application follows the same seven steps, from the first form to the first lecture.
          </p>
          <ol className="relative mx-auto mt-10 grid max-w-4xl grid-cols-7">
            <span aria-hidden="true" className="absolute top-[13px] right-[7%] left-[7%] h-[3px] rounded-full bg-rule" />
            <span aria-hidden="true" className="absolute top-[13px] left-[7%] h-[3px] w-[45%] rounded-full bg-brand" />
            {ROUTE.map((stop, i) => (
              <li key={stop} className="relative flex flex-col items-center text-center">
                <span
                  className={
                    i < 3
                      ? "relative z-10 flex size-7 items-center justify-center rounded-full bg-brand text-on-brand"
                      : i === 3
                        ? "relative z-10 flex size-7 items-center justify-center rounded-full border-[3px] border-brand bg-paper-raised"
                        : "relative z-10 size-7 rounded-full border-[3px] border-rule bg-paper-raised"
                  }
                >
                  {i < 3 && <Check className="size-3.5" strokeWidth={3} />}
                  {i === 3 && <span className="size-2 rounded-full bg-brand" />}
                </span>
                <span className="mt-3 text-[11px] font-semibold sm:text-sm">{stop}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Agencies */}
      <section id="agencies" className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1180px] items-center gap-x-12 gap-y-8 py-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full bg-paper-sunken px-3 py-1 text-[13px] font-semibold text-ink-2">
              For agencies and counsellors
            </span>
            <h2 className="mt-4 text-[32px] leading-tight font-bold tracking-[-0.03em] sm:text-[40px]">
              Helping a dozen students at once?
            </h2>
            <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-ink-3">
              Each student gets a file with their applications, deadlines and decisions. The next two months of
              deadlines — across everyone — are on the first page you see. Import the list you already keep as a CSV,
              and export everything for your own reports.
            </p>
            <Button variant="outline" size="lg" className="mt-6" asChild>
              <Link to="/register">Create an agency account</Link>
            </Button>
          </div>
          <div className="card divide-y divide-rule-soft overflow-hidden">
            {[
              { n: "Ahmed Hassan", a: "3 applications", s: "Applied" },
              { n: "Sarah Miller", a: "5 applications", s: "Preparing" },
              { n: "Lina Benali", a: "2 applications", s: "Accepted" },
            ].map((r) => (
              <div key={r.n} className="flex items-center gap-3 px-5 py-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-paper-sunken text-[13px] font-bold text-ink-2">
                  {r.n
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{r.n}</span>
                  <span className="block text-[13px] text-ink-3">{r.a}</span>
                </span>
                <StatusTag status={r.s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The name */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[2rem] bg-night text-night-ink">
          <NightSky className="absolute inset-0" seed={21} starCount={160} />
          <div className="relative flex min-h-[24rem] flex-col justify-end p-8 sm:p-12">
            <p lang="ar" dir="rtl" className="w-fit text-4xl font-bold text-starlight">
              سهيل
            </p>
            <h2 className="mt-4 max-w-2xl text-[24px] leading-snug font-bold tracking-[-0.02em] sm:text-[30px]">
              Suhayl is Canopus — the bright star low in the southern sky that desert travellers watched for to keep their
              bearings.
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-night-ink-2">
              Leaving home to study is its own long crossing. We thought the name fit.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-[30px] font-bold tracking-[-0.03em] sm:text-[36px]">Ready when you are.</h2>
        <p className="mt-2 text-[15px] text-ink-3">It takes a minute to set up, and it's free.</p>
        <Button variant="primary" size="lg" className="mt-6" asChild>
          <Link to={user ? home : "/register"}>
            {user ? "Open the app" : "Get started"}
            <ArrowRight />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-rule px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 py-8">
          <Wordmark className="text-[14px]" />
          <div className="flex items-center gap-5 text-sm text-ink-3">
            {user ? (
              <Link to={home} className="hover:text-ink">
                Open the app
              </Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-ink">
                  Sign in
                </Link>
                <Link to="/register" className="hover:text-ink">
                  Create account
                </Link>
              </>
            )}
            <Link to="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-ink">
              Terms
            </Link>
            <span className="text-xs text-ink-4">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
