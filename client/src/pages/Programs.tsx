import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePrograms, useCountries } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { useCompare } from "@/lib/compareContext";
import { DEGREE_LEVELS, FIELD_CATEGORIES, COUNTRY_FLAGS } from "@/lib/constants";
import type { Program } from "@/types/program";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Search, X, MapPin, AlertCircle, BookOpen, Calendar,
  DollarSign, GitCompare, Check,
} from "lucide-react";

function formatCurrency(amount: number, currency: string, period: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) + ` / ${period.toLowerCase()}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ProgramCard({ program }: { program: Program }): React.ReactElement {
  const uni = typeof program.universityId === "object" ? program.universityId : null;
  const { user } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const isStudent = user?.role === "student";
  const inCompare = isInCompare(program._id);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#0EA5E9]/30 transition-all duration-300">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <Link to={`/programs/${program._id}`} className="block p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
          {program.scholarshipAvailable && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full">
              Scholarship
            </Badge>
          )}
        </div>

        <h3 className="text-lg font-semibold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors mb-2">
          {program.name}
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
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span className="text-lg font-bold text-[#0F172A]">
              {formatCurrency(program.tuitionFee, program.tuitionCurrency, program.tuitionPeriod)}
            </span>
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
    </div>
  );
}

export default function Programs(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  const search = searchParams.get("search") ?? "";
  const degreeLevel = searchParams.get("degreeLevel") ?? "";
  const country = searchParams.get("country") ?? "";
  const field = searchParams.get("field") ?? "";

  const { data, isLoading, isError, error } = usePrograms({
    search: search || undefined,
    degreeLevel: degreeLevel || undefined,
    country: country || undefined,
    field: field || undefined,
  });
  const { data: countries } = useCountries();

  function updateFilter(key: string, value: string): void {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  }

  const hasFilters = search || degreeLevel || country || field;

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
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="mt-2 text-blue-100">Browse academic programs across universities</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search programs..." value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") updateFilter("search", searchInput); }}
            className="pl-11 rounded-xl border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" />
        </div>
        <Select value={country} onValueChange={(v) => updateFilter("country", v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px] rounded-xl border-slate-200"><SelectValue placeholder="Country" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries?.map((c) => (
              <SelectItem key={c._id} value={c.name}>
                {COUNTRY_FLAGS[c.name] ?? ""} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={degreeLevel} onValueChange={(v) => updateFilter("degreeLevel", v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px] rounded-xl border-slate-200"><SelectValue placeholder="Degree" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Degrees</SelectItem>
            {DEGREE_LEVELS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={field} onValueChange={(v) => updateFilter("field", v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px] rounded-xl border-slate-200"><SelectValue placeholder="Field" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fields</SelectItem>
            {FIELD_CATEGORIES.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="outline" size="icon" onClick={() => { setSearchInput(""); setSearchParams({}); }} className="rounded-xl">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-48 rounded-2xl" />))}
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
            {programs.map((p) => (<ProgramCard key={p._id} program={p} />))}
          </div>
        </>
      )}
    </div>
  );
}
