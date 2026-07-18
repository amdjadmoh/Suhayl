import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePrograms, useCountries, useCities, useFavorites, useAddFavorite, useRemoveFavorite, useToggleProgramOfficial } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { useCompare } from "@/lib/compareContext";
import { DEGREE_LEVELS, COUNTRY_FLAGS } from "@/lib/constants";
import type { Program } from "@/types/program";
import type { Country } from "@/types/country";
import type { City } from "@/types/city";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Search, X, MapPin, AlertCircle, BookOpen, Calendar,
  DollarSign, GitCompare, Check, Star, Loader2, Plus,
} from "lucide-react";
import { toast } from "sonner";

function formatCurrency(amount: number, currency: string, period: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) + ` / ${period.toLowerCase()}`;
}

function formatCurrencyShort(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const verificationStyles: Record<string, string> = {
  manual: "bg-emerald-100 text-emerald-700 border-emerald-200 rounded-full",
  ai: "bg-amber-100 text-amber-700 border-amber-200 rounded-full",
  none: "bg-red-100 text-red-700 border-red-200 rounded-full",
};
const verificationLabels: Record<string, string> = {
  manual: "✓ Verified",
  ai: "⚠ AI-Verified",
  none: "⚠ Unverified",
};

function ProgramCard({
  program,
  countries,
  cities,
  favoritesMap,
  isAdmin,
  showOfficialToggle,
  onToggleFavorite,
}: {
  program: Program;
  countries: Country[] | undefined;
  cities: City[] | undefined;
  favoritesMap: Record<string, boolean>;
  isAdmin?: boolean;
  showOfficialToggle?: boolean;
  onToggleFavorite: (type: string, itemId: string, isFav: boolean) => void;
}): React.ReactElement {
  const uni = typeof program.universityId === "object" ? program.universityId : null;
  const { user } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const isStudent = user?.role === "student";
  const toggleProgOfficial = useToggleProgramOfficial();
  const inCompare = isInCompare(program._id);
  const isFav = favoritesMap[program._id] ?? false;
  const isLoggedIn = !!user;

  // Compute estimated total cost
  let estimatedTotal: string | null = null;
  if (uni) {
    const countryData = countries?.find((c) => c.name === uni.country);
    const cityData = cities?.find((c) => c.country === uni.country && c.name === uni.city);
    const livingCostYear = cityData ? cityData.monthlyLivingCost * 12 : 0;
    const visaBankAmount = countryData?.visaBankAccountAmount ?? 0;
    const tuition = program.tuitionFee;
    if (livingCostYear > 0 || visaBankAmount > 0) {
      const total = tuition + livingCostYear + visaBankAmount;
      estimatedTotal = formatCurrencyShort(total, program.tuitionCurrency) + "/year";
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#0EA5E9]/30 transition-all duration-300">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Favorite button */}
      {isLoggedIn && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite("program", program._id, isFav); }}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          title={isFav ? "Remove from saved" : "Save"}
        >
          <Star className={`h-5 w-5 ${isFav ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`} />
        </button>
      )}

      <Link to={`/programs/${program._id}`} className="block p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
          {program.isOfficial === false && (
            <Badge className="bg-purple-50 text-purple-700 border-purple-200 rounded-full">Custom</Badge>
          )}
          {program.scholarshipAvailable && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full">
              Scholarship
            </Badge>
          )}
        </div>

        <h3 className="text-lg font-semibold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors mb-2">
          {program.name}
          <Badge className={`ml-2 text-[10px] px-1.5 py-0 ${verificationStyles[program.verificationStatus || "ai"]}`}>
            {verificationLabels[program.verificationStatus || "ai"]}
          </Badge>
        </h3>

        {uni && (
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <MapPin className="h-4 w-4" />
            {uni.name}{uni.country ? ` · ${uni.country}` : ""}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 rounded-full">{program.degreeLevel}</Badge>
          <span>·</span>
          <span>{program.languageOfInstruction}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <span className="text-lg font-bold text-[#0F172A]">
                {formatCurrency(program.tuitionFee, program.tuitionCurrency, program.tuitionPeriod)}
              </span>
            </div>
            {estimatedTotal && (
              <p className="text-xs text-slate-400 mt-0.5">
                Est. total: {estimatedTotal}
              </p>
            )}
            {!estimatedTotal && (
              <p className="text-xs text-slate-400 mt-0.5">
                Est. total: tuition + living costs vary
              </p>
            )}
          </div>
          {program.applicationDeadline && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="h-3 w-3" />
              {formatDate(program.applicationDeadline)}
            </div>
          )}
        </div>
      </Link>

      {isStudent && (
        <div className="px-6 pb-4">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); inCompare ? removeFromCompare(program._id) : addToCompare(program._id); }}
            className={`inline-flex items-center gap-1.5 w-full justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              inCompare
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-[#0F172A]"
            }`}
          >
            {inCompare ? <Check className="h-3.5 w-3.5" /> : <GitCompare className="h-3.5 w-3.5" />}
            {inCompare ? "Added to Compare" : "Add to Compare"}
          </button>
        </div>
      )}
      {isAdmin && showOfficialToggle && (
        <div className="px-6 pb-4">
          <button
            onClick={async () => {
              try {
                await toggleProgOfficial.mutateAsync(program._id);
                toast.success(
                  program.isOfficial ? "Program marked as custom" : "Program marked as official",
                );
              } catch {
                toast.error("Failed to toggle official status");
              }
            }}
            disabled={toggleProgOfficial.isPending}
            className="inline-flex items-center gap-1.5 w-full justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-[#0F172A]"
          >
            {toggleProgOfficial.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : program.isOfficial ? (
              "Make Custom"
            ) : (
              "Make Official"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Programs(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [cityInput, setCityInput] = useState(searchParams.get("city") ?? "");

  const search = searchParams.get("search") ?? "";
  const degreeLevel = searchParams.get("degreeLevel") ?? "";
  const country = searchParams.get("country") ?? "";
  const field = searchParams.get("field") ?? "";
  const city = searchParams.get("city") ?? "";
  const maxTuition = searchParams.get("maxTuition") ?? "";
  const minGpa = searchParams.get("minGpa") ?? "";
  const maxIelts = searchParams.get("maxIelts") ?? "";
  const scholarshipOnly = searchParams.get("scholarshipOnly") ?? "";
  const customOnly = searchParams.get("customOnly") ?? "";

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
  if (favorites) {
    favorites.forEach((f) => { favoritesMap[f.itemId] = true; });
  }

  function handleToggleFavorite(type: string, itemId: string, isFav: boolean): void {
    if (isFav) {
      removeFav.mutate({ type, itemId });
    } else {
      addFav.mutate({ type, itemId });
    }
  }

  function updateFilter(key: string, value: string): void {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  }

  function clearFilters(): void {
    setSearchInput("");
    setCityInput("");
    setSearchParams({});
  }

  const hasFilters = search || degreeLevel || country || field || city || maxTuition || minGpa || maxIelts || scholarshipOnly || customOnly;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-[#0F172A]">Failed to load programs</h2>
        <p className="text-sm text-slate-500">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  const programs = data?.programs ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-700 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-400 blur-3xl" />
        </div>
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
            <p className="mt-2 text-blue-100">Browse academic programs across universities</p>
          </div>
          <Button asChild className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl">
            <Link to="/programs/new">
              <Plus className="mr-2 h-4 w-4" /> Add your own program
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Program name..." value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") updateFilter("search", searchInput); }}
                className="pl-9 rounded-lg border-slate-200" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">Country</Label>
            <Select value={country} onValueChange={(v) => updateFilter("country", v === "all" ? "" : v)}>
              <SelectTrigger className="rounded-lg border-slate-200"><SelectValue placeholder="All Countries" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries?.map((c) => (
                  <SelectItem key={c._id} value={c.name}>
                    {COUNTRY_FLAGS[c.name] ?? ""} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">City</Label>
            <Input placeholder="City name..." value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") updateFilter("city", cityInput); }}
              className="rounded-lg border-slate-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">Degree Level</Label>
            <Select value={degreeLevel} onValueChange={(v) => updateFilter("degreeLevel", v === "all" ? "" : v)}>
              <SelectTrigger className="rounded-lg border-slate-200"><SelectValue placeholder="All Degrees" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Degrees</SelectItem>
                {DEGREE_LEVELS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">Max Tuition (€/year)</Label>
            <Input type="number" placeholder="e.g. 50000" value={maxTuition}
              onChange={(e) => updateFilter("maxTuition", e.target.value)}
              className="rounded-lg border-slate-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">Your GPA</Label>
            <Input type="number" step="0.1" min="0" max="4" placeholder="e.g. 3.5" value={minGpa}
              onChange={(e) => updateFilter("minGpa", e.target.value)}
              className="rounded-lg border-slate-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">Your IELTS Score</Label>
            <Input type="number" step="0.5" min="0" max="9" placeholder="e.g. 6.5" value={maxIelts}
              onChange={(e) => updateFilter("maxIelts", e.target.value)}
              className="rounded-lg border-slate-200" />
          </div>
          <div className="space-y-2 flex flex-col justify-end">
            <Label className="text-xs font-medium text-slate-500">Scholarship Only</Label>
            <div className="flex items-center gap-2 h-10">
              <Checkbox id="scholarshipOnly" checked={scholarshipOnly === "true"}
                onCheckedChange={(checked) => updateFilter("scholarshipOnly", checked ? "true" : "")} />
              <Label htmlFor="scholarshipOnly" className="text-sm text-slate-600">Show only scholarships</Label>
            </div>
          </div>
          {!!user && (
            <div className="space-y-2 flex flex-col justify-end">
              <Label className="text-xs font-medium text-slate-500">{isAdmin ? "All Custom" : "My Custom"}</Label>
              <div className="flex items-center gap-2 h-10">
                <Checkbox id="customOnly" checked={customOnly === "true"}
                  onCheckedChange={(checked) => updateFilter("customOnly", checked ? "true" : "")} />
                <Label htmlFor="customOnly" className="text-sm text-slate-600">{isAdmin ? "All Custom" : "My Custom"}</Label>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3 pt-4 border-t border-slate-100">
          <Button onClick={() => { updateFilter("search", searchInput); updateFilter("city", cityInput); }}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg">
            Apply Filters
          </Button>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters} className="rounded-lg border-slate-200">
              <X className="mr-1.5 h-4 w-4" /> Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-56 rounded-2xl" />))}
        </div>
      ) : programs.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 shadow-sm border border-slate-100 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 mx-auto mb-4">
            <BookOpen className="h-10 w-10 text-indigo-500" />
          </div>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">No programs found</h2>
          <p className="text-slate-500">{hasFilters ? "Try adjusting your filters" : "No programs in the catalog yet"}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">{data?.total ?? programs.length} program{programs.length === 1 ? "" : "s"} found</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <ProgramCard key={p._id} program={p} countries={countries} cities={cities}
                favoritesMap={favoritesMap} isAdmin={isAdmin}
                showOfficialToggle={isAdmin && customOnly === "true"}
                onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
