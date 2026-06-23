import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useUniversities, useCountries } from "@/lib/api";
import {
  STATUS_COLORS,
  COUNTRY_FLAGS,
  DEGREE_LEVELS,
  APPLICATION_STATUSES,
  SORT_OPTIONS,
} from "@/lib/constants";
import type { University } from "@/types/university";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  GraduationCap,
  MapPin,
  AlertCircle,
} from "lucide-react";

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDeadline(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function UniversityCard({
  university,
}: {
  university: University;
}): React.ReactElement {
  return (
    <Link
      to={`/universities/${university._id}`}
      className="group block rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2 text-lg">
          {COUNTRY_FLAGS[university.country] ?? "🎓"}
        </div>
        <Badge
          variant="secondary"
          className={STATUS_COLORS[university.applicationStatus]}
        >
          {university.applicationStatus}
        </Badge>
      </div>

      <h3 className="mb-1 font-semibold text-card-foreground group-hover:text-primary">
        {university.name}
      </h3>

      <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        {university.city}, {university.country}
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        {university.program} — {university.degreeLevel}
      </p>

      <div className="flex items-center justify-between border-t pt-3 text-sm">
        <span className="font-medium">
          {formatCurrency(university.tuitionFee, university.tuitionCurrency)}
          <span className="text-muted-foreground">
            /{university.tuitionPeriod.toLowerCase()}
          </span>
        </span>
        {university.applicationDeadline && (
          <span className="text-muted-foreground">
            {formatDeadline(university.applicationDeadline)}
          </span>
        )}
      </div>

      {university.ranking && (
        <div className="mt-2 text-xs text-muted-foreground">
          Ranking: #{university.ranking}
        </div>
      )}
    </Link>
  );
}

function UniversityCardSkeleton(): React.ReactElement {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-3 flex items-start justify-between">
        <Skeleton className="h-6 w-8" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="mb-2 h-4 w-1/2" />
      <Skeleton className="mb-3 h-4 w-2/3" />
      <div className="border-t pt-3">
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export default function Universities(): React.ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );

  const search = searchParams.get("search") ?? "";
  const country = searchParams.get("country") ?? "";
  const status = searchParams.get("status") ?? "";
  const degreeLevel = searchParams.get("degreeLevel") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "";

  const { data, isLoading, isError, error } = useUniversities({
    search: search || undefined,
    country: country || undefined,
    status: status || undefined,
    degreeLevel: degreeLevel || undefined,
    sortBy: sortBy || undefined,
  });
  const { data: countries } = useCountries();

  function updateFilter(key: string, value: string): void {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    setSearchParams(params);
  }

  function handleSearch(): void {
    updateFilter("search", searchInput);
  }

  function clearFilters(): void {
    setSearchInput("");
    setSearchParams({});
  }

  const hasFilters = search || country || status || degreeLevel || sortBy;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load universities</h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  const universities = data?.universities ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Universities</h1>
        <Button asChild>
          <Link to="/universities/new">Add University</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search universities..."
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={country}
            onValueChange={(v: string) => updateFilter("country", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries?.map((c) => (
                <SelectItem key={c} value={c}>
                  {COUNTRY_FLAGS[c] ?? ""} {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(v: string) => updateFilter("status", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={degreeLevel}
            onValueChange={(v: string) =>
              updateFilter("degreeLevel", v === "all" ? "" : v)
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Degrees</SelectItem>
              {DEGREE_LEVELS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(v: string) => updateFilter("sortBy", v === "none" ? "" : v)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Default</SelectItem>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <UniversityCardSkeleton key={i} />
          ))}
        </div>
      ) : universities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <GraduationCap className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="text-lg font-semibold">No universities found</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {hasFilters
              ? "Try adjusting your filters"
              : "Add your first university to get started"}
          </p>
          {!hasFilters && (
            <Button asChild>
              <Link to="/universities/new">Add University</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {data?.total ?? universities.length} universit
            {universities.length === 1 ? "y" : "ies"} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {universities.map((u) => (
              <UniversityCard key={u._id} university={u} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
