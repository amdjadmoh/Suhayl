import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Bookmark, Loader2 } from "lucide-react";
import ReviewsSection from "@/components/ReviewsSection";
import {
  useProgram,
  useDeleteProgram,
  useToggleProgramOfficial,
  useFavorites,
  useAddFavorite,
  useRemoveFavorite,
} from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { useCompare } from "@/lib/compareContext";
import { cn, getErrorMessage } from "@/lib/utils";
import { daysUntil, formatDate, formatDateLong, formatMoney, formatTuition } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BackLink, CountryPlate, DaysLeft, ErrorState, Fact, Facts, LoadingPage, PageHeader, Section, VerificationNote,
} from "@/components/kit";

export default function ProgramDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";
  const { addToCompare, removeFromCompare, isInCompare, compareIds } = useCompare();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: program, isLoading, isError } = useProgram(id ?? "");
  const deleteMutation = useDeleteProgram();
  const toggleProgOfficial = useToggleProgramOfficial();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  async function handleDelete(): Promise<void> {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Program deleted");
      navigate("/universities");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete program"));
    }
  }

  if (isLoading) return <LoadingPage />;

  if (isError || !program) {
    return (
      <ErrorState
        title="Program not found"
        action={<Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>}
      >
        It may have been removed from the catalogue.
      </ErrorState>
    );
  }

  const p = program;
  const uni = typeof p.universityId === "object" ? p.universityId : null;
  const isCreator = !!user && p.createdBy === user._id;
  const canEdit = isAdmin || (isCreator && !p.isOfficial);
  const inCompare = isInCompare(p._id);
  const compareFull = compareIds.length >= 3 && !inCompare;

  const isFavorited = !!favorites?.some((f) => f.type === "program" && f.itemId === p._id);
  const favoritePending = addFavorite.isPending || removeFavorite.isPending;

  async function handleToggleFavorite(): Promise<void> {
    try {
      if (isFavorited) {
        await removeFavorite.mutateAsync({ type: "program", itemId: p._id });
        toast.success("Removed from saved");
      } else {
        await addFavorite.mutateAsync({ type: "program", itemId: p._id });
        toast.success("Saved for later");
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update saved items"));
    }
  }

  const tests = p.testRequirements ?? [];

  return (
    <>
      <PageHeader
        back={<BackLink onClick={() => navigate(-1)}>Back</BackLink>}
        kicker={
          <span className="inline-flex flex-wrap items-center gap-2">
            {p.degreeLevel} · {p.languageOfInstruction}
            {p.isOfficial === false && <Badge variant="secondary">Your own</Badge>}
          </span>
        }
        title={p.name}
        actions={
          <>
            {isStudent && (
              <>
                <Button
                  variant="ghost"
                  onClick={handleToggleFavorite}
                  disabled={favoritePending}
                  aria-pressed={isFavorited}
                  className={cn(isFavorited && "text-stamp hover:text-stamp")}
                >
                  <Bookmark className={cn(isFavorited && "fill-current")} />
                  {isFavorited ? "Saved" : "Save"}
                </Button>
                <Button
                  variant={inCompare ? "default" : "outline"}
                  onClick={() => (inCompare ? removeFromCompare(p._id) : addToCompare(p._id))}
                  disabled={compareFull}
                  title={compareFull ? "You can compare three at a time" : undefined}
                >
                  {inCompare ? "✓ In comparison" : "Compare"}
                </Button>
              </>
            )}
            {!isAdmin && (
              <Button variant="primary" asChild>
                <Link to={`/applications/new?programId=${p._id}`}>Start an application</Link>
              </Button>
            )}
            {canEdit && (
              <Button variant="ghost" asChild>
                <Link to={`/programs/${p._id}/edit`}>Edit</Link>
              </Button>
            )}
            {isAdmin && (
              <>
                <Button variant="ghost" onClick={() => toggleProgOfficial.mutate(p._id)} disabled={toggleProgOfficial.isPending}>
                  {toggleProgOfficial.isPending && <Loader2 className="animate-spin" />}
                  {p.isOfficial ? "Make custom" : "Make official"}
                </Button>
                <Button variant="ghost" className="text-stamp hover:bg-stamp-soft hover:text-stamp" onClick={() => setDeleteOpen(true)}>
                  Delete
                </Button>
              </>
            )}
          </>
        }
      >
        {uni && (
          <span className="flex flex-wrap items-center gap-2">
            <CountryPlate country={uni.country} />
            <Link to={`/universities/${uni._id}`} className="link-ink">
              {uni.name}
            </Link>
            <span className="text-ink-4">·</span>
            {uni.city}, {uni.country}
          </span>
        )}
      </PageHeader>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete “{p.name}”?</DialogTitle>
            <DialogDescription>It disappears from the catalogue. This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="animate-spin" />}
              Delete program
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-10">
          <VerificationNote status={p.verificationStatus} subject="program" />

          <Section title="What they ask for">
            <div className="card grid gap-8 p-5 sm:grid-cols-2">
              <div>
                <p className="kicker mb-2">Minimum scores</p>
                {tests.length > 0 ? (
                  <ul className="divide-y divide-rule-soft">
                    {tests.map((tr, i) => (
                      <li key={i} className="flex items-baseline justify-between py-2">
                        <span className="text-sm text-ink-2">{tr.name}</span>
                        <span className="text-lg tnum font-semibold">{tr.minimumScore}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-3">No test scores listed.</p>
                )}
              </div>
              <div>
                <p className="kicker mb-2">Documents</p>
                {p.requiredDocuments.length > 0 ? (
                  <ol className="space-y-1.5 text-sm text-ink-2">
                    {p.requiredDocuments.map((doc, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-5 shrink-0 text-right text-xs text-ink-4 tnum">{i + 1}.</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-ink-3">No documents listed.</p>
                )}
              </div>
            </div>
            {(p.requiresSOP || p.recommendationLetters > 0) && (
              <p className="card-soft mt-3 px-5 py-4 text-sm leading-relaxed text-ink-2">
                You'll also need
                {p.requiresSOP && <> a <span className="font-medium text-ink">statement of purpose</span></>}
                {p.requiresSOP && p.recommendationLetters > 0 && " and"}
                {p.recommendationLetters > 0 && (
                  <>
                    {" "}
                    <span className="font-medium text-ink">
                      {p.recommendationLetters} letter{p.recommendationLetters === 1 ? "" : "s"} of recommendation
                    </span>
                  </>
                )}
                . Both can be written and collected from the application page.
              </p>
            )}
          </Section>

          <Section title="Scholarship">
            {p.scholarshipAvailable ? (
              <div className="pt-1">
                <p className="text-sm font-medium text-moss">Funding is available.</p>
                {p.scholarshipDetails && (
                  <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-ink-2">{p.scholarshipDetails}</p>
                )}
              </div>
            ) : (
              <p className="pt-1 text-sm text-ink-3">No scholarship listed for this program.</p>
            )}
          </Section>

          {p.notes && (
            <Section title="Notes">
              <p className="max-w-prose pt-1 text-[15px] leading-[1.65] whitespace-pre-wrap text-ink-2">{p.notes}</p>
            </Section>
          )}

          <ReviewsSection targetType="program" targetId={p._id} />
        </div>

        <aside className="space-y-9">
          <div>
            <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">At a glance</p>
            <Facts className="card px-5 py-1">
              <Fact label="Tuition">{formatTuition(p.tuitionFee, p.tuitionCurrency, p.tuitionPeriod)}</Fact>
              <Fact label="Application fee">
                {p.applicationFee != null ? (p.applicationFee > 0 ? formatMoney(p.applicationFee) : "Free") : undefined}
              </Fact>
              <Fact label="Degree">{p.degreeLevel}</Fact>
              <Fact label="Taught in">{p.languageOfInstruction}</Fact>
              <Fact label="Deadline">
                {p.applicationDeadline ? (
                  <span className="flex flex-col items-end">
                    {formatDateLong(p.applicationDeadline)}
                    <DaysLeft date={p.applicationDeadline} hidePast />
                    {(daysUntil(p.applicationDeadline) ?? 0) < 0 && <span className="block text-xs font-normal text-ink-3">This intake has closed</span>}
                  </span>
                ) : (
                  <span className="text-ink-4">not published</span>
                )}
              </Fact>
              {uni?.ranking ? <Fact label="University rank">No. {uni.ranking}</Fact> : null}
            </Facts>
            {p.programUrl && (
              <a
                href={p.programUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-ink mt-4 inline-block text-[13px]"
              >
                The program's own page ↗
              </a>
            )}
          </div>

          {uni && (
            <div>
              <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">The university</p>
              <Link to={`/universities/${uni._id}`} className="text-lg leading-tight hover:text-brand-ink font-semibold">
                {uni.name}
              </Link>
              <p className="mt-1 text-sm text-ink-3">
                {uni.city}, {uni.country}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
                Rent, safety and visa notes for {uni.city} are on the university's page.
              </p>
            </div>
          )}
        </aside>
      </div>

      <p className="mt-12 text-xs text-ink-4 tnum">
        Added {formatDate(p.createdAt)} · updated {formatDate(p.updatedAt)}
      </p>
    </>
  );
}
