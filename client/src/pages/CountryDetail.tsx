import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Globe, AlertCircle, Pencil, Trash2, Loader2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useCountryWithUniversities, useDeleteCountry, useDeleteCity } from "@/lib/api"
import { COUNTRY_FLAGS } from "@/lib/constants"
import type { City } from "@/types/city"
import { getErrorMessage } from "@/lib/utils"

const verificationStyles: Record<string, string> = {
  manual: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 rounded-full",
  ai: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 rounded-full",
  none: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30 rounded-full",
};
const verificationLabels: Record<string, string> = {
  manual: "✓ Verified",
  ai: "⚠ AI-Verified",
  none: "⚠ Unverified",
};

export default function CountryDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useCountryWithUniversities(
    id ?? ""
  )
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

  async function handleDeleteCity(city: City): Promise<void> {
    if (!window.confirm(`Delete city "${city.name}"? This cannot be undone.`)) return
    try {
      await deleteCityMutation.mutateAsync(city._id)
      toast.success("City deleted")
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete city"))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="rounded-xl border border-border bg-card p-12">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">Country not found</h2>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "The country details could not be loaded."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { country, universities, cities } = data

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: country.currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              <span className="mr-2">{COUNTRY_FLAGS[country.name] ?? <Globe className="inline h-6 w-6" />}</span>
              {country.name}
              <Badge className={`ml-2 ${verificationStyles[country.verificationStatus || "ai"]}`}>
                {verificationLabels[country.verificationStatus || "ai"]}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground">{country.currency}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/countries/${country._id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <button onClick={handleDelete} disabled={deleteMutation.isPending} className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors text-red-500 hover:bg-red-50 hover:text-red-600">
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Visa Information Card */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Globe className="h-5 w-5 text-muted-foreground" /> Visa Information
            </h3>
          </div>
          <div className="space-y-4 p-6">
            {country.visaType && (
              <>
                <div className="border-t border-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Visa Type</span>
                  <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{country.visaType}</span>
                </div>
              </>
            )}

            {country.proofOfFundsMonthly != null && country.proofOfFundsMonthly > 0 && (
              <>
                <div className="border-t border-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Proof of Funds/Month</span>
                  <span className="text-sm font-medium text-foreground">{formatCurrency(country.proofOfFundsMonthly)}</span>
                </div>
              </>
            )}

            {country.whereToApply && (
              <>
                <div className="border-t border-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Where to Apply</span>
                  <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{country.whereToApply}</span>
                </div>
              </>
            )}

            {country.processingTime && (
              <>
                <div className="border-t border-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Processing Time</span>
                  <span className="text-sm font-medium text-foreground">{country.processingTime}</span>
                </div>
              </>
            )}

            {country.workPermit && (
              <>
                <div className="border-t border-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Work Permit</span>
                  <span className="text-sm font-medium text-foreground">{country.workPermit}</span>
                </div>
              </>
            )}

            {country.postGraduationVisa && (
              <>
                <div className="border-t border-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Post-Graduation Visa</span>
                  <span className="text-sm font-medium text-foreground text-right max-w-[60%]">{country.postGraduationVisa}</span>
                </div>
              </>
            )}

            {country.additionalVisaNotes && (
              <>
                <div className="border-t border-border" />
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground">Additional Notes</span>
                  <span className="text-sm text-foreground text-right max-w-[60%] whitespace-pre-wrap">{country.additionalVisaNotes}</span>
                </div>
              </>
            )}

            <div className="border-t border-border" />

            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground">
                Bank Account Required
              </span>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(country.visaBankAccountAmount)}/year
                </span>
                <Badge
                  variant="secondary"
                  className={
                    country.visaBankAccountLocked
                      ? "rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  }
                >
                  {country.visaBankAccountLocked
                    ? "Blocked Account"
                    : "Regular Account"}
                </Badge>
              </div>
            </div>

            <div className="border-t border-border" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Living Cost / Month
              </span>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(country.livingCostEstimate)}
              </span>
            </div>

            <div className="border-t border-border" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Currency
              </span>
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">{country.currency}</Badge>
            </div>

            {country.requiredDocuments?.length > 0 && (
              <>
                <div className="border-t border-border" />
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Required Visa Documents ({country.requiredDocuments.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {country.requiredDocuments.map((doc, i) => (
                      <span key={i} className="bg-muted text-foreground rounded-full px-3 py-1 text-xs">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {(country.pros.length > 0 || country.cons.length > 0) && (
              <>
                <div className="border-t border-border" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {country.pros.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Pros
                      </h3>
                      <ul className="space-y-1.5">
                        {country.pros.map((p, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1.5 text-xs leading-relaxed"
                          >
                            <span className="mt-0.5 shrink-0 text-emerald-500">
                              +
                            </span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {country.cons.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-500">
                        Cons
                      </h3>
                      <ul className="space-y-1.5">
                        {country.cons.map((c, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1.5 text-xs leading-relaxed"
                          >
                            <span className="mt-0.5 shrink-0 text-red-400">
                              -
                            </span>
                            <span>{c}</span>
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

        {/* Cities Card */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Globe className="h-5 w-5 text-muted-foreground" /> Cities in {country.name} ({cities.length})
            </h3>
            <Link to={`/cities/new?countryName=${encodeURIComponent(country.name)}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
              <Plus className="h-4 w-4" /> Add City
            </Link>
          </div>
          <div className="p-6">
            {cities.length > 0 ? (
              <div className="space-y-2">
                {cities.map((city) => (
                  <div
                    key={city._id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/cities/${city._id}`}
                        className="font-semibold text-foreground hover:text-primary"
                      >
                        {city.name}
                        {city.isCapital && (
                          <Badge className="ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">
                            Capital
                          </Badge>
                        )}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        ${city.monthlyLivingCost.toLocaleString()}/mo · Quality of Life: {city.qualityOfLifeScore}/10
                      </p>
                    </div>
                    <div className="ml-3 flex flex-shrink-0 items-center gap-1">
                      <Link to={`/cities/${city._id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                      <button onClick={() => handleDeleteCity(city)} disabled={deleteCityMutation.isPending} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors text-red-500 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <Globe className="h-8 w-8 text-muted-foreground/40" />
                <p>No cities added yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Universities Card */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Globe className="h-5 w-5 text-muted-foreground" /> Universities in {country.name} ({universities.length})
            </h3>
          </div>
          <div className="p-6">
            {universities.length > 0 ? (
              <div className="space-y-3">
                {universities.map((uni) => (
                  <div
                    key={uni._id}
                    onClick={() => navigate(`/universities/${uni._id}`)}
                    className="flex cursor-pointer flex-col gap-2 rounded-lg border border-border p-4 transition-all hover:border-border"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground">{uni.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {uni.city}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <Globe className="h-8 w-8 text-muted-foreground/40" />
                <p>No universities added yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
