import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePrograms, useBudgetCalculation } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, PageHeader } from "@/components/kit";

const DEGREE_PHRASE: Record<string, string> = {
  Bachelor: "a bachelor's degree",
  Master: "a master's degree",
  PhD: "a PhD",
  Diploma: "a diploma",
};

// One colour per cost, used in both the bar and the list
const PARTS = [
  { key: "tuition", label: "Tuition", dot: "bg-brand" },
  { key: "livingCost", label: "Living costs", note: "Rent and day-to-day, for the length of the program", dot: "bg-moss-solid" },
  { key: "visaFees", label: "Visa and deposit", note: "Application fee and blocked account", dot: "bg-ochre" },
  { key: "insurance", label: "Health insurance", note: "Estimate", dot: "bg-stamp" },
] as const;

export default function BudgetCalculator(): React.ReactElement {
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");

  const { data: programsData, isLoading: programsLoading } = usePrograms();
  const { data: budget, isLoading: budgetLoading } = useBudgetCalculation(selectedProgramId || null);

  const programs = useMemo(
    () => (programsData?.programs ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
    [programsData],
  );
  const selectedProgram = programs.find((p) => p._id === selectedProgramId);
  const selectedUni =
    selectedProgram && typeof selectedProgram.universityId === "object" ? selectedProgram.universityId : null;

  const total = budget?.total ?? 0;

  return (
    <>
      <PageHeader kicker="Budget" title="What will it actually cost?">
        Tuition is only part of it. Pick a program and we'll add up the rent, the visa money and insurance for that
        city, so the number you plan around is the real one.
      </PageHeader>

      <div className="grid gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="max-w-xl">
          <div className="card p-5 sm:p-6">
            <label className="text-[17px] font-bold text-ink" htmlFor="budget-program">
              Which program?
            </label>
            <div className="mt-3">
              {programsLoading ? (
                <Skeleton className="h-11 w-full" />
              ) : (
                <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                  <SelectTrigger id="budget-program" className="h-11 text-[15px]">
                    <SelectValue placeholder="Choose a program…" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => {
                      const uni = typeof p.universityId === "object" ? p.universityId : null;
                      return (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name}
                          {uni ? <span className="text-ink-3"> — {uni.name}</span> : null}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedProgram && (
              <p className="mt-5 text-[15px] leading-relaxed text-ink-2">
                <span className="font-semibold text-ink">{selectedProgram.name}</span> is{" "}
                {DEGREE_PHRASE[selectedProgram.degreeLevel] ?? "a program"}
                {selectedUni && (
                  <>
                    {" "}
                    at {selectedUni.name} in {selectedUni.city}
                  </>
                )}
                , taught in {selectedProgram.languageOfInstruction}.{" "}
                <Link to={`/programs/${selectedProgram._id}`} className="link-ink">
                  Program details
                </Link>
              </p>
            )}
          </div>

          <p className="mt-4 px-1 text-[13px] leading-relaxed text-ink-3">
            These are estimates from average costs for the city and the country's visa rules. Your rent, your insurer and
            the exchange rate will move them, so plan for a margin.
          </p>
        </div>

        <div>
          {!selectedProgramId && !programsLoading && (
            <EmptyState title="Pick a program to see the total">
              Tuition, living costs, the visa deposit and insurance, added up for that city.
            </EmptyState>
          )}

          {selectedProgramId && budgetLoading && <Skeleton className="h-[24rem] w-full rounded-3xl" />}

          {selectedProgramId && !budgetLoading && !budget && (
            <EmptyState title="No numbers for this one yet">
              We don't have living-cost data for this program's city, so we can't add it up honestly.
            </EmptyState>
          )}

          {selectedProgramId && budget && (
            <div className="card overflow-hidden rounded-3xl">
              <div className="bg-brand px-6 py-6 text-on-brand">
                <p className="text-sm font-medium opacity-80">Estimated total</p>
                <p className="mt-1 text-[44px] leading-none font-bold tracking-[-0.03em] tnum">
                  {formatMoney(total, budget.currency)}
                </p>
                {selectedUni && (
                  <p className="mt-2 text-sm opacity-80">
                    {selectedProgram?.name} · {selectedUni.city}
                  </p>
                )}
              </div>

              <div className="px-6 py-5">
                <div className="flex h-3 w-full gap-1 overflow-hidden rounded-full">
                  {PARTS.map((part) => {
                    const amount = budget[part.key];
                    return amount > 0 ? (
                      <div
                        key={part.key}
                        className={cn("rounded-full", part.dot)}
                        style={{ width: `${(amount / (total || 1)) * 100}%` }}
                        title={`${part.label}: ${formatMoney(amount, budget.currency)}`}
                      />
                    ) : null;
                  })}
                </div>

                <ul className="mt-5 divide-y divide-rule-soft">
                  {PARTS.map((part) => {
                    const amount = budget[part.key];
                    const pct = total ? Math.round((amount / total) * 100) : 0;
                    const note =
                      part.key === "tuition" && selectedProgram?.tuitionPeriod
                        ? `Per ${selectedProgram.tuitionPeriod.toLowerCase()}`
                        : "note" in part
                          ? part.note
                          : undefined;
                    return (
                      <li key={part.key} className="flex items-center gap-3 py-3">
                        <span className={cn("size-2.5 shrink-0 rounded-full", part.dot)} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink">{part.label}</span>
                          {note && <span className="block text-xs text-ink-3">{note}</span>}
                        </span>
                        <span className="text-right">
                          <span className="block text-sm font-bold text-ink tnum">{formatMoney(amount, budget.currency)}</span>
                          <span className="block text-xs text-ink-3 tnum">{pct}%</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {budget.breakdown && budget.breakdown.length > 0 && (
                  <details className="mt-2 rounded-2xl bg-paper-sunken px-4 py-3 text-sm">
                    <summary className="cursor-pointer font-semibold text-ink-2">Every line item</summary>
                    <ul className="mt-2 space-y-1">
                      {budget.breakdown.map((item, i) => (
                        <li key={i} className="flex justify-between gap-4 text-[13px] text-ink-2">
                          <span>{item.label}</span>
                          <span className="font-semibold tnum">{formatMoney(item.amount, budget.currency)}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
