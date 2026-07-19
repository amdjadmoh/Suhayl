import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  useUniversities,
  useCountries,
  useFavorites,
  useAddFavorite,
  useRemoveFavorite,
  useSavedSearches,
  useCreateSavedSearch,
  useDeleteSavedSearch,
} from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { COUNTRY_FLAGS } from "@/lib/constants";
import type { University } from "@/types/university";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  Plus,
  GraduationCap,
  MapPin,
  AlertCircle,
  Pencil,
  Trash2,
  Star,
  Save,
  Bookmark,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDeleteUniversity, useToggleUniversityOfficial } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

function UniversityCard({
  university,
  isAdmin,
  isFav,
  isLoggedIn,
  showOfficialToggle,
  onToggleFavorite,
}: {
  university: University;
  isAdmin: boolean;
  isFav: boolean;
  isLoggedIn: boolean;
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
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete university"));
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#0EA5E9]/30 transition-all duration-300">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Favorite button */}
      {isLoggedIn && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite("university", university._id, isFav); }}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          title={isFav ? "Remove from saved" : "Save"}
        >
          <Star className={`h-5 w-5 ${isFav ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`} />
        </button>
      )}

      <div className="p-6">
        <Link to={`/universities/${university._id}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 text-2xl">
              {COUNTRY_FLAGS[university.country] ?? ""}
            </div>
            <div className="flex items-center gap-1">
              {university.isOfficial === false && (
                <Badge className="text-[10px] bg-purple-100 text-purple-700 border-purple-200 rounded-full px-2 py-0.5">Custom</Badge>
              )}
              {university.ranking && (
                <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  #{university.ranking}
                </div>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors mb-2">
            {university.name}
          </h3>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4" />
            {university.city}, {university.country}
          </div>
        </Link>

        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
            {showOfficialToggle && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl"
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
                {university.isOfficial ? "Make Custom" : "Make Official"}
              </Button>
            )}
            <Button variant="outline" size="sm" className="flex-1 rounded-xl" asChild>
              <Link to={`/universities/${university._id}/edit`}>
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl">
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete University</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete {university.name}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}

function UniversityCardSkeleton(): React.ReactElement {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export default function Universities(): React.ReactElement {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isLoggedIn = !!user;
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );

  const [top100, setTop100] = useState(false);

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

  // ─── Saved Searches ──────────────────────────────────────────────────────
  const { data: savedSearchesData } = useSavedSearches();
  const createSavedSearch = useCreateSavedSearch();
  const deleteSavedSearch = useDeleteSavedSearch();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState("");

  const savedSearches = savedSearchesData?.savedSearches?.filter(
    (s) => s.entityType === "university",
  ) ?? [];

  function handleApplySavedSearch(filters: Record<string, string>): void {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    setSearchParams(params);
    setSearchInput(filters.search ?? "");
  }

  function getCurrentFilters(): Record<string, string> {
    const filters: Record<string, string> = {};
    if (search) filters.search = search;
    if (country) filters.country = country;
    if (customOnly) filters.customOnly = customOnly;
    return filters;
  }

  async function handleSaveSearch(): Promise<void> {
    if (!saveSearchName.trim()) return;
    try {
      await createSavedSearch.mutateAsync({
        name: saveSearchName.trim(),
        entityType: "university",
        filters: getCurrentFilters(),
      });
      toast.success("Search saved");
      setSaveDialogOpen(false);
      setSaveSearchName("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save search"));
    }
  }

  async function handleDeleteSavedSearch(id: string): Promise<void> {
    try {
      await deleteSavedSearch.mutateAsync(id);
      toast.success("Saved search deleted");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete saved search"));
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

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
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  }

  function handleSearch(): void {
    updateFilter("search", searchInput);
  }

  function clearFilters(): void {
    setSearchInput("");
    setSearchParams({});
    setTop100(false);
  }

  const hasFilters = search || country || customOnly || top100;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-[#0F172A]">Failed to load universities</h2>
        <p className="text-sm text-slate-500">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  const universities = data?.universities ?? [];

  const filteredUniversities = useMemo(() => {
    if (!top100) return universities;
    return universities.filter(
      (u) => u.qsRank !== null && u.qsRank !== undefined && u.qsRank <= 100
    );
  }, [universities, top100]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-violet-400 blur-3xl" />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Universities</h1>
            <p className="mt-2 text-purple-100">Explore top institutions worldwide</p>
          </div>
          <div className="flex items-center gap-2">
            {(isLoggedIn && !isAdmin) && (
              <Button asChild className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl">
                <Link to="/universities/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Custom University
                </Link>
              </Button>
            )}
            {isAdmin && (
              <Button asChild className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl">
                <Link to="/universities/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Official
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search universities..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            className="pl-11 rounded-xl border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
          />
        </div>

        <Select
          value={country}
          onValueChange={(v) => updateFilter("country", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[180px] rounded-xl border-slate-200">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries?.map((c) => (
              <SelectItem key={c.name} value={c.name}>
                {COUNTRY_FLAGS[c.name] ?? ""} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoggedIn && (
          <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-200 bg-white">
            <Checkbox
              id="customOnly"
              checked={customOnly === "true"}
              onCheckedChange={(checked) => updateFilter("customOnly", checked ? "true" : "")}
            />
            <Label htmlFor="customOnly" className="text-sm text-slate-600 whitespace-nowrap cursor-pointer">
              {isAdmin ? "All Custom Programs" : "My Custom Only"}
            </Label>
          </div>
        )}

        <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-200 bg-white">
          <Checkbox
            id="top100"
            checked={top100}
            onCheckedChange={(checked) => setTop100(checked === true)}
          />
          <Label htmlFor="top100" className="text-sm text-slate-600 whitespace-nowrap cursor-pointer">
            Top 100 globally
          </Label>
        </div>

        {hasFilters && (
          <Button variant="outline" size="icon" onClick={clearFilters} className="rounded-xl">
            <X className="h-4 w-4" />
          </Button>
        )}

        {isLoggedIn && (
          <>
            {/* Save Search */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
                  <Save className="mr-1.5 h-4 w-4" /> Save Search
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Save Search</DialogTitle>
                  <DialogDescription>
                    Name this search to easily load it later.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  placeholder="e.g., Top US Universities"
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveSearch(); }}
                  className="rounded-lg border-slate-200"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveSearch} disabled={!saveSearchName.trim() || createSavedSearch.isPending}>
                    {createSavedSearch.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Saved Searches Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-xl border border-slate-200">
                  <Bookmark className="mr-1.5 h-4 w-4" />
                  Saved Searches
                  {savedSearches.length > 0 && (
                    <span className="ml-1 text-xs text-slate-400">({savedSearches.length})</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Saved Searches</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {savedSearches.length === 0 ? (
                  <DropdownMenuItem disabled className="text-slate-400">No saved searches</DropdownMenuItem>
                ) : (
                  savedSearches.map((s) => (
                    <div key={s._id} className="flex items-center justify-between px-2 py-1 group">
                      <button
                        className="flex-1 text-left text-sm py-1 hover:text-[#0EA5E9] transition-colors"
                        onClick={() => handleApplySavedSearch(s.filters)}
                      >
                        {s.name}
                      </button>
                      <button
                        onClick={() => handleDeleteSavedSearch(s._id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <UniversityCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredUniversities.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 shadow-sm border border-slate-100 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 mx-auto mb-4">
            <GraduationCap className="h-10 w-10 text-violet-500" />
          </div>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">No universities found</h2>
          <p className="text-slate-500">
            {hasFilters ? "Try adjusting your filters" : "No universities in the catalog yet"}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {filteredUniversities.length} universit{filteredUniversities.length === 1 ? "y" : "ies"} found
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUniversities.map((u) => (
              <UniversityCard key={u._id} university={u} isAdmin={isAdmin}
                isFav={favoritesMap[u._id] ?? false} isLoggedIn={isLoggedIn}
                showOfficialToggle={isAdmin && customOnly === "true"}
                onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
