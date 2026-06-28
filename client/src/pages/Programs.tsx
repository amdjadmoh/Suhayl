import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePrograms, useCountries } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { DEGREE_LEVELS, COUNTRY_FLAGS } from "@/lib/constants";
import type { Program } from "@/types/program";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Search, X, GraduationCap, MapPin, AlertCircle, BookOpen, DollarSign, Calendar,
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
  return (
    <Link to={`/programs/${program._id}`}
      className="group block rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md">
      <div className="mb-1 flex items-start justify-between">
        <h3 className="font-semibold text-card-foreground group-hover:text-primary">{program.name}</h3>
      </div>
      {uni && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="h-3 w-3" />
          {uni.name}{uni.country ? ` · ${uni.country}` : ""}
        </p>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
        <span>{program.degreeLevel}</span>
        <span>·</span>
        <span>{program.languageOfInstruction}</span>
      </div>
      <div className="flex items-center justify-between border-t pt-3 text-sm">
        <span className="font-medium">{formatCurrency(program.tuitionFee, program.tuitionCurrency, program.tuitionPeriod)}</span>
        {program.applicationDeadline && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(program.applicationDeadline)}
          </span>
        )}
      </div>
      {program.scholarshipAvailable && (
        <div className="mt-2">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">Scholarship Available</Badge>
        </div>
      )}
    </Link>
  );
}

export default function Programs(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  const search = searchParams.get("search") ?? "";
  const degreeLevel = searchParams.get("degreeLevel") ?? "";

  const { data, isLoading, isError, error } = usePrograms({
    search: search || undefined,
    degreeLevel: degreeLevel || undefined,
  });

  function updateFilter(key: string, value: string): void {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  }

  const hasFilters = search || degreeLevel;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load programs</h2>
        <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  const programs = data?.programs ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Programs</h1>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search programs..." value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") updateFilter("search", searchInput); }}
            className="pl-9" />
        </div>
        <Select value={degreeLevel} onValueChange={(v) => updateFilter("degreeLevel", v === "all" ? "" : v)}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Degree" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Degrees</SelectItem>
            {DEGREE_LEVELS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={() => { setSearchInput(""); setSearchParams({}); }} className="h-9 w-9">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-40 rounded-xl" />))}
        </div>
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <BookOpen className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="text-lg font-semibold">No programs found</h2>
          <p className="text-sm text-muted-foreground">{hasFilters ? "Try adjusting your filters" : "No programs in the catalog yet"}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{data?.total ?? programs.length} program{programs.length === 1 ? "" : "s"} found</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (<ProgramCard key={p._id} program={p} />))}
          </div>
        </>
      )}
    </div>
  );
}
