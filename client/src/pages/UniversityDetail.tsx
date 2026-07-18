import { useNavigate, useParams, Link } from "react-router-dom";
import { useUniversity, useDeleteUniversity, useProgramsByUniversity, useDeleteProgram, useCountries, useCitiesByCountry, useToggleUniversityOfficial, useToggleProgramOfficial } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Globe,
  AlertCircle,
  Loader2,
  PlusCircle,
  GraduationCap,
  BookOpen,
  Calendar,
  Search,
  X,
  Check,
  Shield,
} from "lucide-react";
import { useState, useMemo } from "react";
import { getErrorMessage } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Program } from "@/types/program";

function formatCurrency(amount: number, currency: string, period: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount) + ` / ${period.toLowerCase()}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UniversityDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: university, isLoading, isError, error } = useUniversity(id ?? "");
  const { data: programs, isLoading: progLoading } = useProgramsByUniversity(id ?? "");
  const { data: countries } = useCountries();
  const { data: cities } = useCitiesByCountry(university?.country ?? "");
  const deleteMutation = useDeleteUniversity();
  const deleteProgramMutation = useDeleteProgram();
  const toggleOfficial = useToggleUniversityOfficial();
  const toggleProgOfficial = useToggleProgramOfficial();
  const [deleteProgOpen, setDeleteProgOpen] = useState<string | null>(null);
  const isLoggedIn = !!user;

  async function handleToggleOfficial(): Promise<void> {
    if (!id) return;
    try {
      await toggleOfficial.mutateAsync(id);
      toast.success(`University is now ${university?.isOfficial ? "custom" : "official"}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to toggle"));
    }
  }

  // Program filters
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDegree, setFilterDegree] = useState<string>("all");
  const [filterMaxTuition, setFilterMaxTuition] = useState("");
  const [filterScholarship, setFilterScholarship] = useState(false);

  const filteredPrograms = useMemo(() => {
    if (!programs) return [];
    return programs.filter((p) => {
      if (filterSearch && !p.name.toLowerCase().includes(filterSearch.toLowerCase())) return false;
      if (filterDegree && filterDegree !== "all" && p.degreeLevel !== filterDegree) return false;
      if (filterMaxTuition && p.tuitionFee > Number(filterMaxTuition)) return false;
      if (filterScholarship && !p.scholarshipAvailable) return false;
      return true;
    });
  }, [programs, filterSearch, filterDegree, filterMaxTuition, filterScholarship]);

  function clearFilters(): void {
    setFilterSearch("");
    setFilterDegree("all");
    setFilterMaxTuition("");
    setFilterScholarship(false);
  }

  async function handleDelete(): Promise<void> {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("University deleted");
      navigate("/universities");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete university"));
    }
  }

  async function handleDeleteProgram(programId: string): Promise<void> {
    try {
      await deleteProgramMutation.mutateAsync(programId);
      toast.success("Program deleted");
      setDeleteProgOpen(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete program"));
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !university) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-[#0F172A]">
          {isError ? "Failed to load university" : "University not found"}
        </h2>
        <p className="text-sm text-slate-500">
          {error instanceof Error ? error.message : ""}
        </p>
        <button onClick={() => navigate("/universities")} className="mt-4 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
          Back to Universities
        </button>
      </div>
    );
  }

  const u = university;
  const country = countries?.find((c) => c.name === u.country);
  const city = cities?.find((c) => c.name === u.city);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/universities")} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">{u.name}</h1>
            <p className="text-sm text-slate-500">{u.city}, {u.country}</p>
            {u.ranking && <p className="text-xs text-slate-400">Ranking: #{u.ranking}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(isLoggedIn && !isAdmin) && (
            <Link to={`/programs/new?universityId=${u._id}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors">
              <PlusCircle className="h-4 w-4" /> Add Custom Program
            </Link>
          )}
          {isAdmin && (
            <>
              <Link to={`/universities/${u._id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors">
                <Pencil className="h-4 w-4" /> Edit
              </Link>
              <Button onClick={handleToggleOfficial} variant="outline" size="sm" disabled={toggleOfficial.isPending} className="border-slate-200 rounded-lg">
                {toggleOfficial.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Shield className="mr-1 h-3 w-3" />}
                {u.isOfficial ? "Make Custom" : "Make Official"}
              </Button>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium transition-colors text-red-500 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete University</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete {u.name}? This will also delete all its programs and applications.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* University Info */}
      <div className="rounded-xl border border-slate-100 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
            <GraduationCap className="h-5 w-5 text-slate-400" /> About {u.name}
          </h3>
        </div>
        <div className="p-6">
          {u.websiteUrl && (
            <div className="mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" />
              <a href={u.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0EA5E9] hover:underline">
                Visit Website
              </a>
            </div>
          )}
          {u.notes && <p className="text-sm text-slate-500">{u.notes}</p>}
          {!u.websiteUrl && !u.notes && (
            <p className="text-sm text-slate-500">No additional information available.</p>
          )}
        </div>
      </div>

      {/* Visa Info */}
      {country && (
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <Globe className="h-5 w-5 text-slate-400" /> Visa Info — {u.country}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">Bank Account</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: country.currency, minimumFractionDigits: 0 }).format(country.visaBankAccountAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Account Type</p>
                <Badge className={
                  country.visaBankAccountLocked ? "rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700" : "rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700"
                }>
                  {country.visaBankAccountLocked ? "Blocked Account" : "Regular Account"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500">Living Cost / Mo</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: country.currency, minimumFractionDigits: 0 }).format(country.livingCostEstimate)}
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 my-4" />
            <p className="mb-2 text-xs text-slate-500">Visa Details</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              {country.visaType && (
                <div>
                  <span className="text-slate-500">Type: </span>
                  <span className="font-medium text-[#0F172A]">{country.visaType}</span>
                </div>
              )}
              {country.processingTime && (
                <div>
                  <span className="text-slate-500">Processing: </span>
                  <span className="font-medium text-[#0F172A]">{country.processingTime}</span>
                </div>
              )}
              {country.workPermit && (
                <div>
                  <span className="text-slate-500">Work Permit: </span>
                  <span className="font-medium text-[#0F172A]">{country.workPermit}</span>
                </div>
              )}
              {country.postGraduationVisa && (
                <div>
                  <span className="text-slate-500">Post-Grad: </span>
                  <span className="font-medium text-[#0F172A]">{country.postGraduationVisa}</span>
                </div>
              )}
              {country.proofOfFundsMonthly != null && country.proofOfFundsMonthly > 0 && (
                <div>
                  <span className="text-slate-500">Funds/Mo: </span>
                  <span className="font-medium text-[#0F172A]">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: country.currency, minimumFractionDigits: 0 }).format(country.proofOfFundsMonthly)}
                  </span>
                </div>
              )}
              {country.whereToApply && (
                <div>
                  <span className="text-slate-500">Apply at: </span>
                  <span className="font-medium text-[#0F172A]">{country.whereToApply}</span>
                </div>
              )}
            </div>
            {country.additionalVisaNotes && (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{country.additionalVisaNotes}</p>
            )}
          </div>
        </div>
      )}

      {/* City Info */}
      {city && (
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <GraduationCap className="h-5 w-5 text-slate-400" /> City Info — {city.name}{city.isCapital ? " ★" : ""}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">Monthly Living Cost</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  ${city.monthlyLivingCost.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Rent (Single)</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  ${city.averageRentSingle.toLocaleString()}
                  <span className="text-sm text-slate-400 font-normal">/mo</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Rent (Shared)</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  ${city.averageRentShared.toLocaleString()}
                  <span className="text-sm text-slate-400 font-normal">/mo</span>
                </p>
              </div>
              {city.population && (
                <div>
                  <p className="text-xs text-slate-500">Population</p>
                  <p className="text-2xl font-bold text-[#0F172A]">
                    {(city.population / 1000000).toFixed(1)}M
                  </p>
                </div>
              )}
            </div>
            <div className="border-t border-slate-100 my-4" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Quality of Life</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${city.qualityOfLifeScore * 10}%` }} />
                  </div>
                  <span className="text-sm font-medium">{city.qualityOfLifeScore}/10</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Safety</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${city.safetyScore * 10}%` }} />
                  </div>
                  <span className="text-sm font-medium">{city.safetyScore}/10</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Public Transport</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${city.publicTransportScore * 10}%` }} />
                  </div>
                  <span className="text-sm font-medium">{city.publicTransportScore}/10</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Student Friendliness</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${city.studentFriendliness * 10}%` }} />
                  </div>
                  <span className="text-sm font-medium">{city.studentFriendliness}/10</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">English Friendliness</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${city.englishFriendliness * 10}%` }} />
                  </div>
                  <span className="text-sm font-medium">{city.englishFriendliness}/10</span>
                </div>
              </div>
              {city.internetSpeed && (
                <div>
                  <p className="text-xs text-slate-500">Internet Speed</p>
                  <p className="text-sm font-medium">{city.internetSpeed} Mbps</p>
                </div>
              )}
            </div>
            <div className="border-t border-slate-100 my-4" />
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div>
                <span className="text-slate-500">Language: </span>
                <span className="font-medium text-[#0F172A]">{city.language}</span>
              </div>
              <div>
                <span className="text-slate-500">Climate: </span>
                <span className="font-medium text-[#0F172A]">{city.climate}</span>
              </div>
            </div>
            {(city.pros.length > 0 || city.cons.length > 0) && (
              <>
                <div className="border-t border-slate-100 my-4" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {city.pros.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">Pros</p>
                      <ul className="space-y-1">
                        {city.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                            <span className="mt-0.5 shrink-0 text-emerald-500">+</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {city.cons.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-500">Cons</p>
                      <ul className="space-y-1">
                        {city.cons.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                            <span className="mt-0.5 shrink-0 text-red-400">-</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Programs */}
      <div className="rounded-xl border border-slate-100 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
            <BookOpen className="h-5 w-5 text-slate-400" /> Programs ({filteredPrograms.length}{programs && filteredPrograms.length !== programs.length ? ` of ${programs.length}` : ""})
          </h3>
          {(isLoggedIn && !isAdmin) && (
            <Link to={`/programs/new?universityId=${u._id}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors">
              <PlusCircle className="h-4 w-4" /> Add Custom Program
            </Link>
          )}
        </div>
        <div className="p-6">
          {/* Filters */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4 pb-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search programs..."
                className="pl-8 rounded-lg border-slate-200 text-sm h-9"
              />
            </div>
            <Select value={filterDegree} onValueChange={setFilterDegree}>
              <SelectTrigger className="rounded-lg text-sm h-9"><SelectValue placeholder="Degree Level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Bachelor">Bachelor</SelectItem>
                <SelectItem value="Master">Master</SelectItem>
                <SelectItem value="PhD">PhD</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={filterMaxTuition}
              onChange={(e) => setFilterMaxTuition(e.target.value)}
              placeholder="Max tuition (€/yr)"
              className="rounded-lg border-slate-200 text-sm h-9"
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="filter-scholarship" checked={filterScholarship} onCheckedChange={(c) => setFilterScholarship(c === true)} />
                <Label htmlFor="filter-scholarship" className="text-sm text-slate-600 cursor-pointer">Scholarship</Label>
              </div>
              {(filterSearch || filterDegree !== "all" || filterMaxTuition || filterScholarship) && (
                <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {progLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredPrograms.length > 0 ? (
            <div className="space-y-3">
              {filteredPrograms.map((p) => (
                <ProgramCard key={p._id} program={p} isAdmin={isAdmin}
                  onDelete={() => handleDeleteProgram(p._id)}
                  deleteOpen={deleteProgOpen === p._id}
                  setDeleteOpen={(o) => setDeleteProgOpen(o ? p._id : null)}
                  deletePending={deleteProgramMutation.isPending}
                />
              ))}
            </div>
          ) : programs && programs.length > 0 ? (
            <div className="flex flex-col items-center py-10 text-center text-slate-500">
              <Search className="mb-3 h-10 w-10 text-slate-300" />
              <p>No programs match your filters</p>
              <button onClick={clearFilters} className="mt-2 text-sm text-[#0EA5E9] hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center text-slate-500">
              <GraduationCap className="mb-3 h-12 w-12 text-slate-300" />
              <p>No programs added yet</p>
                {(isLoggedIn && !isAdmin) && (
                  <Link to={`/programs/new?universityId=${u._id}`} className="mt-3 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors">
                    <PlusCircle className="h-4 w-4" /> Add Custom Program
                  </Link>
                )}
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        Created {new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · Updated {new Date(u.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
  );
}

function ProgramCard({ program, isAdmin, onDelete, deleteOpen, setDeleteOpen, deletePending }: {
  program: Program;
  isAdmin: boolean;
  onDelete: () => void;
  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  deletePending: boolean;
}): React.ReactElement {
  const { mutate: toggleProg, isPending: togglingProg } = useToggleProgramOfficial();
  return (
    <div className="rounded-lg border border-slate-100 p-4 transition-all hover:border-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link to={`/programs/${program._id}`} className="font-semibold text-[#0F172A] hover:text-[#0EA5E9]">
              {program.name}
            </Link>
            {program.isOfficial === false && (
              <Badge className="text-[10px] bg-purple-100 text-purple-700 border-purple-200 rounded-full px-2 py-0">Custom</Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            <span>{program.degreeLevel}</span>
            <span>·</span>
            <span>{program.languageOfInstruction}</span>
            <span>·</span>
            <span>{formatCurrency(program.tuitionFee, program.tuitionCurrency, program.tuitionPeriod)}</span>
            {program.applicationDeadline && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(program.applicationDeadline)}
                </span>
              </>
            )}
          </div>
          {program.scholarshipAvailable && (
            <Badge className="mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">Scholarship Available</Badge>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          {!isAdmin && (
            <Link to={`/applications/new?programId=${program._id}`} className="inline-flex items-center rounded-xl bg-[#0EA5E9] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0284C7]">
              Apply
            </Link>
          )}
          {isAdmin && (
            <>
              <Link to={`/programs/${program._id}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors">
                View
              </Link>
              <button
                onClick={() => toggleProg(program._id)}
                disabled={togglingProg}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
                title={program.isOfficial ? "Make Custom" : "Make Official"}
              >
                {togglingProg ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
              </button>
              <Link to={`/programs/${program._id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <Pencil className="h-3.5 w-3.5 text-slate-500" />
              </Link>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-red-500 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Program</DialogTitle>
                    <DialogDescription>Are you sure you want to delete "{program.name}"?</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={onDelete} disabled={deletePending}>
                      {deletePending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
