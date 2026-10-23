import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Application } from "@/types/application";
import { APPLICATION_STATUSES, STATUS_META, type ApplicationStatus } from "@/lib/constants";
import { appProgram, appUniversity } from "@/lib/applications";
import { cn } from "@/lib/utils";
import { daysUntil, shortDate } from "@/lib/format";
import { CountryPlate, DaysLeft, LedgerDate, StatusTag } from "@/components/kit";

/* One application as a row in a card list */

export function ApplicationRow({
  application: a,
  showStudent = false,
  dateMode = "deadline",
}: {
  application: Application;
  showStudent?: boolean;
  dateMode?: "deadline" | "added";
}): React.ReactElement {
  const prog = appProgram(a);
  const uni = appUniversity(a);
  const preparing = a.applicationStatus === "Preparing";
  const missed = preparing && (daysUntil(a.applicationDeadline) ?? 0) < 0;
  const submittedAt = a.applicationProgress?.applicationSubmittedDate;

  return (
    <li>
      <Link
        to={`/applications/${a._id}`}
        className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-4 py-3.5 transition-colors hover:bg-paper-hover sm:grid-cols-[auto_minmax(0,1fr)_7.5rem_minmax(6rem,auto)_auto] sm:px-5"
      >
        {a.applicationDeadline ? (
          <LedgerDate date={a.applicationDeadline} />
        ) : (
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-paper-sunken text-sm text-ink-4">—</span>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{prog?.name ?? "Untitled program"}</p>
          <p className="mt-0.5 truncate text-[13px] text-ink-3">
            {showStudent && <span className="font-medium text-ink-2">{a.studentName} · </span>}
            {uni ? `${uni.name}, ${uni.city}` : "University not set"}
          </p>
        </div>
        <div className="col-start-2 row-start-2 flex items-center gap-2 sm:col-start-auto sm:row-start-auto">
          <StatusTag status={a.applicationStatus} />
        </div>
        <div className="row-span-2 text-right sm:row-span-1">
          {dateMode === "added" ? (
            <span className="text-[13px] whitespace-nowrap text-ink-3">Added {shortDate(a.createdAt)}</span>
          ) : missed ? (
            <span className="text-[13px] font-semibold whitespace-nowrap text-stamp tnum">
              Missed by {Math.abs(daysUntil(a.applicationDeadline) ?? 0)} d
            </span>
          ) : preparing ? (
            <DaysLeft date={a.applicationDeadline} />
          ) : a.applicationStatus === "Applied" ? (
            <span className="text-[13px] whitespace-nowrap text-ink-3">{submittedAt ? `Sent ${shortDate(submittedAt)}` : "Sent"}</span>
          ) : uni ? (
            <CountryPlate country={uni.country} className="ml-auto" />
          ) : null}
        </div>
        <ChevronRight className="hidden size-4 text-ink-4 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-2 sm:block" />
      </Link>
    </li>
  );
}

export function ApplicationList({
  applications,
  showStudent,
  dateMode,
  className,
}: {
  applications: Application[];
  showStudent?: boolean;
  dateMode?: "deadline" | "added";
  className?: string;
}): React.ReactElement {
  return (
    <ul className={cn("card divide-y divide-rule-soft overflow-hidden", className)}>
      {applications.map((a) => (
        <ApplicationRow key={a._id} application={a} showStudent={showStudent} dateMode={dateMode} />
      ))}
    </ul>
  );
}

/* A stacked bar with counts underneath */

export function StatusBreakdown({ counts }: { counts: Record<ApplicationStatus, number> }): React.ReactElement {
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  return (
    <div className="@container card p-5">
      <div className="flex h-2.5 w-full gap-1 overflow-hidden rounded-full">
        {total > 0 ? (
          APPLICATION_STATUSES.filter((s) => counts[s]).map((s) => (
            <div
              key={s}
              title={`${s}: ${counts[s]}`}
              className={cn("rounded-full", STATUS_META[s].dot, s === "Enrolled" && "bg-moss-solid")}
              style={{ width: `${((counts[s] ?? 0) / total) * 100}%` }}
            />
          ))
        ) : (
          <div className="w-full rounded-full bg-paper-sunken" />
        )}
      </div>
      <dl className="mt-5 grid gap-x-6 gap-y-2.5 @md:grid-cols-2">
        {APPLICATION_STATUSES.map((s) => (
          <div key={s} className={cn("flex items-center justify-between gap-2", !counts[s] && "opacity-50")}>
            <dt>
              <StatusTag status={s} />
            </dt>
            <dd className="text-lg font-bold text-ink tnum">{counts[s] ?? 0}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* Stat tiles */

export function Figures({
  items,
  className,
}: {
  items: { label: string; value: React.ReactNode; note?: React.ReactNode }[];
  className?: string;
}): React.ReactElement {
  return (
    <dl className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      {items.map((it) => (
        <div key={it.label} className="card-soft px-5 py-4">
          <dt className="text-[13px] font-medium text-ink-3">{it.label}</dt>
          <dd className="mt-1 text-[30px] leading-tight font-bold tracking-[-0.02em] text-ink tnum">{it.value}</dd>
          {it.note && <dd className="mt-0.5 text-xs font-medium text-ink-3">{it.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

/* A card of links — used for shortcuts in sidebars */

export function Shortcuts({
  items,
}: {
  items: { label: string; hint?: string; to?: string; onClick?: () => void }[];
}): React.ReactElement {
  return (
    <ul className="card divide-y divide-rule-soft overflow-hidden">
      {items.map((it) => {
        const inner = (
          <>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">{it.label}</span>
              {it.hint && <span className="mt-0.5 block text-xs text-ink-3">{it.hint}</span>}
            </span>
            <ChevronRight className="size-4 shrink-0 text-ink-4 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-2" />
          </>
        );
        const cls = "group flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-paper-hover";
        return (
          <li key={it.label}>
            {it.to ? (
              <Link to={it.to} className={cls}>
                {inner}
              </Link>
            ) : (
              <button type="button" onClick={it.onClick} className={cls}>
                {inner}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
