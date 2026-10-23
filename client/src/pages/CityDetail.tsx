import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCityWithUniversities, useDeleteCity } from "@/lib/api"
import { useAuth } from "@/lib/authContext"
import { getErrorMessage } from "@/lib/utils"
import { formatMoney } from "@/lib/format"
import {
  BackLink, Cons, CountryPlate, ErrorState, Fact, Facts, LoadingPage, PageHeader, Pros, ScoreLine, Section,
} from "@/components/kit"

export default function CityDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data, isLoading, isError, error } = useCityWithUniversities(id ?? "")
  const deleteMutation = useDeleteCity()

  async function handleDelete(): Promise<void> {
    if (!id) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("City deleted")
      navigate("/cities")
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete city"))
    }
  }

  if (isLoading) return <LoadingPage />

  if (isError || !data) {
    return (
      <ErrorState title="City not found" action={<Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>}>
        {error instanceof Error ? error.message : "The city details could not be loaded."}
      </ErrorState>
    )
  }

  const { city, universities } = data
  const yearly = city.monthlyLivingCost * 12

  return (
    <>
      <PageHeader
        back={<BackLink onClick={() => navigate(-1)}>Back</BackLink>}
        kicker={
          <span className="inline-flex items-center gap-2">
            <CountryPlate country={city.country} className="h-6 min-w-6 rounded-md text-[10px]" />
            {city.country}
            {city.isCapital && " · capital"}
          </span>
        }
        title={city.name}
        actions={
          isAdmin && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/cities/${city._id}/edit`}>Edit</Link>
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
          )
        }
      >
        Living here costs around <span className="font-medium text-ink">{formatMoney(city.monthlyLivingCost)} a month</span>{" "}
        — about {formatMoney(yearly)} a year before tuition. People speak {city.language}; the climate is{" "}
        {city.climate.toLowerCase()}.
      </PageHeader>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {city.name}?</DialogTitle>
            <DialogDescription>This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="animate-spin" />}
              Delete city
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-10">
          <Section title="How it scores">
            <div className="max-w-md pt-1">
              <ScoreLine label="Quality of life" value={city.qualityOfLifeScore} />
              <ScoreLine label="Safety" value={city.safetyScore} />
              <ScoreLine label="Public transport" value={city.publicTransportScore} />
              <ScoreLine label="Student life" value={city.studentFriendliness} />
              <ScoreLine label="English spoken" value={city.englishFriendliness} />
            </div>
          </Section>

          {(city.pros.length > 0 || city.cons.length > 0) && (
            <Section title="Living there">
              <div className="grid gap-6 pt-1 sm:grid-cols-2">
                <Pros items={city.pros} />
                <Cons items={city.cons} />
              </div>
            </Section>
          )}

          {city.notes && (
            <Section title="Notes">
              <p className="max-w-prose pt-1 text-[15px] leading-[1.65] whitespace-pre-wrap text-ink-2">{city.notes}</p>
            </Section>
          )}

          <Section title={`Universities in ${city.name}`} count={universities.length}>
            {universities.length > 0 ? (
              <ul className="card divide-y divide-rule-soft overflow-hidden">
                {universities.map((uni) => (
                  <li key={uni._id}>
                    <Link to={`/universities/${uni._id}`} className="group flex items-baseline justify-between gap-3 py-3 px-5">
                      <span className="font-medium text-ink group-hover:text-brand-ink">
                        {uni.name}
                      </span>
                      {uni.qsRank != null && <span className="text-xs text-ink-3 tnum">QS {uni.qsRank}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="card-soft px-5 py-5 text-sm text-ink-3">No universities added yet.</p>
            )}
          </Section>
        </div>

        <aside>
          <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">Monthly costs</p>
          <Facts className="card px-5 py-1">
            <Fact label="Everything">{formatMoney(city.monthlyLivingCost)}</Fact>
            <Fact label="Room, shared">{formatMoney(city.averageRentShared)}</Fact>
            <Fact label="Flat, alone">{formatMoney(city.averageRentSingle)}</Fact>
          </Facts>
          <p className="mt-8 mb-3 text-[17px] font-bold tracking-[-0.01em]">The place</p>
          <Facts className="card px-5 py-1">
            <Fact label="Population">{city.population ? city.population.toLocaleString("en-GB") : undefined}</Fact>
            <Fact label="Language">{city.language}</Fact>
            <Fact label="Climate">{city.climate}</Fact>
            {city.internetSpeed ? <Fact label="Internet">{city.internetSpeed} Mbps</Fact> : null}
          </Facts>
        </aside>
      </div>
    </>
  )
}
