import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useApplications } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import type { ApplicationStatus } from "@/lib/constants";
import { daysUntil, plural } from "@/lib/format";
import { downloadDeadlinesCalendar } from "@/lib/downloads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ErrorState, FilterTabs, LoadingRows, PageHeader } from "@/components/kit";
import { ApplicationList } from "@/components/ledger";
import { appProgram, appUniversity, countByStatus } from "@/lib/applications";

// The order an application usually moves through
const JOURNEY: ApplicationStatus[] = ["Preparing", "Applied", "Waitlisted", "Accepted", "Enrolled", "Rejected"];

type Filter = "all" | ApplicationStatus;
// When an application still being prepared is due
type When = "any" | "missed" | "soon" | "later";

const PAGE = 50;

export default function ApplicationsTracker(): React.ReactElement {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useApplications();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  // The dashboard links here with ?when=soon
  const [when, setWhen] = useState<When>(() => {
    const w = searchParams.get("when");
    return w === "missed" || w === "soon" || w === "later" ? w : "any";
  });
  const [shown, setShown] = useState(PAGE);

  const applications = useMemo(() => data?.applications ?? [], [data]);
  const isAgency = user?.role === "agency";
  const canAdd = user?.role === "student" || isAgency;
  const counts = countByStatus(applications);
  const countries = useMemo(
    () => [...new Set(applications.map((a) => appUniversity(a)?.country).filter((c): c is string => !!c))].sort(),
    [applications],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications
      .filter((a) => filter === "all" || a.applicationStatus === filter)
      .filter((a) => country === "all" || appUniversity(a)?.country === country)
      .filter((a) => {
        if (when === "any") return true;
        if (a.applicationStatus !== "Preparing") return false;
        const d = daysUntil(a.applicationDeadline);
        if (d === null) return when === "later";
        return when === "missed" ? d < 0 : when === "soon" ? d >= 0 && d <= 14 : d > 14;
      })
      .filter((a) => {
        if (!q) return true;
        const hay = [appProgram(a)?.name, appUniversity(a)?.name, appUniversity(a)?.country, a.studentName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        // Files still being worked on come first, decided ones last
        const group = (x: typeof a): number =>
          x.applicationStatus === "Preparing" ? 0 : x.applicationStatus === "Applied" || x.applicationStatus === "Waitlisted" ? 1 : 2;
        if (group(a) !== group(b)) return group(a) - group(b);
        // Then soonest deadline first; undated applications sink to the bottom
        const ta = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : Infinity;
        const tb = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : Infinity;
        return ta - tb;
      });
  }, [applications, filter, query, country, when]);

  if (isError) {
    return (
      <ErrorState title="Your applications didn't load">
        {error instanceof Error ? error.message : "Unknown error"}
      </ErrorState>
    );
  }

  return (
    <>
      <PageHeader
        kicker={isLoading ? "Applications" : `Applications · ${applications.length} on file`}
        title={isAgency ? "Applications" : "Your applications"}
        actions={
          <>
            <Button variant="outline" onClick={downloadDeadlinesCalendar}>
              Add deadlines to calendar
            </Button>
            {canAdd && (
              <Button variant="primary" asChild>
                <Link to="/applications/new">New application</Link>
              </Button>
            )}
          </>
        }
      >
        Files still being prepared come first, then those waiting for an answer, then decided ones. Each group runs soonest deadline first.
      </PageHeader>

      {isLoading ? (
        <LoadingRows rows={5} />
      ) : applications.length === 0 ? (
        <EmptyState
          title="Start your first application"
          action={
            canAdd && (
              <>
                <Button variant="outline" asChild>
                  <Link to="/programs">Browse programs</Link>
                </Button>
                <Button variant="primary" asChild>
                  <Link to="/applications/new">New application</Link>
                </Button>
              </>
            )
          }
        >
          Each application keeps its own checklist — documents, tests, letters, fees — taken from the program's
          requirements.
        </EmptyState>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <FilterTabs<Filter>
              value={filter}
              onChange={(v) => { setFilter(v); setShown(PAGE); }}
              options={[
                { value: "all", label: "All", count: applications.length },
                ...JOURNEY.map((s) => ({ value: s, label: s, count: counts[s] ?? 0 })),
              ]}
            />
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              {isAgency || countries.length > 1 ? (
                <Select value={country} onValueChange={(v) => { setCountry(v); setShown(PAGE); }}>
                  <SelectTrigger className="w-full sm:w-44" aria-label="Country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Every country</SelectItem>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <Select value={when} onValueChange={(v) => { setWhen(v as When); setShown(PAGE); }}>
                <SelectTrigger className="w-full sm:w-52" aria-label="Deadline">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any deadline</SelectItem>
                  <SelectItem value="missed">Still preparing, deadline missed</SelectItem>
                  <SelectItem value="soon">Still preparing, due in 14 days</SelectItem>
                  <SelectItem value="later">Still preparing, due later</SelectItem>
                </SelectContent>
              </Select>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-4" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isAgency ? "Program, university or student" : "Program or university"}
                className="pl-8"
                aria-label="Filter applications"
              />
            </div>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="card-soft px-5 py-10 text-center text-sm text-ink-3">
              {query ? `Nothing matches “${query}”.` : "No applications match these filters."}
            </div>
          ) : (
            <ApplicationList applications={visible.slice(0, shown)} showStudent={isAgency} />
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <p className="text-[13px] text-ink-3 tnum">
              Showing {Math.min(shown, visible.length)} of {plural(visible.length, "application")}
            </p>
            {visible.length > shown && (
              <Button variant="outline" size="sm" onClick={() => setShown((n) => n + PAGE)}>
                Show {Math.min(PAGE, visible.length - shown)} more
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
}
