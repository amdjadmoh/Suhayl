import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import {
  useUniversities,
  useCountries,
  useFavorites,
  useAddFavorite,
  useRemoveFavorite,
  useDeleteUniversity,
  useToggleUniversityOfficial,
} from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { cn, getErrorMessage } from "@/lib/utils";
import { plural } from "@/lib/format";
import type { University } from "@/types/university";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CountryPlate, EmptyState, ErrorState, LoadingRows, PageHeader } from "@/components/kit";
import { SavedSearches } from "@/components/SavedSearches";
import { SaveToggle } from "@/components/SaveToggle";

function Ranks({ u }: { u: University }): React.ReactElement | null {
  const ranks = [
    u.qsRank != null && `QS ${u.qsRank}`,
    u.theRank != null && `THE ${u.theRank}`,
    u.arwuRank != null && `ARWU ${u.arwuRank}`,
  ].filter(Boolean) as string[];
  if (ranks.length === 0 && u.ranking) ranks.push(`No. ${u.ranking}`);
  if (ranks.length === 0) return <span className="text-xs text-ink-4 tnum">unranked</span>;
  return (
    <span className="text-xs text-ink-2 tnum">
      {ranks.map((r, i) => (
        <span key={r}>
          {i > 0 && <span className="mx-1.5 text-ink-4">·</span>}
          {r}
        </span>
      ))}
    </span>
  );
}

function UniversityRow({
  university,
  isAdmin,
  isFav,
  showOfficialToggle,
  onToggleFavorite,
}: {
  university: University;
  isAdmin: boolean;
  isFav: boolean;
  showOfficialToggle?: boolean;
  onToggleFavorite: (type: string, itemId: string, isFav: boolean) => void;
}): React.ReactElement {
  const deleteMutation = useDeleteUniversity();
  const toggleUniOfficial = useToggleUniversityOfficial();
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete(): Promise<void> {
    try {
      await deleteMutation.mutateAsync(university._id);
      toast.success("University deleted");
      setDeleteOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete university"));
    }
  }

  return (
    <li className="grid items-center gap-x-6 gap-y-2 py-4 sm:grid-cols-[minmax(0,1fr)_14rem_auto] px-5">
      <div className="flex min-w-0 items-center gap-4">
        <CountryPlate country={university.country} />
        <div className="min-w-0">
          <Link
            to={`/universities/${university._id}`}
            className="text-[16px] leading-snug font-semibold text-ink hover:text-brand-ink"
          >
            {university.name}
          </Link>
          <p className="mt-0.5 flex items-center gap-2 text-[13px] text-ink-3">
            {university.city}, {university.country}
            {university.isOfficial === false && <Badge variant="secondary">Custom</Badge>}
          </p>
        </div>
      </div>
      <div className="pl-[46px] sm:pl-0">
        <Ranks u={university} />
      </div>
      <div className="flex items-center justify-end gap-1">
        {isAdmin && (
          <>
            {showOfficialToggle && (
              <Button
                variant="ghost"
                size="xs"
                disabled={toggleUniOfficial.isPending}
                onClick={async () => {
                  try {
                    await toggleUniOfficial.mutateAsync(university._id);
                    toast.success(university.isOfficial ? "Marked as custom" : "Marked as official");
                  } catch {
                    toast.error("Failed to toggle official status");
                  }
                }}
              >
                {university.isOfficial ? "Make custom" : "Make official"}
              </Button>
            )}
            <Button variant="ghost" size="xs" asChild>
              <Link to={`/universities/${university._id}/edit`}>Edit</Link>
            </Button>
            <Button
              variant="ghost"
              size="xs"
              className="text-stamp hover:bg-stamp-soft hover:text-stamp"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete {university.name}?</DialogTitle>
                  <DialogDescription>This removes it from the catalogue for everyone. It can't be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                    Keep it
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending && <Loader2 className="animate-spin" />}
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
        <SaveToggle saved={isFav} onToggle={() => onToggleFavorite("university", university._id, isFav)} />
      </div>
    </li>
  );
}

export default function Universities(): React.ReactElement {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isLoggedIn = !!user;
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [top100, setTop100] = useState(false);
  // Filters fold away on small screens so results come first
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get("search") ?? "";
  const country = searchParams.get("country") ?? "";
  const customOnly = searchParams.get("customOnly") ?? "";

  const { data, isLoading, isError, error } = useUniversities({
    search: search || undefined,
    country: country || undefined,
    customOnly: customOnly || undefined,
  });
  const { data: countries } = useCountries();
  const { data: favorites } = useFavorites();
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();

  const universities = useMemo(() => data?.universities ?? [], [data]);
  const filteredUniversities = useMemo(() => {
    if (!top100) return universities;
    return universities.filter((u) => u.qsRank !== null && u.qsRank !== undefined && u.qsRank <= 100);
  }, [universities, top100]);

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

  function clearFilters(): void {
    setSearchInput("");
    setSearchParams({});
    setTop100(false);
  }

  function getCurrentFilters(): Record<string, string> {
    const filters: Record<string, string> = {};
    if (search) filters["search"] = search;
    if (country) filters["country"] = country;
    if (customOnly) filters["customOnly"] = customOnly;
    return filters;
  }

  function handleApplySavedSearch(filters: Record<string, string>): void {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    setSearchParams(params);
    setSearchInput(filters["search"] ?? "");
  }

  const hasFilters = !!(search || country || customOnly || top100);
  const activeFilterCount = [searchParams.get("search"), searchParams.get("country"), searchParams.get("customOnly"), top100].filter(Boolean).length;

  if (isError) {
    return (
      <ErrorState title="Universities didn't load">{error instanceof Error ? error.message : "Unknown error"}</ErrorState>
    );
  }

  return (
    <>
      <PageHeader
        kicker={isLoading ? "Catalogue" : `Catalogue · ${plural(universities.length, "university", "universities")}`}
        title="Universities"
        actions={
          isLoggedIn && (
            <Button variant="outline" asChild>
              <Link to="/universities/new">{isAdmin ? "Add an official university" : "Add one that's missing"}</Link>
            </Button>
          )
        }
      >
        Institutions in the catalogue with their world rankings. Open one for its programs, the city, and what the visa
        asks of you.
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
                updateFilter("search", searchInput);
              }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"
            >
              <div className="space-y-1.5">
                <label htmlFor="uni-search" className="text-[13px] font-medium text-ink-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-4" />
                  <Input
                    id="uni-search"
                    placeholder="University name"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[13px] font-medium text-ink-2">Country</span>
                <Select value={country || "all"} onValueChange={(v) => updateFilter("country", v === "all" ? "" : v)}>
                  <SelectTrigger aria-label="Country">
                    <SelectValue placeholder="Anywhere" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Anywhere</SelectItem>
                    {countries?.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2.5 sm:col-span-2 lg:col-span-1">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
                  <Checkbox checked={top100} onCheckedChange={(checked) => setTop100(checked === true)} />
                  QS top 100 only
                </label>
                {isLoggedIn && (
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
                    <Checkbox
                      checked={customOnly === "true"}
                      onCheckedChange={(checked) => updateFilter("customOnly", checked ? "true" : "")}
                    />
                    {isAdmin ? "Custom entries only" : "Only ones I added"}
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

            {isLoggedIn && (
              <div className="mt-8 border-t border-rule pt-5">
                <SavedSearches
                  entityType="university"
                  currentFilters={getCurrentFilters()}
                  onApply={handleApplySavedSearch}
                  placeholder="Technical universities in the Netherlands"
                />
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          {isLoading ? (
            <LoadingRows rows={8} />
          ) : filteredUniversities.length === 0 ? (
            <EmptyState
              title={hasFilters ? "No university fits those filters" : "No universities yet"}
              action={
                hasFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className="mb-3 flex items-baseline justify-between px-1">
                <p className="kicker">{plural(filteredUniversities.length, "result")}</p>
                <p className="kicker hidden sm:block">World rankings</p>
              </div>
              <ul className="card divide-y divide-rule-soft overflow-hidden">
                {filteredUniversities.map((u) => (
                  <UniversityRow
                    key={u._id}
                    university={u}
                    isAdmin={isAdmin}
                    isFav={favoritesMap[u._id] ?? false}
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
