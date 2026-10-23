import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Search } from "lucide-react";
import {
  usePrograms,
  useCountries,
  useCities,
  useFavorites,
  useAddFavorite,
  useRemoveFavorite,
  useToggleProgramOfficial,
} from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { useCompare } from "@/lib/compareContext";
import { DEGREE_LEVELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { daysUntil, formatDate, formatMoney, formatTuition, plural } from "@/lib/format";
import type { Program } from "@/types/program";
import type { Country } from "@/types/country";
import type { City } from "@/types/city";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CountryPlate, DaysLeft, EmptyState, ErrorState, Field, LoadingRows, PageHeader, VerificationTag,
} from "@/components/kit";
import { SavedSearches } from "@/components/SavedSearches";
import { SaveToggle } from "@/components/SaveToggle";

const FILTER_KEYS = [
  "search", "degreeLevel", "country", "field", "city", "maxTuition", "minGpa", "maxIelts", "scholarshipOnly", "customOnly",
] as const;

function ProgramRow({
  program,
  countries,
  cities,
  isFav,
  isAdmin,
  showOfficialToggle,
  onToggleFavorite,
}: {
  program: Program;
  countries: Country[] | undefined;
  cities: City[] | undefined;
  isFav: boolean;
  isAdmin?: boolean;
  showOfficialToggle?: boolean;
  onToggleFavorite: (type: string, itemId: string, isFav: boolean) => void;
}): React.ReactElement {
  const uni = typeof program.universityId === "object" ? program.universityId : null;
  const { user } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare, compareIds } = useCompare();
  const isStudent = user?.role === "student";
  const toggleProgOfficial = useToggleProgramOfficial();
  const inCompare = isInCompare(program._id);
  const compareFull = compareIds.length >= 3 && !inCompare;

  // Rough yearly cost: tuition + a year of living in that city + the visa bank deposit
  let estimatedTotal: string | null = null;
  if (uni) {
    const countryData = countries?.find((c) => c.name === uni.country);
    const cityData = cities?.find((c) => c.country === uni.country && c.name === uni.city);
    const livingCostYear = cityData ? cityData.monthlyLivingCost * 12 : 0;
    const visaBankAmount = countryData?.visaBankAccountAmount ?? 0;
    if (livingCostYear > 0 || visaBankAmount > 0) {
      estimatedTotal = formatMoney(program.tuitionFee + livingCostYear + visaBankAmount, program.tuitionCurrency);
    }
  }

  return (
    <li className="group relative grid gap-x-8 gap-y-3 py-5 sm:grid-cols-[minmax(0,1fr)_12rem] px-5">
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Link
              to={`/programs/${program._id}`}
              className="text-[16px] leading-snug font-semibold text-ink hover:text-brand-ink"
            >
              {program.name}
            </Link>
            {uni && (
              <p className="mt-1 flex items-center gap-2 text-[13px] text-ink-2">
                <CountryPlate country={uni.country} className="h-6 min-w-6 rounded-md text-[10px]" />
                <span className="truncate">
                  {uni.name}, {uni.city}
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Badge variant="outline">{program.degreeLevel}</Badge>
          <span className="text-[13px] text-ink-3">Taught in {program.languageOfInstruction}</span>
          {program.scholarshipAvailable && <Badge variant="moss">Scholarship</Badge>}
          {program.isOfficial === false && <Badge variant="secondary">Your own</Badge>}
          <VerificationTag status={program.verificationStatus} />
        </div>
      </div>

      <div className="flex flex-row items-end justify-between gap-4 sm:flex-col sm:items-end sm:text-right">
        <div>
          <p className="text-sm font-medium text-ink tnum">
            {formatTuition(program.tuitionFee, program.tuitionCurrency, program.tuitionPeriod)}
          </p>
          <p className="mt-0.5 text-xs text-ink-3">
            {estimatedTotal ? <>≈ {estimatedTotal} a year, all in</> : "living costs vary"}
          </p>
          {program.applicationDeadline && (
            <p className="mt-2 flex items-baseline gap-2 text-xs text-ink-3 sm:justify-end">
              <span>{(daysUntil(program.applicationDeadline) ?? 0) < 0 ? "Closed" : "Due"} {formatDate(program.applicationDeadline)}</span>
              <DaysLeft date={program.applicationDeadline} short hidePast />
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isStudent && (
            <button
              type="button"
              onClick={() => (inCompare ? removeFromCompare(program._id) : addToCompare(program._id))}
              disabled={compareFull}
              title={compareFull ? "You can compare three at a time" : undefined}
              className={cn("rounded-lg px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 tnum",
                inCompare ? "bg-brand text-on-brand" : "text-ink-3 hover:bg-paper-sunken hover:text-ink",
              )}
            >
              {inCompare ? "✓ Comparing" : "+ Compare"}
            </button>
          )}
          {isAdmin && showOfficialToggle && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await toggleProgOfficial.mutateAsync(program._id);
                  toast.success(program.isOfficial ? "Program marked as custom" : "Program marked as official");
                } catch {
                  toast.error("Failed to toggle official status");
                }
              }}
              disabled={toggleProgOfficial.isPending}
              className="rounded-lg px-2 py-1 text-xs font-medium text-ink-2 hover:bg-paper-sunken hover:text-ink tnum"
            >
              {program.isOfficial ? "Make custom" : "Make official"}
            </button>
          )}
          <SaveToggle saved={isFav} onToggle={() => onToggleFavorite("program", program._id, isFav)} />
        </div>
      </div>
    </li>
  );
}

export default function Programs(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [cityInput, setCityInput] = useState(searchParams.get("city") ?? "");
  // Filters fold away on small screens so results come first
  const [filtersOpen, setFiltersOpen] = useState(false);

  const get = (k: string): string => searchParams.get(k) ?? "";
  const search = get("search");
  const degreeLevel = get("degreeLevel");
  const country = get("country");
  const field = get("field");
  const city = get("city");
  const maxTuition = get("maxTuition");
  const minGpa = get("minGpa");
  const maxIelts = get("maxIelts");
  const scholarshipOnly = get("scholarshipOnly");
  const customOnly = get("customOnly");

  const { data, isLoading, isError, error } = usePrograms({
    search: search || undefined,
    degreeLevel: degreeLevel || undefined,
    country: country || undefined,
    field: field || undefined,
    city: city || undefined,
    maxTuition: maxTuition || undefined,
    minGpa: minGpa || undefined,
    maxIelts: maxIelts || undefined,
    scholarshipOnly: scholarshipOnly || undefined,
    customOnly: customOnly || undefined,
  });
  const { data: countries } = useCountries();
  const { data: cities } = useCities();
  const { data: favorites } = useFavorites();
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const favoritesMap: Record<string, boolean> = {};
  favorites?.forEach((f) => {
    favoritesMap[f.itemId] = true;
  });

  function handleToggleFavorite(type: string, itemId: string, isFav: boolean): void {
    if (isFav) removeFav.mutate({ type, itemId });
    else addFav.mutate({ type, itemId });
  }

  function updateFilter(key: string, value: string): void {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  }

  function applyText(): void {
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set("search", searchInput);
    else params.delete("search");
    if (cityInput) params.set("city", cityInput);
    else params.delete("city");
    setSearchParams(params);
  }

  function clearFilters(): void {
    setSearchInput("");
    setCityInput("");
    setSearchParams({});
  }

  function getCurrentFilters(): Record<string, string> {
    const filters: Record<string, string> = {};
    for (const k of FILTER_KEYS) {
      const v = searchParams.get(k);
      if (v) filters[k] = v;
    }
    return filters;
  }

  function handleApplySavedSearch(filters: Record<string, string>): void {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    setSearchParams(params);
    setSearchInput(filters["search"] ?? "");
    setCityInput(filters["city"] ?? "");
  }

  const hasFilters = FILTER_KEYS.some((k) => searchParams.get(k));
  const activeFilterCount = FILTER_KEYS.filter((k) => searchParams.get(k)).length;

  if (isError) {
    return (
      <ErrorState title="Programs didn't load">{error instanceof Error ? error.message : "Unknown error"}</ErrorState>
    );
  }

  const programs = data?.programs ?? [];
  const total = data?.total ?? programs.length;

  return (
    <>
      <PageHeader
        kicker={isLoading ? "Catalogue" : `Catalogue · ${plural(total, "program")}`}
        title="Programs"
        actions={
          <Button variant="outline" asChild>
            <Link to="/programs/new">{isAdmin ? "Add an official program" : "Add one you found"}</Link>
          </Button>
        }
      >
        Degrees at the universities in the catalogue, plus any you've added yourself. Fill in your GPA and IELTS to hide
        the ones you don't qualify for yet.
      </PageHeader>

      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            className="flex w-full items-center justify-between rounded-full bg-paper-sunken px-5 py-2.5 text-sm font-semibold text-ink lg:hidden"
          >
            <span>
              Filters
              {activeFilterCount > 0 && <span className="ml-2 text-xs text-stamp tnum">{activeFilterCount} on</span>}
            </span>
            <span className="text-xs text-ink-3 tnum">{filtersOpen ? "Hide −" : "Show +"}</span>
          </button>
          <div className={cn(filtersOpen ? "mt-4 block" : "hidden", "lg:mt-0 lg:block")}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyText();
              }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"
            >
              <Field label="Search" htmlFor="program-search">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-4" />
                  <Input
                    id="program-search"
                    placeholder="Program name"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </Field>
              <Field label="Country">
                <Select value={country || "all"} onValueChange={(v) => updateFilter("country", v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Anywhere" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Anywhere</SelectItem>
                    {countries?.map((c) => (
                      <SelectItem key={c._id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="City" htmlFor="program-city">
                <Input id="program-city" placeholder="Any city" value={cityInput} onChange={(e) => setCityInput(e.target.value)} />
              </Field>
              <Field label="Degree">
                <Select value={degreeLevel || "all"} onValueChange={(v) => updateFilter("degreeLevel", v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any level</SelectItem>
                    {DEGREE_LEVELS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Tuition up to (€ / year)" htmlFor="program-tuition">
                <Input
                  id="program-tuition"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 5000"
                  value={maxTuition}
                  onChange={(e) => updateFilter("maxTuition", e.target.value)}
                  className="tnum"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Your GPA" htmlFor="program-gpa">
                  <Input
                    id="program-gpa"
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    placeholder="3.4"
                    value={minGpa}
                    onChange={(e) => updateFilter("minGpa", e.target.value)}
                    className="tnum"
                  />
                </Field>
                <Field label="Your IELTS" htmlFor="program-ielts">
                  <Input
                    id="program-ielts"
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    placeholder="6.5"
                    value={maxIelts}
                    onChange={(e) => updateFilter("maxIelts", e.target.value)}
                    className="tnum"
                  />
                </Field>
              </div>
              <div className="space-y-2.5 sm:col-span-2 lg:col-span-1">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
                  <Checkbox
                    checked={scholarshipOnly === "true"}
                    onCheckedChange={(checked) => updateFilter("scholarshipOnly", checked ? "true" : "")}
                  />
                  With a scholarship
                </label>
                {!!user && (
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
                    <Checkbox
                      checked={customOnly === "true"}
                      onCheckedChange={(checked) => updateFilter("customOnly", checked ? "true" : "")}
                    />
                    {isAdmin ? "Custom programs only" : "Only ones I added"}
                  </label>
                )}
              </div>
              <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                <Button type="submit" size="sm">
                  Search
                </Button>
                {hasFilters && (
                  <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>
            </form>

            {user && (
              <div className="mt-8 border-t border-rule pt-5">
                <SavedSearches
                  entityType="program"
                  currentFilters={getCurrentFilters()}
                  onApply={handleApplySavedSearch}
                  placeholder="CS masters in Germany"
                />
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          {isLoading ? (
            <LoadingRows rows={6} />
          ) : programs.length === 0 ? (
            <EmptyState
              title={hasFilters ? "Nothing fits all of that" : "The catalogue is empty"}
              action={
                hasFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )
              }
            >
              {hasFilters
                ? "Try loosening one filter — tuition and IELTS are usually the ones that bite."
                : "Programs added by admins, or by you, will appear here."}
            </EmptyState>
          ) : (
            <>
              <div className="mb-3 flex items-baseline justify-between px-1">
                <p className="kicker">{plural(total, "result")}</p>
                <p className="kicker hidden sm:block">Tuition · deadline</p>
              </div>
              <ul className="card divide-y divide-rule-soft overflow-hidden">
                {programs.map((p) => (
                  <ProgramRow
                    key={p._id}
                    program={p}
                    countries={countries}
                    cities={cities}
                    isFav={favoritesMap[p._id] ?? false}
                    isAdmin={isAdmin}
                    showOfficialToggle={isAdmin && customOnly === "true"}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
}
