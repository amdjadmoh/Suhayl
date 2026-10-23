import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText } from "lucide-react";
import { useAgencyApplications, useStudents } from "@/lib/api";
import { useAgencyDocuments } from "@/lib/api-documents";
import { useAuth } from "@/lib/authContext";
import { formatMoney, greeting, plural, timeAgo } from "@/lib/format";
import { exportAgencyApplicationsCsv } from "@/lib/downloads";
import { summarise, type StudentSummary } from "@/lib/agencyInsights";
import { useTeam } from "@/lib/api-team";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DaysLeft, EmptyState, ErrorState, LoadingRows, PageHeader, Section } from "@/components/kit";
import { ApplicationList, Shortcuts, StatusBreakdown } from "@/components/ledger";
import { countByStatus, upcomingDeadlines } from "@/lib/applications";

function urgency(s: StudentSummary): number {
  if (s.missed.length) return 0;
  if (s.dueThisWeek.length) return 1;
  if (s.tasksDue.length) return 2;
  if (s.docsToCheck || s.docsLate) return 3;
  return 4;
}

function Figure({ label, value, to, tone }: { label: string; value: string | number; to?: string; tone?: "alert" }): React.ReactElement {
  const body = (
    <>
      <span className="text-[13px] font-medium text-ink-3">{label}</span>
      <span className={`mt-1 block text-[28px] leading-none font-bold tracking-[-0.02em] tnum ${tone === "alert" ? "text-stamp" : "text-ink"}`}>{value}</span>
    </>
  );
  return to ? (
    <Link to={to} className="card-soft block p-4 transition-colors hover:bg-paper-hover">
      {body}
    </Link>
  ) : (
    <div className="card-soft p-4">{body}</div>
  );
}

export default function AgencyDashboard(): React.ReactElement {
  const { user } = useAuth();
  const { data: applications, isLoading: appsLoading, isError } = useAgencyApplications();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: documents } = useAgencyDocuments();

  const { data: team } = useTeam();
  const hasTeam = (team?.members.length ?? 0) > 1;
  const [scope, setScope] = useState<"mine" | "all">(user?.agencyRole === "counsellor" ? "mine" : "all");
  const mineOnly = hasTeam && scope === "mine";

  const apps = useMemo(() => applications ?? [], [applications]);
  const allSummaries = useMemo(() => summarise(students ?? [], apps, documents ?? []), [students, apps, documents]);
  // "Mine" is the students assigned to the signed-in counsellor, same as on the students list
  const summaries = useMemo(
    () => (mineOnly ? allSummaries.filter((s) => s.student.counsellorId === user?._id) : allSummaries),
    [allSummaries, mineOnly, user],
  );

  if (isError) {
    return <ErrorState title="Your agency's files didn't load">Try refreshing the page in a moment.</ErrorState>;
  }

  const isLoading = appsLoading || studentsLoading;
  const studentCount = students?.length ?? 0;
  const inScope = new Set(summaries.map((s) => s.student._id));
  const docStudent = (d: { studentId: string | { _id: string } }): string => (typeof d.studentId === "object" ? d.studentId._id : d.studentId);
  const scopedApps = mineOnly ? summaries.flatMap((s) => s.apps) : apps;
  const scopedDocs = (documents ?? []).filter((d) => !mineOnly || inScope.has(docStudent(d)));
  const upcoming = upcomingDeadlines(scopedApps, 14).filter((a) => a.applicationStatus === "Preparing");
  const counts = countByStatus(apps);
  const decisionsPending = (counts.Applied ?? 0) + (counts.Waitlisted ?? 0);
  const toCheck = scopedDocs.filter((d) => d.status === "uploaded");
  const owed = scopedDocs.filter((d) => d.status === "requested" || d.status === "rejected").length;
  const needs = summaries.filter((s) => s.attention.length).sort((a, b) => urgency(a) - urgency(b) || a.student.name.localeCompare(b.student.name));
  const balanceTotal = summaries.reduce((sum, s) => sum + (s.balance ?? 0), 0);
  const currency = students?.find((s) => s.feeCurrency)?.feeCurrency ?? "DZD";

  return (
    <>
      <PageHeader
        kicker="Agency desk"
        title={`${greeting()}, ${user?.name ?? "there"}`}
        actions={
          <>
            <Button variant="outline" onClick={exportAgencyApplicationsCsv}>
              Export CSV
            </Button>
            <Button variant="primary" asChild>
              <Link to="/agency/students">Add a student</Link>
            </Button>
          </>
        }
      >
        {isLoading ? (
          <span className="text-ink-4">Opening the files…</span>
        ) : studentCount === 0 ? (
          <>No students on file yet. Add them one by one, or import a spreadsheet if you already keep a list.</>
        ) : (
          <>
            {mineOnly
              ? <>You look after {plural(summaries.length, "student")} with {plural(scopedApps.length, "application")} between them.</>
              : <>
                  You're looking after {plural(studentCount, "student")} with {plural(apps.length, "application")} between
                  them{decisionsPending > 0 && <>, {decisionsPending} still waiting on a decision</>}.
                </>}
          </>
        )}
      </PageHeader>

      {hasTeam && (
        <div className="mb-4 inline-flex rounded-full bg-paper-sunken p-1 text-[13px] font-semibold" role="group" aria-label="Whose students">
          {(["mine", "all"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={scope === v}
              onClick={() => setScope(v)}
              className={cn("rounded-full px-3.5 py-1.5 transition-colors", scope === v ? "bg-paper-raised text-ink shadow-[0_1px_3px_rgb(0_0_0/0.1)]" : "text-ink-3 hover:text-ink")}
            >
              {v === "mine" ? "My students" : "Whole agency"}
            </button>
          ))}
        </div>
      )}

      {!isLoading && studentCount > 0 && (
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Figure label="Need you" value={needs.length} to={mineOnly && user ? `/agency/students?show=attention&counsellor=${user._id}` : "/agency/students?show=attention&counsellor=all"} tone={needs.length ? "alert" : undefined} />
          <Figure label="Deadlines, 14 days" value={upcoming.length} to="/applications?when=soon" />
          <Figure label="Documents to check" value={toCheck.length} />
          <Figure label="Balances owed" value={balanceTotal ? formatMoney(balanceTotal, currency) : "—"} to="/agency/students?show=owes" />
        </div>
      )}

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
        <div className="min-w-0 space-y-10">
          <Section
            title="Needs you today"
            count={isLoading ? undefined : needs.length}
            action={
              needs.length > 8 && (
                <Link to="/agency/students?show=attention" className="link-ink text-[13px]">
                  See all {needs.length}
                </Link>
              )
            }
          >
            {isLoading ? (
              <LoadingRows rows={4} />
            ) : needs.length === 0 ? (
              <p className="card-soft px-5 py-5 text-sm text-ink-3">
                Nobody is waiting on you. No missed deadlines, follow-ups due or documents to check.
              </p>
            ) : (
              <ul className="card divide-y divide-rule-soft overflow-hidden">
                {needs.slice(0, 8).map((s) => (
                  <li key={s.student._id}>
                    <Link to={`/agency/students/${s.student._id}`} className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-paper-hover">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-ink group-hover:text-brand-ink">{s.student.name}</span>
                        <span className="block truncate text-[13px] font-medium text-stamp">{s.attention.join(" · ")}</span>
                        {s.tasksDue[0] && <span className="block truncate text-[13px] text-ink-3">To do: {s.tasksDue[0].text}</span>}
                      </span>
                      {s.nextDeadline && <DaysLeft date={s.nextDeadline.applicationDeadline} short />}
                      <ChevronRight className="size-4 text-ink-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {(toCheck.length > 0 || owed > 0) && (
            <Section title="Documents to check" count={toCheck.length}>
              {owed > 0 && <p className="-mt-1 mb-3 px-1 text-[13px] text-ink-3">Families still owe you {plural(owed, "document")}.</p>}
              {toCheck.length === 0 ? (
                <p className="card-soft px-5 py-5 text-sm text-ink-3">Nothing new from families yet.</p>
              ) : (
                <ul className="card divide-y divide-rule-soft overflow-hidden">
                  {toCheck.slice(0, 6).map((d) => {
                    const st = typeof d.studentId === "object" ? d.studentId : null;
                    return (
                      <li key={d._id}>
                        <Link
                          to={st ? `/agency/students/${st._id}` : "/agency/students"}
                          className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-paper-hover"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                            <FileText className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold text-ink group-hover:text-brand-ink">{d.title}</span>
                            <span className="block truncate text-[13px] text-ink-3">
                              {st?.name ?? "A student"} · sent {d.file ? timeAgo(d.file.uploadedAt) : timeAgo(d.updatedAt)}
                            </span>
                          </span>
                          <ChevronRight className="size-4 text-ink-4" />
                        </Link>
                      </li>
                    );
                  })}
                  {toCheck.length > 6 && (
                    <li className="px-5 py-3 text-[13px] text-ink-3">and {toCheck.length - 6} more on the students' files</li>
                  )}
                </ul>
              )}
            </Section>
          )}

          <Section
            title="Files still open, due in 14 days"
            count={isLoading ? undefined : upcoming.length}
            action={
              upcoming.length > 6 && (
                <Link to="/applications?when=soon" className="link-ink text-[13px]">
                  See all {upcoming.length}
                </Link>
              )
            }
          >
            {isLoading ? (
              <LoadingRows rows={3} />
            ) : upcoming.length === 0 ? (
              <p className="card-soft px-5 py-5 text-sm text-ink-3">No file still being prepared is due in the next two weeks.</p>
            ) : (
              <ApplicationList applications={upcoming.slice(0, 6)} showStudent />
            )}
          </Section>

          {!isLoading && apps.length === 0 && (
            <EmptyState
              title="No applications yet"
              action={
                <Button variant="primary" asChild>
                  <Link to="/agency/students">Go to students</Link>
                </Button>
              }
            >
              Open a student's file and start an application for them. Their deadlines will show up here.
            </EmptyState>
          )}
        </div>

        <aside className="space-y-8">
          {!isLoading && apps.length > 0 && (
            <div>
              <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">Across all students</p>
              <StatusBreakdown counts={counts} />
            </div>
          )}
          <div>
            <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">Shortcuts</p>
            <Shortcuts
              items={[
                { label: "Student files", hint: plural(studentCount, "student"), to: "/agency/students" },
                { label: "Start an application", to: "/applications/new" },
                { label: "Browse programs", to: "/programs" },
                { label: "Export everything", hint: "CSV for your own reports", onClick: exportAgencyApplicationsCsv },
              ]}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
