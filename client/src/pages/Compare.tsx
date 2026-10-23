import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { getProgram } from "@/lib/api";
import { useCompare } from "@/lib/compareContext";
import type { Program } from "@/types/program";
import { cn } from "@/lib/utils";
import { daysUntil, formatDate, formatMoney, formatTuition } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CountryPlate, DaysLeft, EmptyState, PageHeader } from "@/components/kit";

function getUni(program: Program) {
  return typeof program.universityId === "object" ? program.universityId : null;
}

type Row = {
  label: string;
  render: (p: Program) => React.ReactNode;
  /** Index of the column worth pointing out, with a short note */
  highlight?: { index: number; note: string; tone: "moss" | "stamp" } | null;
};

export default function Compare(): React.ReactElement {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();

  const queries = useQueries({
    queries: compareIds.map((id) => ({
      queryKey: ["programs", id],
      queryFn: () => getProgram(id),
      staleTime: 60 * 1000,
    })),
  });

  const programs = queries.filter((q) => q.data).map((q) => q.data as Program);
  const isLoading = queries.some((q) => q.isLoading);

  if (compareIds.length === 0) {
    return (
      <>
        <PageHeader kicker="Side by side" title="Compare">
          Put up to three programs next to each other — tuition, deadlines, tests and documents on one page.
        </PageHeader>
        <EmptyState
          title="Pick programs to compare"
          action={
            <Button variant="primary" asChild>
              <Link to="/programs">Browse programs</Link>
            </Button>
          }
        >
          Press “+ Compare” on any program in the list, or “Compare” on its page.
        </EmptyState>
      </>
    );
  }

  // Point out the cheapest and the most urgent, when there's more than one
  const cheapest =
    programs.length > 1
      ? programs.reduce((best, p, i) => (p.tuitionFee < programs[best]!.tuitionFee ? i : best), 0)
      : -1;
  const withDeadline = programs
    .map((p, i) => ({ i, t: p.applicationDeadline ? new Date(p.applicationDeadline).getTime() : Infinity }))
    .filter((x) => x.t !== Infinity && (daysUntil(programs[x.i]!.applicationDeadline) ?? -1) > 0);
  const soonest = programs.length > 1 && withDeadline.length > 0 ? withDeadline.sort((a, b) => a.t - b.t)[0]!.i : -1;

  const rows: Row[] = [
    { label: "Degree", render: (p) => p.degreeLevel },
    { label: "Taught in", render: (p) => p.languageOfInstruction },
    {
      label: "Tuition",
      render: (p) => <span className="text-[13px] tnum">{formatTuition(p.tuitionFee, p.tuitionCurrency, p.tuitionPeriod)}</span>,
      highlight: cheapest >= 0 ? { index: cheapest, note: "Lowest", tone: "moss" } : null,
    },
    {
      label: "Application fee",
      render: (p) => (p.applicationFee != null ? (p.applicationFee > 0 ? formatMoney(p.applicationFee) : "Free") : "—"),
    },
    {
      label: "Deadline",
      render: (p) =>
        p.applicationDeadline ? (
          <span className="flex flex-col gap-0.5">
            <span>{formatDate(p.applicationDeadline)}</span>
            <DaysLeft date={p.applicationDeadline} hidePast />
          </span>
        ) : (
          "—"
        ),
      highlight: soonest >= 0 ? { index: soonest, note: "First due", tone: "stamp" } : null,
    },
    {
      label: "Tests",
      render: (p) =>
        (p.testRequirements ?? []).length ? (
          <span className="text-[13px] tnum">
            {(p.testRequirements ?? []).map((tr) => `${tr.name} ${tr.minimumScore}`).join(" · ")}
          </span>
        ) : (
          "None listed"
        ),
    },
    { label: "Documents", render: (p) => (p.requiredDocuments.length ? `${p.requiredDocuments.length} required` : "None listed") },
    {
      label: "Writing",
      render: (p) =>
        [p.requiresSOP && "Statement", p.recommendationLetters > 0 && `${p.recommendationLetters} letter${p.recommendationLetters === 1 ? "" : "s"}`]
          .filter(Boolean)
          .join(" + ") || "—",
    },
    {
      label: "Scholarship",
      render: (p) => (p.scholarshipAvailable ? <span className="font-medium text-moss">Yes</span> : <span className="text-ink-3">No</span>),
    },
    { label: "University rank", render: (p) => (getUni(p)?.ranking ? `No. ${getUni(p)?.ranking}` : "—") },
  ];

  return (
    <>
      <PageHeader
        kicker={`Side by side · ${compareIds.length} of 3`}
        title="Compare"
        actions={
          <>
            {compareIds.length < 3 && (
              <Button variant="outline" asChild>
                <Link to="/programs">Add another</Link>
              </Button>
            )}
            <Button variant="ghost" onClick={clearCompare}>
              Clear the table
            </Button>
          </>
        }
      >
        {programs.length === 1
          ? "One program so far. Add one or two more to see them next to each other."
          : "Read across each line. The lowest tuition and the first deadline are marked."}
      </PageHeader>

      {isLoading && programs.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-3">
          {compareIds.map((id) => (
            <Skeleton key={id} className="h-72" />
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] table-fixed border-collapse text-sm">
            <colgroup>
              <col className="w-40" />
              {programs.map((p) => (
                <col key={p._id} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-rule align-bottom">
                <th className="pl-5" />
                {programs.map((p) => {
                  const uni = getUni(p);
                  return (
                    <th key={p._id} className="px-4 pt-5 pb-4 text-left font-normal">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/programs/${p._id}`}
                          className="text-[16px] leading-snug font-semibold text-ink hover:text-brand-ink"
                        >
                          {p.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCompare(p._id)}
                          className="-mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-lg leading-none text-ink-4 hover:bg-stamp-soft hover:text-stamp"
                          aria-label={`Remove ${p.name} from comparison`}
                          title="Take off the table"
                        >
                          ×
                        </button>
                      </div>
                      {uni && (
                        <p className="mt-2 flex items-center gap-2 text-[13px] text-ink-3">
                          <CountryPlate country={uni.country} className="h-6 min-w-6 rounded-md text-[10px]" />
                          <span className="truncate">
                            {uni.name}, {uni.city}
                          </span>
                        </p>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-rule-soft">
                  <th scope="row" className="kicker py-3.5 pr-4 pl-5 text-left align-top">
                    {row.label}
                  </th>
                  {programs.map((p, i) => {
                    const marked = row.highlight?.index === i;
                    return (
                      <td key={p._id} className={cn("px-4 py-3.5 align-top text-ink", marked && "bg-paper-sunken/60")}>
                        {row.render(p)}
                        {marked && (
                          <span
                            className={cn("mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold tnum",
                              row.highlight!.tone === "moss" ? "bg-moss-soft text-moss" : "bg-stamp-soft text-stamp",
                            )}
                          >
                            {row.highlight!.note}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td />
                {programs.map((p) => (
                  <td key={p._id} className="px-4 pt-4 pb-5">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/applications/new?programId=${p._id}`}>Apply</Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
