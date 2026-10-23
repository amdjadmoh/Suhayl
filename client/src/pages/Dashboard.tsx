import { Link } from "react-router-dom";
import { ArrowRight, CalendarPlus, UserRound } from "lucide-react";
import { useAdminStats, useApplications, usePreferences } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { useCompare } from "@/lib/compareContext";
import type { Application } from "@/types/application";
import { daysUntil, formatDate, plural } from "@/lib/format";
import { downloadDeadlinesCalendar } from "@/lib/downloads";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, LoadingRows, PageHeader, Section } from "@/components/kit";
import { ApplicationList, Figures, Shortcuts, StatusBreakdown } from "@/components/ledger";
import { appProgram, appUniversity, countByStatus, missedDeadlines, upcomingDeadlines } from "@/lib/applications";
import { ExtensionCTA } from "@/components/ExtensionCTA";
import AgencyDashboard from "@/pages/AgencyDashboard";

/* ---------- Student ---------- */

/** One short line that says what matters most right now. */
function headline(applications: Application[]): string {
  if (applications.length === 0) return "Let's find your first program";
  const thisMonth = upcomingDeadlines(applications, 30).length;
  if (thisMonth > 0) return `You have ${plural(thisMonth, "deadline")} this month`;
  const counts = countByStatus(applications);
  const offers = counts.Accepted + counts.Enrolled;
  if (offers > 0) return `${plural(offers, "offer")} in hand — nice work`;
  return `${plural(applications.length, "application")} on the go`;
}

/** Asks a new student for the numbers Matches and the program filters run on. */
function ProfileNudge(): React.ReactElement | null {
  const { data: prefs, isLoading } = usePreferences();
  if (isLoading || !prefs || prefs.gpa != null || prefs.ieltsScore != null || prefs.preferredMonthlyBudget != null) return null;
  return (
    <div className="rounded-[1.25rem] bg-brand-soft p-5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-paper-raised text-brand-ink">
        <UserRound className="size-[18px]" />
      </span>
      <p className="mt-3 text-[15px] font-bold text-ink">Add your grades and budget</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
        Your GPA, IELTS and monthly budget let Matches rank programs for you and flag the ones you don't qualify for yet.
      </p>
      <Button variant="primary" size="sm" className="mt-4" asChild>
        <Link to="/settings#profile">Add my profile</Link>
      </Button>
    </div>
  );
}

/** The big blue card: the next thing that's due. */
function NextUpCard({ next, hasApplications }: { next?: Application; hasApplications: boolean }): React.ReactElement {
  if (!next) {
    return (
      <div className="flex flex-col justify-between rounded-3xl bg-brand p-6 text-on-brand">
        <div>
          <p className="text-sm font-medium opacity-80">Next deadline</p>
          <p className="mt-2 text-xl leading-snug font-bold">Nothing due soon</p>
          <p className="mt-1 text-sm opacity-80">
            {hasApplications
              ? "None of your applications are due in the next three months."
              : "Add a program you like and its deadline shows up here."}
          </p>
        </div>
        <Link
          to="/programs"
          className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/25"
        >
          Browse programs <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }
  const days = daysUntil(next.applicationDeadline) ?? 0;
  const prog = appProgram(next);
  const uni = appUniversity(next);
  return (
    <Link
      to={`/applications/${next._id}`}
      className="group flex flex-col justify-between rounded-3xl bg-brand p-6 text-on-brand transition-transform hover:-translate-y-0.5"
    >
      <div>
        <p className="text-sm font-medium opacity-80">
          {days <= 0 ? "Due today" : `Due in ${plural(days, "day")}`} · {formatDate(next.applicationDeadline)}
        </p>
        <p className="mt-2 text-xl leading-snug font-bold">{prog?.name ?? "Your next application"}</p>
        {uni && (
          <p className="mt-0.5 text-sm opacity-80">
            {uni.name}, {uni.city}
          </p>
        )}
      </div>
      <span className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold transition-colors group-hover:bg-white/25">
        Open checklist <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}

function StatTile({ label, value, note, tone }: { label: string; value: number; note?: string; tone?: "moss" }): React.ReactElement {
  return (
    <div className="card-soft flex flex-col justify-between p-5 sm:p-6">
      <p className="text-sm font-medium text-ink-3">{label}</p>
      <div>
        <p className="mt-3 text-[34px] leading-none sm:text-[40px] font-bold tracking-[-0.03em] text-ink tnum">{value}</p>
        {note && <p className={tone === "moss" ? "mt-2 text-[13px] font-semibold text-moss" : "mt-2 text-[13px] text-ink-3"}>{note}</p>}
      </div>
    </div>
  );
}

function StudentDashboard(): React.ReactElement {
  const { data, isLoading } = useApplications();
  const { user } = useAuth();
  const { compareIds } = useCompare();

  const applications = data?.applications ?? [];
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const upcoming = upcomingDeadlines(applications, 90);
  const missed = missedDeadlines(applications);
  const counts = countByStatus(applications);
  const offers = counts.Accepted + counts.Enrolled;
  const inProgress = counts.Preparing + counts.Applied + counts.Waitlisted;
  const countries = new Set(applications.map((a) => appUniversity(a)?.country).filter(Boolean)).size;
  const recent = applications
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <>
      <PageHeader
        kicker={`Hi ${firstName}`}
        title={isLoading ? "Loading your applications…" : headline(applications)}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/programs">Find programs</Link>
            </Button>
            <Button variant="primary" asChild>
              <Link to="/applications/new">New application</Link>
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-[1.25rem]" />
          <Skeleton className="h-48 rounded-[1.25rem]" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <NextUpCard next={upcoming[0]} hasApplications={applications.length > 0} />
          </div>
          <StatTile
            label="Offers"
            value={offers}
            note={counts.Enrolled ? `${counts.Enrolled} enrolled` : offers ? "Waiting on your visa" : "None yet — keep going"}
            tone={offers ? "moss" : undefined}
          />
          <StatTile
            label="In progress"
            value={inProgress}
            note={countries ? `Across ${plural(countries, "country", "countries")}` : "Nothing started yet"}
          />
        </div>
      )}

      <div className="mt-10 grid gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-10">
          <Section
            title="Coming up"
            count={isLoading ? undefined : upcoming.length}
            action={
              upcoming.length > 0 && (
                <Button variant="ghost" size="sm" onClick={downloadDeadlinesCalendar}>
                  <CalendarPlus />
                  Add to calendar
                </Button>
              )
            }
          >
            {isLoading ? (
              <LoadingRows rows={3} />
            ) : upcoming.length === 0 ? (
              <div className="card-soft px-5 py-6 text-sm text-ink-3">No deadlines in the next three months.</div>
            ) : (
              <ApplicationList applications={upcoming} />
            )}
          </Section>

          {missed.length > 0 && (
            <Section title="Past the deadline" count={missed.length}>
              <p className="-mt-1 mb-3 px-1 text-[13px] text-ink-3">
                Still marked as preparing. Check whether there's a later intake and update the date, or mark them submitted if
                you sent them.
              </p>
              <ApplicationList applications={missed} />
            </Section>
          )}

          <Section
            title="Recently added"
            action={
              applications.length > 0 && (
                <Link to="/applications" className="link-ink">
                  See all
                </Link>
              )
            }
          >
            {isLoading ? (
              <LoadingRows rows={3} />
            ) : recent.length === 0 ? (
              <EmptyState
                title="Start your first application"
                action={
                  <Button variant="primary" asChild>
                    <Link to="/programs">Browse programs</Link>
                  </Button>
                }
              >
                Pick a program and press “Start an application”. Its documents, tests and deadline come along with it.
              </EmptyState>
            ) : (
              <ApplicationList applications={recent} dateMode="added" />
            )}
          </Section>
        </div>

        <aside className="space-y-8">
          <ProfileNudge />
          {!isLoading && applications.length > 0 && (
            <Section title="Where things stand">
              <StatusBreakdown counts={counts} />
            </Section>
          )}
          <Section title="Shortcuts">
            <Shortcuts
              items={[
                {
                  label: "Compare programs",
                  hint: compareIds.length ? `${plural(compareIds.length, "program")} picked` : "Up to three, side by side",
                  to: "/compare",
                },
                { label: "Find matches", hint: "From your budget, GPA and IELTS", to: "/matches" },
                { label: "Estimate costs", hint: "Tuition, rent, visa, insurance", to: "/budget-calculator" },
                { label: "Visa rules by country", hint: "Blocked accounts, processing times", to: "/countries" },
              ]}
            />
          </Section>
          <ExtensionCTA variant="card" />
        </aside>
      </div>
    </>
  );
}

/* ---------- Admin ---------- */

function AdminDashboard(): React.ReactElement {
  const { data: stats, isLoading, isError, error } = useAdminStats();

  if (isError) {
    return (
      <ErrorState title="Platform numbers are unavailable">
        {error instanceof Error ? error.message : "Unknown error"}
      </ErrorState>
    );
  }

  const roleCounts = stats?.byRole ?? [];
  const totalUsers = stats?.totalUsers || 1;

  return (
    <>
      <PageHeader
        kicker="Admin"
        title="Your catalogue at a glance"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/users">Manage users</Link>
            </Button>
            <Button variant="primary" asChild>
              <Link to="/universities/new">Add university</Link>
            </Button>
          </>
        }
      >
        Everything students can browse comes from here. Entries people add for themselves stay private until you make
        them official.
      </PageHeader>

      {isLoading ? (
        <LoadingRows rows={2} />
      ) : (
        <Figures
          items={[
            { label: "Universities", value: stats?.totalUniversities ?? 0 },
            { label: "Programs", value: stats?.totalPrograms ?? 0 },
            { label: "Countries", value: stats?.totalCountries ?? 0 },
            { label: "Cities", value: stats?.totalCities ?? 0 },
            { label: "Accounts", value: stats?.totalUsers ?? 0 },
            { label: "Agencies", value: stats?.totalAgencies ?? 0 },
            { label: "Students on agencies", value: stats?.totalStudentsManaged ?? 0 },
            { label: "Student accounts", value: stats?.totalStudents ?? 0 },
          ]}
        />
      )}

      <div className="mt-10 grid gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Section title="Who signs in">
          {isLoading ? (
            <LoadingRows rows={3} />
          ) : roleCounts.length === 0 ? (
            <div className="card-soft px-5 py-6 text-sm text-ink-3">No accounts yet.</div>
          ) : (
            <ul className="card divide-y divide-rule-soft px-5">
              {roleCounts.map((r) => {
                const pct = Math.round((r.count / totalUsers) * 100);
                return (
                  <li key={r.role} className="grid grid-cols-[6rem_minmax(0,1fr)_5rem] items-center gap-4 py-4">
                    <span className="text-sm font-semibold text-ink capitalize">{r.role}</span>
                    <span className="h-2.5 overflow-hidden rounded-full bg-paper-sunken">
                      <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="text-right text-[13px] font-medium text-ink-3 tnum">
                      {r.count} · {pct}%
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <aside className="space-y-8">
          <Section title="Catalogue">
            <Shortcuts
              items={[
                { label: "Countries and visa rules", to: "/countries" },
                { label: "Cities and living costs", to: "/cities" },
                { label: "Review custom programs", hint: "Make them official", to: "/programs?customOnly=true" },
                { label: "Review custom universities", to: "/universities?customOnly=true" },
              ]}
            />
          </Section>
          <ExtensionCTA variant="card" />
        </aside>
      </div>
    </>
  );
}

export default function Dashboard(): React.ReactElement {
  const { user } = useAuth();

  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "agency") return <AgencyDashboard />;
  return <StudentDashboard />;
}
