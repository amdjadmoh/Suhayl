import { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import ReviewsSection from "@/components/ReviewsSection";
import {
  useUniversity,
  useDeleteUniversity,
  useProgramsByUniversity,
  useDeleteProgram,
  useCountries,
  useCitiesByCountry,
  useToggleUniversityOfficial,
  useToggleProgramOfficial,
} from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { getErrorMessage } from "@/lib/utils";
import { formatDate, formatMoney, formatTuition } from "@/lib/format";
import type { Program } from "@/types/program";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BackLink, Cons, CountryPlate, DaysLeft, ErrorState, Fact, Facts, LoadingPage, PageHeader, Pros, ScoreLine, Section,
} from "@/components/kit";

function RankFigure({ label, value }: { label: string; value?: number | null }): React.ReactElement {
  return (
    <div className="card-soft px-4 py-3">
      <p className="kicker">{label}</p>
      <p className="mt-1 text-[24px] leading-none font-bold tnum tracking-[-0.02em]">
        {value != null ? value : <span className="text-base text-ink-4">—</span>}
      </p>
    </div>
  );
}

export default function UniversityDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isLoggedIn = !!user;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProgOpen, setDeleteProgOpen] = useState<string | null>(null);

  const { data: university, isLoading, isError, error } = useUniversity(id ?? "");
  const { data: programs, isLoading: progLoading } = useProgramsByUniversity(id ?? "");
  const { data: countries } = useCountries();
  const { data: cities } = useCitiesByCountry(university?.country ?? "");
  const deleteMutation = useDeleteUniversity();
  const deleteProgramMutation = useDeleteProgram();
  const toggleOfficial = useToggleUniversityOfficial();

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

  const hasProgramFilters = !!(filterSearch || filterDegree !== "all" || filterMaxTuition || filterScholarship);

  function clearFilters(): void {
    setFilterSearch("");
    setFilterDegree("all");
    setFilterMaxTuition("");
    setFilterScholarship(false);
  }

  async function handleToggleOfficial(): Promise<void> {
    if (!id) return;
    try {
      await toggleOfficial.mutateAsync(id);
      toast.success(`Now ${university?.isOfficial ? "custom" : "official"}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to toggle"));
    }
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

  if (isLoading) return <LoadingPage />;

  if (isError || !university) {
    return (
      <ErrorState
        title={isError ? "This university didn't load" : "University not found"}
        action={<Button variant="outline" onClick={() => navigate("/universities")}>Back to universities</Button>}
      >
        {error instanceof Error ? error.message : undefined}
      </ErrorState>
    );
  }

  const u = university;
  const country = countries?.find((c) => c.name === u.country);
  const city = cities?.find((c) => c.name === u.city);
  const currency = country?.currency ?? "EUR";
  const isCreator = !!user && u.createdBy === user._id;
  const canEdit = isAdmin || (isCreator && !u.isOfficial);

  return (
    <>
      <PageHeader
        back={<BackLink to="/universities">Universities</BackLink>}
        kicker={
          <span className="inline-flex items-center gap-2">
            <CountryPlate country={u.country} className="h-6 min-w-6 rounded-md text-[10px]" /> {u.city}, {u.country}
            {u.isOfficial === false && <Badge variant="secondary">Custom</Badge>}
          </span>
        }
        title={u.name}
        actions={
          <>
            {isLoggedIn && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/programs/new?universityId=${u._id}`}>{isAdmin ? "Add official program" : "Add a program"}</Link>
              </Button>
            )}
            {canEdit && (
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/universities/${u._id}/edit`}>Edit</Link>
              </Button>
            )}
            {isAdmin && (
              <>
                <Button variant="ghost" size="sm" onClick={handleToggleOfficial} disabled={toggleOfficial.isPending}>
                  {toggleOfficial.isPending && <Loader2 className="animate-spin" />}
                  {u.isOfficial ? "Make custom" : "Make official"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-stamp hover:bg-stamp-soft hover:text-stamp"
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </Button>
              </>
            )}
          </>
        }
      >
        {u.websiteUrl ? (
          <a href={u.websiteUrl} target="_blank" rel="noopener noreferrer" className="link-ink">
            {u.websiteUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")} ↗
          </a>
        ) : null}
      </PageHeader>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {u.name}?</DialogTitle>
            <DialogDescription>Its programs and every application to them are deleted too. This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="animate-spin" />}
              Delete university
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-10">
          {u.notes && (
            <p className="max-w-prose text-[16px] leading-[1.65] whitespace-pre-wrap text-ink-2">{u.notes}</p>
          )}

          <Section
            title="Programs"
            count={programs ? filteredPrograms.length : undefined}
            action={
              hasProgramFilters && (
                <button type="button" onClick={clearFilters} className="link-ink text-[13px]">
                  Clear filters
                </button>
              )
            }
          >
            {programs && programs.length > 2 && (
              <div className="mb-2 grid gap-2 pt-1 sm:grid-cols-[minmax(0,1fr)_9rem_9rem_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-4" />
                  <Input
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="Filter by name"
                    className="h-8 pl-8"
                    aria-label="Filter programs by name"
                  />
                </div>
                <Select value={filterDegree} onValueChange={setFilterDegree}>
                  <SelectTrigger size="sm" aria-label="Degree level">
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any level</SelectItem>
                    <SelectItem value="Bachelor">Bachelor</SelectItem>
                    <SelectItem value="Master">Master</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={filterMaxTuition}
                  onChange={(e) => setFilterMaxTuition(e.target.value)}
                  placeholder="Max € / year"
                  className="h-8 text-xs tnum"
                  aria-label="Maximum tuition"
                />
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-2">
                  <Checkbox checked={filterScholarship} onCheckedChange={(c) => setFilterScholarship(c === true)} />
                  Scholarship
                </label>
              </div>
            )}

            {progLoading ? (
              <p className="py-6 text-sm text-ink-3">Loading programs…</p>
            ) : filteredPrograms.length > 0 ? (
              <ul className="card divide-y divide-rule-soft overflow-hidden">
                {filteredPrograms.map((p) => (
                  <ProgramLine
                    key={p._id}
                    program={p}
                    isAdmin={isAdmin}
                    onDelete={() => handleDeleteProgram(p._id)}
                    deleteOpen={deleteProgOpen === p._id}
                    setDeleteOpen={(o) => setDeleteProgOpen(o ? p._id : null)}
                    deletePending={deleteProgramMutation.isPending}
                  />
                ))}
              </ul>
            ) : programs && programs.length > 0 ? (
              <p className="card-soft px-5 py-5 text-sm text-ink-3">No program matches those filters.</p>
            ) : (
              <div className="py-6">
                <p className="text-sm text-ink-3">No programs listed here yet.</p>
                {isLoggedIn && !isAdmin && (
                  <p className="mt-1 text-sm text-ink-3">
                    Found one on their website?{" "}
                    <Link to={`/programs/new?universityId=${u._id}`} className="link-ink">
                      Add it yourself
                    </Link>{" "}
                    — it stays private to you.
                  </p>
                )}
              </div>
            )}
          </Section>

          <ReviewsSection targetType="university" targetId={u._id} />
        </div>

        <aside className="space-y-9">
          <div>
            <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">World rankings</p>
            <div className="grid grid-cols-3 gap-2">
              <RankFigure label="QS" value={u.qsRank} />
              <RankFigure label="THE" value={u.theRank} />
              <RankFigure label="ARWU" value={u.arwuRank} />
            </div>
          </div>

          {city && (
            <div>
              <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">
                Living in {city.name}
                {city.isCapital ? " · capital" : ""}
              </p>
              <Facts className="card px-5 py-1">
                <Fact label="Living costs">{formatMoney(city.monthlyLivingCost, currency)} / mo</Fact>
                <Fact label="Room, shared">{formatMoney(city.averageRentShared, currency)} / mo</Fact>
                <Fact label="Flat, alone">{formatMoney(city.averageRentSingle, currency)} / mo</Fact>
                {city.population ? <Fact label="Population">{(city.population / 1_000_000).toFixed(1)} M</Fact> : null}
                <Fact label="Language">{city.language}</Fact>
                <Fact label="Climate">{city.climate}</Fact>
                {city.internetSpeed ? <Fact label="Internet">{city.internetSpeed} Mbps</Fact> : null}
              </Facts>
              <div className="card mt-3 px-5 py-2">
                <ScoreLine label="Quality of life" value={city.qualityOfLifeScore} />
                <ScoreLine label="Safety" value={city.safetyScore} />
                <ScoreLine label="Transport" value={city.publicTransportScore} />
                <ScoreLine label="Student life" value={city.studentFriendliness} />
                <ScoreLine label="English spoken" value={city.englishFriendliness} />
              </div>
              {(city.pros.length > 0 || city.cons.length > 0) && (
                <div className="mt-4 space-y-4">
                  <Pros items={city.pros} />
                  <Cons items={city.cons} />
                </div>
              )}
              <Link to={`/cities/${city._id}`} className="link-ink mt-4 inline-block text-[13px]">
                More about {city.name}
              </Link>
            </div>
          )}

          {country && (
            <div>
              <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">Visa for {u.country}</p>
              <Facts className="card px-5 py-1">
                <Fact label={country.visaBankAccountLocked ? "Blocked account" : "Funds to show"}>
                  {formatMoney(country.visaBankAccountAmount, country.currency)}
                </Fact>
                {country.proofOfFundsMonthly != null && country.proofOfFundsMonthly > 0 && (
                  <Fact label="Per month">{formatMoney(country.proofOfFundsMonthly, country.currency)}</Fact>
                )}
                <Fact label="Living, est.">{formatMoney(country.livingCostEstimate, country.currency)} / mo</Fact>
                <Fact label="Visa">{country.visaType}</Fact>
                <Fact label="Processing">{country.processingTime}</Fact>
                <Fact label="Work">{country.workPermit}</Fact>
                <Fact label="After graduating">{country.postGraduationVisa}</Fact>
              </Facts>
              {country.additionalVisaNotes && (
                <p className="mt-3 text-[13px] leading-relaxed text-ink-3">{country.additionalVisaNotes}</p>
              )}
              <Link to={`/countries/${country._id}`} className="link-ink mt-4 inline-block text-[13px]">
                Full visa notes
              </Link>
            </div>
          )}
        </aside>
      </div>

      <p className="mt-12 text-xs text-ink-4 tnum">
        Added {formatDate(u.createdAt)} · updated {formatDate(u.updatedAt)}
      </p>
    </>
  );
}

function ProgramLine({
  program,
  isAdmin,
  onDelete,
  deleteOpen,
  setDeleteOpen,
  deletePending,
}: {
  program: Program;
  isAdmin: boolean;
  onDelete: () => void;
  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  deletePending: boolean;
}): React.ReactElement {
  const { mutate: toggleProg, isPending: togglingProg } = useToggleProgramOfficial();
  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 px-5">
      <div className="min-w-0 flex-1">
        <Link
          to={`/programs/${program._id}`}
          className="font-medium text-ink hover:text-brand-ink"
        >
          {program.name}
        </Link>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-3">
          <span>{program.degreeLevel}</span>
          <span className="text-ink-4">·</span>
          <span>{program.languageOfInstruction}</span>
          <span className="text-ink-4">·</span>
          <span className="text-xs text-ink-2 tnum">
            {formatTuition(program.tuitionFee, program.tuitionCurrency, program.tuitionPeriod)}
          </span>
          {program.scholarshipAvailable && <Badge variant="moss">Scholarship</Badge>}
          {program.isOfficial === false && <Badge variant="secondary">Custom</Badge>}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {program.applicationDeadline && (
          <span className="text-right">
            <span className="block text-xs text-ink-3 tnum">{formatDate(program.applicationDeadline)}</span>
            <DaysLeft date={program.applicationDeadline} short hidePast />
          </span>
        )}
        {!isAdmin ? (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/applications/new?programId=${program._id}`}>Apply</Link>
          </Button>
        ) : (
          <div className="flex items-center">
            <Button variant="ghost" size="xs" onClick={() => toggleProg(program._id)} disabled={togglingProg}>
              {togglingProg && <Loader2 className="animate-spin" />}
              {program.isOfficial ? "Make custom" : "Make official"}
            </Button>
            <Button variant="ghost" size="xs" asChild>
              <Link to={`/programs/${program._id}/edit`}>Edit</Link>
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
                  <DialogTitle>Delete “{program.name}”?</DialogTitle>
                  <DialogDescription>It disappears from the catalogue. This can't be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                    Keep it
                  </Button>
                  <Button variant="destructive" onClick={onDelete} disabled={deletePending}>
                    {deletePending && <Loader2 className="animate-spin" />}
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </li>
  );
}
