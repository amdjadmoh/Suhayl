import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useUniversities, useCountries } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import {
  COUNTRY_FLAGS,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  GraduationCap,
  MapPin,
  AlertCircle,
  Pencil,
  Trash2,
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
import { useDeleteUniversity } from "@/lib/api";

function UniversityCard({
  university,
  isAdmin,
}: {
  university: University;
  isAdmin: boolean;
}): React.ReactElement {
  const deleteMutation = useDeleteUniversity();
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete(): Promise<void> {
    try {
      await deleteMutation.mutateAsync(university._id);
      toast.success("University deleted");
    } catch {
      toast.error("Failed to delete university");
    }
  }

  return (
    <div className="group block rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md">
      <Link to={`/universities/${university._id}`}>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2 text-lg">
            {COUNTRY_FLAGS[university.country] ?? "🎓"}
          </div>
        </div>

        <h3 className="mb-1 font-semibold text-card-foreground group-hover:text-primary">
          {university.name}
        </h3>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {university.city}, {university.country}
        </div>

        {university.ranking && (
          <div className="mt-2 text-xs text-muted-foreground">
            Ranking: #{university.ranking}
          </div>
        )}
      </Link>

      {isAdmin && (
        <div className="mt-3 flex items-center gap-2 border-t pt-3">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/universities/${university._id}/edit`}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 text-destructive">
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
  );
}

function UniversityCardSkeleton(): React.ReactElement {
  return (
    <div className="rounded-xl border bg-card p-5">
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export default function Universities(): React.ReactElement {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );

  const search = searchParams.get("search") ?? "";
  const country = searchParams.get("country") ?? "";

  const { data, isLoading, isError, error } = useUniversities({
    search: search || undefined,
    country: country || undefined,
  });
  const { data: countries } = useCountries();

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
  }

  const hasFilters = search || country;

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
        {isAdmin && (
          <Button asChild>
            <Link to="/universities/new">Add University</Link>
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search universities..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              className="pl-9"
            />
          </div>

          <Select
            value={country}
            onValueChange={(v) => updateFilter("country", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[160px]">
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

          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} className="h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

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
            {hasFilters ? "Try adjusting your filters" : "No universities in the catalog yet"}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {data?.total ?? universities.length} universit{universities.length === 1 ? "y" : "ies"} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {universities.map((u) => (
              <UniversityCard key={u._id} university={u} isAdmin={isAdmin} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
