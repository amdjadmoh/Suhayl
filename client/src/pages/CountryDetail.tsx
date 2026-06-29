import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Globe, AlertCircle, Pencil, Trash2, Loader2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useCountryWithUniversities, useDeleteCountry, useDeleteCity } from "@/lib/api"
import { COUNTRY_FLAGS } from "@/lib/constants"
import type { City } from "@/types/city"
import { getErrorMessage } from "@/lib/utils"

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
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="rounded-xl border border-slate-100 bg-white p-12">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold text-[#0F172A]">Country not found</h2>
            <p className="text-sm text-slate-500">
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
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              <span className="mr-2">{COUNTRY_FLAGS[country.name] ?? <Globe className="inline h-6 w-6" />}</span>
              {country.name}
            </h1>
            <p className="text-sm text-slate-500">{country.visaAcceptanceRate}% visa acceptance rate · {country.currency}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/countries/${country._id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <button onClick={handleDelete} disabled={deleteMutation.isPending} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition-colors text-red-500 hover:bg-red-50 hover:text-red-600">
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
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <Globe className="h-5 w-5 text-slate-400" /> Visa Information
            </h3>
          </div>
          <div className="space-y-4 p-6">
            <div>
              <h3 className="mb-1 text-sm font-medium text-slate-500">
                Requirements
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#0F172A]">
                {country.visaRequirements}
              </p>
            </div>

            <div className="border-t border-slate-100" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Acceptance Rate
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#0EA5E9]"
                    style={{ width: `${country.visaAcceptanceRate}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[#0F172A]">
                  {country.visaAcceptanceRate}%
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            <div className="flex items-start justify-between">
              <span className="text-sm text-slate-500">
                Bank Account Required
              </span>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-sm font-medium text-[#0F172A]">
                  {formatCurrency(country.visaBankAccountAmount)}/year
                </span>
                <Badge
                  variant="secondary"
                  className={
                    country.visaBankAccountLocked
                      ? "rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700"
                      : "rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700"
                  }
                >
                  {country.visaBankAccountLocked
                    ? "Blocked Account"
                    : "Regular Account"}
                </Badge>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Living Cost / Month
              </span>
              <span className="text-sm font-medium text-[#0F172A]">
                {formatCurrency(country.livingCostEstimate)}
              </span>
            </div>

            <div className="border-t border-slate-100" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Currency
              </span>
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">{country.currency}</Badge>
            </div>

            {(country.pros.length > 0 || country.cons.length > 0) && (
              <>
                <div className="border-t border-slate-100" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {country.pros.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
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
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <Globe className="h-5 w-5 text-slate-400" /> Cities in {country.name} ({cities.length})
            </h3>
            <Link to={`/cities/new?countryName=${encodeURIComponent(country.name)}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors">
              <Plus className="h-4 w-4" /> Add City
            </Link>
          </div>
          <div className="p-6">
            {cities.length > 0 ? (
              <div className="space-y-2">
                {cities.map((city) => (
                  <div
                    key={city._id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/cities/${city._id}`}
                        className="font-semibold text-[#0F172A] hover:text-[#0EA5E9]"
                      >
                        {city.name}
                        {city.isCapital && (
                          <Badge className="ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                            Capital
                          </Badge>
                        )}
                      </Link>
                      <p className="text-xs text-slate-500">
                        ${city.monthlyLivingCost.toLocaleString()}/mo · Quality of Life: {city.qualityOfLifeScore}/10
                      </p>
                    </div>
                    <div className="ml-3 flex flex-shrink-0 items-center gap-1">
                      <Link to={`/cities/${city._id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </Link>
                      <button onClick={() => handleDeleteCity(city)} disabled={deleteCityMutation.isPending} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-red-500 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-slate-500">
                <Globe className="h-8 w-8 text-slate-300" />
                <p>No cities added yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Universities Card */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <Globe className="h-5 w-5 text-slate-400" /> Universities in {country.name} ({universities.length})
            </h3>
          </div>
          <div className="p-6">
            {universities.length > 0 ? (
              <div className="space-y-3">
                {universities.map((uni) => (
                  <div
                    key={uni._id}
                    onClick={() => navigate(`/universities/${uni._id}`)}
                    className="flex cursor-pointer flex-col gap-2 rounded-lg border border-slate-100 p-4 transition-all hover:border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-[#0F172A]">{uni.name}</h4>
                        <p className="text-sm text-slate-500">
                          {uni.city}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-slate-500">
                <Globe className="h-8 w-8 text-slate-300" />
                <p>No universities added yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
