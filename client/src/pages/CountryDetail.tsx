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
import { useCountryWithUniversities, useDeleteCountry, useDeleteCity } from "@/lib/api"
import { useAuth } from "@/lib/authContext"
import type { City } from "@/types/city"
import { getErrorMessage } from "@/lib/utils"
import { formatMoney } from "@/lib/format"
import {
  BackLink, Cons, CountryPlate, ErrorState, Fact, Facts, LoadingPage, Meter, PageHeader, Pros, Section, VerificationNote,
} from "@/components/kit"

export default function CountryDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [cityToDelete, setCityToDelete] = useState<City | null>(null)

  const { data, isLoading, isError, error } = useCountryWithUniversities(id ?? "")
  const deleteMutation = useDeleteCountry()
  const deleteCityMutation = useDeleteCity()

  async function handleDelete(): Promise<void> {
    if (!id) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Country deleted")
      navigate("/countries")
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete country"))
    }
  }

  async function handleDeleteCity(): Promise<void> {
    if (!cityToDelete) return
    try {
      await deleteCityMutation.mutateAsync(cityToDelete._id)
      toast.success("City deleted")
      setCityToDelete(null)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete city"))
    }
  }

  if (isLoading) return <LoadingPage />

  if (isError || !data) {
    return (
      <ErrorState
        title="Country not found"
        action={<Button variant="outline" onClick={() => navigate("/countries")}>All countries</Button>}
      >
        {error instanceof Error ? error.message : "The country details could not be loaded."}
      </ErrorState>
    )
  }

  const { country, universities, cities } = data
  const money = (amount: number): string => formatMoney(amount, country.currency)

  return (
    <>
      <PageHeader
        back={<BackLink to="/countries">Countries</BackLink>}
        kicker={
          <span className="inline-flex items-center gap-2">
            <CountryPlate country={country.name} className="h-6 min-w-6 rounded-md text-[10px]" /> Studying in {country.name} · {country.currency}
          </span>
        }
        title={country.name}
        actions={
          isAdmin && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/countries/${country._id}/edit`}>Edit</Link>
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
        {country.visaType ? (
          <>
            Students need a <span className="font-medium text-ink">{country.visaType}</span>.
            {country.visaBankAccountLocked && (
              <> You'll have to lock {money(country.visaBankAccountAmount)} in a blocked account before applying.</>
            )}
          </>
        ) : (
          <>Visa notes, living costs and the universities we know of in {country.name}.</>
        )}
      </PageHeader>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {country.name}?</DialogTitle>
            <DialogDescription>Its visa notes go with it. This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="animate-spin" />}
              Delete country
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cityToDelete} onOpenChange={(o) => !o && setCityToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {cityToDelete?.name}?</DialogTitle>
            <DialogDescription>This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCityToDelete(null)}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={handleDeleteCity} disabled={deleteCityMutation.isPending}>
              {deleteCityMutation.isPending && <Loader2 className="animate-spin" />}
              Delete city
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-10">
          <VerificationNote status={country.verificationStatus} subject="visa" />

          {country.requiredDocuments?.length > 0 && (
            <Section title="What the embassy wants to see" count={country.requiredDocuments.length}>
              <ol className="card columns-1 gap-8 px-5 py-4 text-sm text-ink-2 sm:columns-2">
                {country.requiredDocuments.map((doc, i) => (
                  <li key={i} className="flex break-inside-avoid gap-3 py-1">
                    <span className="w-5 shrink-0 text-right text-xs text-ink-4 tnum">{i + 1}.</span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {(country.pros.length > 0 || country.cons.length > 0) && (
            <Section title="The honest version">
              <div className="grid gap-6 pt-1 sm:grid-cols-2">
                <Pros items={country.pros} />
                <Cons items={country.cons} />
              </div>
            </Section>
          )}

          <Section
            title="Cities"
            count={cities.length}
            action={
              isAdmin && (
                <Link to={`/cities/new?countryName=${encodeURIComponent(country.name)}`} className="link-ink text-[13px]">
                  Add a city
                </Link>
              )
            }
          >
            {cities.length > 0 ? (
              <ul className="card divide-y divide-rule-soft overflow-hidden">
                {cities.map((city) => (
                  <li key={city._id} className="flex flex-wrap items-center gap-x-6 gap-y-1 py-3 px-5">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/cities/${city._id}`}
                        className="font-medium text-ink hover:text-brand-ink"
                      >
                        {city.name}
                      </Link>
                      {city.isCapital && <span className="ml-2 text-xs tracking-wide text-ink-3 tnum">capital</span>}
                    </div>
                    <span className="text-xs text-ink-2 tnum">{money(city.monthlyLivingCost)} / mo</span>
                    <span className="flex items-center gap-2" title="Quality of life">
                      <Meter value={city.qualityOfLifeScore} />
                    </span>
                    {isAdmin && (
                      <span className="flex items-center">
                        <Button variant="ghost" size="xs" asChild>
                          <Link to={`/cities/${city._id}/edit`}>Edit</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-stamp hover:bg-stamp-soft hover:text-stamp"
                          onClick={() => setCityToDelete(city)}
                        >
                          Delete
                        </Button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="card-soft px-5 py-5 text-sm text-ink-3">No cities added yet.</p>
            )}
          </Section>

          <Section title="Universities" count={universities.length}>
            {universities.length > 0 ? (
              <ul className="card divide-y divide-rule-soft overflow-hidden">
                {universities.map((uni) => (
                  <li key={uni._id}>
                    <Link to={`/universities/${uni._id}`} className="group flex items-baseline justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-paper-hover">
                      <span className="font-semibold text-ink group-hover:text-brand-ink">
                        {uni.name}
                      </span>
                      <span className="shrink-0 text-[13px] text-ink-3">{uni.city}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="card-soft px-5 py-5 text-sm text-ink-3">No universities added yet.</p>
            )}
          </Section>
        </div>

        <aside className="space-y-9">
          <div>
            <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">Visa, in numbers</p>
            <div className="card-soft p-5">
              <p className="kicker">{country.visaBankAccountLocked ? "Blocked account" : "Funds to show"}</p>
              <p className="mt-1 text-[30px] leading-none font-bold tnum tracking-[-0.02em]">{money(country.visaBankAccountAmount)}</p>
              <p className="mt-1.5 text-xs text-ink-3">
                {country.visaBankAccountLocked
                  ? "Locked in a special account and paid out to you month by month."
                  : "Shown on an ordinary bank statement."}
              </p>
            </div>
            <Facts className="card mt-3 px-5 py-1">
              {country.proofOfFundsMonthly != null && country.proofOfFundsMonthly > 0 && (
                <Fact label="Per month">{money(country.proofOfFundsMonthly)}</Fact>
              )}
              <Fact label="Living, est.">{money(country.livingCostEstimate)} / mo</Fact>
              <Fact label="Processing">{country.processingTime}</Fact>
              <Fact label="Apply at">{country.whereToApply}</Fact>
              <Fact label="Work allowed">{country.workPermit}</Fact>
              <Fact label="After graduating">{country.postGraduationVisa}</Fact>
            </Facts>
            {country.additionalVisaNotes && (
              <p className="card-soft mt-3 px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap text-ink-2">
                {country.additionalVisaNotes}
              </p>
            )}
          </div>
          {country.notes && (
            <div>
              <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">Notes</p>
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-ink-2">{country.notes}</p>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
