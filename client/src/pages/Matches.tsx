import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useMatches, usePreferences, useUpdatePreferences } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import type { MatchResult } from "@/lib/api";
import { cn, getErrorMessage } from "@/lib/utils";
import { formatTuition, listJoin, plural } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountryPlate, EmptyState, ErrorState, LoadingRows, PageHeader } from "@/components/kit";
import { CountryChips } from "@/components/CountryChips";

const CHANCE = {
  safe: { label: "Safe", note: "you clear the bar comfortably", tone: "text-moss bg-moss-soft" },
  target: { label: "Target", note: "competitive, but realistic", tone: "text-ochre bg-ochre-soft" },
  reach: { label: "Reach", note: "a stretch — worth one or two", tone: "text-stamp bg-stamp-soft" },
} as const;

/** An inline blank in the sentence form, like a form you fill in with a pen. */
function Blank({
  value,
  onChange,
  placeholder,
  width = "w-20",
  label,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  width?: string;
  label: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">): React.ReactElement {
  return (
    <input
      {...rest}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn("mx-1.5 inline-block rounded-xl border-0 bg-brand-soft px-2 py-0.5 text-center text-[0.85em] font-bold text-brand-ink outline-none placeholder:font-semibold placeholder:text-brand-ink/40 focus:ring-4 focus:ring-brand/20 tnum",
        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        width,
      )}
    />
  );
}

function MatchRow({ match }: { match: MatchResult }): React.ReactElement {
  const uni = typeof match.universityId === "object" ? match.universityId : null;
  const chance = match.admitChance ? CHANCE[match.admitChance] : null;

  return (
    <li>
      <Link
        to={`/programs/${match._id}`}
        className="group grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-5 gap-y-2 py-5 transition-colors hover:bg-paper-hover sm:grid-cols-[3.5rem_minmax(0,1fr)_11rem] px-5"
      >
        <div className="text-right">
          <span className="text-[30px] leading-none font-bold tnum tracking-[-0.02em]">{match.matchScore}</span>
          <span className="text-xs text-ink-3 tnum">%</span>
          <p className="kicker mt-1 text-[11px]">match</p>
        </div>
        <div className="min-w-0">
          <p className="text-[16px] leading-snug font-semibold group-hover:text-brand-ink">
            {match.name}
          </p>
          {uni && (
            <p className="mt-1 flex items-center gap-2 text-[13px] text-ink-2">
              <CountryPlate country={uni.country} className="h-6 min-w-6 rounded-md text-[10px]" />
              <span className="truncate">
                {uni.name}, {uni.city}
              </span>
            </p>
          )}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Badge variant="outline">{match.degreeLevel}</Badge>
            <span className="text-[13px] text-ink-3">{match.languageOfInstruction}</span>
            {match.scholarshipAvailable && <Badge variant="moss">Scholarship</Badge>}
            {match.testRequirements?.length ? (
              <span className="text-xs text-ink-3 tnum">
                {match.testRequirements.map((tr) => `${tr.name} ${tr.minimumScore}`).join(" · ")}
              </span>
            ) : null}
          </div>
        </div>
        <div className="col-start-2 flex items-center justify-between gap-3 sm:col-start-auto sm:flex-col sm:items-end sm:justify-start">
          {chance && (
            <span
              className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tnum",
                chance.tone,
              )}
              title={chance.note}
            >
              {chance.label}
              {match.admitScore !== undefined && <span className="ml-1.5 font-normal opacity-75">{match.admitScore}</span>}
            </span>
          )}
          <span className="text-[13px] text-ink-2 tnum">
            {formatTuition(match.tuitionFee, match.tuitionCurrency, match.tuitionPeriod)}
          </span>
        </div>
      </Link>
    </li>
  );
}

export default function Matches(): React.ReactElement {
  const { user } = useAuth();
  const { data: prefs } = usePreferences();
  const updatePrefs = useUpdatePreferences();

  // An agency opens this from a student's file with that student's numbers in the URL
  const [searchParams] = useSearchParams();
  const forName = searchParams.get("for");
  const fromUrl = ["budget", "gpa", "ielts", "countries"].some((k) => searchParams.has(k));

  const [budget, setBudget] = useState(() => searchParams.get("budget") ?? "");
  const [gpa, setGpa] = useState(() => searchParams.get("gpa") ?? "");
  const [ielts, setIelts] = useState(() => searchParams.get("ielts") ?? "");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    () => searchParams.get("countries")?.split(",").filter(Boolean) ?? [],
  );
  const [searched, setSearched] = useState(fromUrl);
  const prefilled = useRef(fromUrl);

  // Fill the sentence from saved preferences once they arrive
  useEffect(() => {
    if (!prefs || prefilled.current) return;
    prefilled.current = true;
    setBudget((v) => v || (prefs.preferredMonthlyBudget?.toString() ?? ""));
    setGpa((v) => v || (prefs.gpa?.toString() ?? ""));
    setIelts((v) => v || (prefs.ieltsScore?.toString() ?? ""));
    setSelectedCountries((v) => (v.length ? v : prefs.preferredCountries ?? []));
  }, [prefs]);

  const params = {
    budget: budget ? Number(budget) : undefined,
    gpa: gpa ? Number(gpa) : undefined,
    ielts: ielts ? Number(ielts) : undefined,
    countries: selectedCountries.length > 0 ? selectedCountries.join(",") : undefined,
  };

  const { data, isLoading, isError } = useMatches(params, searched);

  function handleClear(): void {
    setBudget("");
    setGpa("");
    setIelts("");
    setSelectedCountries([]);
    setSearched(false);
  }

  const hasFilled = !!(budget || gpa || ielts || selectedCountries.length > 0);
  const matches = data?.matches ?? [];

  // Offer to keep what a student typed, so the next visit starts from it
  const differsFromProfile =
    user?.role === "student" &&
    !!prefs &&
    hasFilled &&
    (String(prefs.preferredMonthlyBudget ?? "") !== budget ||
      String(prefs.gpa ?? "") !== gpa ||
      String(prefs.ieltsScore ?? "") !== ielts ||
      [...(prefs.preferredCountries ?? [])].sort().join() !== [...selectedCountries].sort().join());

  async function saveToProfile(): Promise<void> {
    try {
      await updatePrefs.mutateAsync({
        preferredMonthlyBudget: budget ? Number(budget) : null,
        gpa: gpa ? Number(gpa) : null,
        ieltsScore: ielts ? Number(ielts) : null,
        preferredCountries: selectedCountries,
      });
      toast.success("Saved to your profile");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't save your profile"));
    }
  }

  return (
    <>
      <PageHeader kicker={forName ? "Matches · for a student" : "Matches"} title={forName ? `Programs for ${forName}` : "Find programs that fit you"}>
        {forName
          ? `Filled in from ${forName}'s file. Change any blank to see what opens up.`
          : "Fill in the blanks and we'll sort the catalogue by how well each program fits — and how likely you are to get in."}
      </PageHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (hasFilled) setSearched(true);
        }}
        className="max-w-3xl"
      >
        <p className="text-[20px] leading-[2.2] font-medium tracking-[-0.01em] text-ink-2 sm:text-[26px]">
          {forName ? `${forName.split(" ")[0]} can spend about €` : "I can spend about €"}
          <Blank label="Monthly budget in euros" type="number" inputMode="numeric" value={budget} onChange={setBudget} placeholder="1200" width="w-24" />
          {forName ? "a month. Their GPA is" : "a month. My GPA is"}
          <Blank label="GPA" type="number" step="0.1" min="0" max="4" inputMode="decimal" value={gpa} onChange={setGpa} placeholder="3.4" />
          {forName ? "and they scored" : "and I scored"}
          <Blank label="IELTS score" type="number" step="0.5" min="0" max="9" inputMode="decimal" value={ielts} onChange={setIelts} placeholder="6.5" />
          {forName ? "on the IELTS. They'd like to study in" : "on the IELTS. I'd like to study in"}{" "}
          <span className="text-ink">
            {selectedCountries.length ? listJoin(selectedCountries) : <span className="text-ink-4">anywhere</span>}
          </span>
          .
        </p>

        <div className="mt-5">
          <p className="kicker mb-2">Countries — tap to add or remove</p>
          <CountryChips value={selectedCountries} onChange={setSelectedCountries} />
        </div>

        <div className="mt-6 flex items-center gap-2">
          <Button type="submit" variant="primary" size="lg" disabled={!hasFilled}>
            {forName ? "Find matches" : "Find my matches"}
          </Button>
          {(searched || hasFilled) && (
            <Button type="button" variant="ghost" onClick={handleClear}>
              Start over
            </Button>
          )}
          {differsFromProfile && (
            <Button type="button" variant="outline" onClick={saveToProfile} disabled={updatePrefs.isPending}>
              Save to my profile
            </Button>
          )}
        </div>
      </form>

      <div className="mt-12">
        {searched && isLoading && <LoadingRows rows={5} />}

        {searched && isError && <ErrorState title="Matches didn't load">Please try again in a moment.</ErrorState>}

        {searched && !isLoading && !isError && matches.length === 0 && (
          <EmptyState title="No program fits all of that">
            Try a slightly higher budget, or add a country or two — one loose blank usually opens things up.
          </EmptyState>
        )}

        {searched && !isLoading && !isError && matches.length > 0 && (
          <>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-4 px-1">
              <p className="kicker">{plural(data?.total ?? matches.length, "match", "matches")}, best first</p>
              {matches.some((m) => m.admitChance) && (
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3">
                  {Object.values(CHANCE).map((c) => (
                    <span key={c.label}>
                      <span className={cn("font-semibold tnum", c.tone.split(" ")[0])}>
                        {c.label}
                      </span>{" "}
                      {c.note}
                    </span>
                  ))}
                </p>
              )}
            </div>
            <ul className="card divide-y divide-rule-soft overflow-hidden">
              {matches.map((m) => (
                <MatchRow key={m._id} match={m} />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
