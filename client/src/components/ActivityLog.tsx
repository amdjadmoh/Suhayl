import { useState } from "react";
import { Link } from "react-router-dom";
import type { ActivityItem } from "@/lib/api-team";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { Section } from "@/components/kit";
import { t } from "@/lib/i18n";

const SHOW = 8;

const lowerFirst = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);

/** The line in the reader's language: statuses and field names are translated too. */
function describe(a: ActivityItem): string {
  if (!a.template) return a.action;
  const vars = { ...(a.vars ?? {}) };
  if (vars["status"]) vars["status"] = t(vars["status"]);
  if (vars["fields"]) vars["fields"] = vars["fields"].split(", ").map((f) => t(f)).join(", ");
  return t(a.template, vars);
}

function when(iso: string): string {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : formatDate(iso);
}

/** Who did what, newest first. On the agency view each line links to its student. */
export function ActivityLog({
  items,
  title = t("History"),
  showStudent = false,
  isLoading,
}: {
  items: ActivityItem[];
  title?: string;
  showStudent?: boolean;
  isLoading?: boolean;
}): React.ReactElement {
  const [all, setAll] = useState(false);
  const list = all ? items : items.slice(0, SHOW);

  return (
    <Section title={title} count={isLoading ? undefined : items.length}>
      {isLoading ? (
        <div className="card-soft h-20 animate-pulse" />
      ) : items.length === 0 ? (
        <p className="card-soft px-5 py-4 text-sm text-ink-3">{t("Nothing recorded yet. Changes made from now on show up here.")}</p>
      ) : (
        <div className="card overflow-hidden">
          <ol className="divide-y divide-rule-soft">
            {list.map((a) => {
              const student = showStudent && typeof a.studentId === "object" ? a.studentId : null;
              return (
                <li key={a._id} className="flex gap-3 px-5 py-3">
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", a.actorId ? "bg-brand" : "bg-moss-solid")} aria-hidden="true" />
                  <p className="min-w-0 flex-1 text-[14px] leading-snug text-ink-2">
                    <span className="font-semibold text-ink">{a.actorId ? a.actorName : t("Family")}</span> {lowerFirst(describe(a))}
                    {student && (
                      <>
                        {" · "}
                        <Link to={`/agency/students/${student._id}`} className="font-medium text-brand-ink hover:underline">
                          {student.name}
                        </Link>
                      </>
                    )}
                  </p>
                  <span className="shrink-0 text-xs whitespace-nowrap text-ink-4 tnum">{when(a.createdAt)}</span>
                </li>
              );
            })}
          </ol>
          {items.length > SHOW && (
            <button
              type="button"
              onClick={() => setAll((v) => !v)}
              className="w-full border-t border-rule-soft px-5 py-2.5 text-left text-[13px] font-semibold text-ink-3 hover:text-ink"
            >
              {all ? t("Show less") : t("Show all {n}", { n: items.length })}
            </button>
          )}
        </div>
      )}
    </Section>
  );
}
