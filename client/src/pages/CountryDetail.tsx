import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Globe, AlertCircle, Pencil, Trash2, Loader2, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useCountryWithUniversities, useDeleteCountry, useDeleteCity } from "@/lib/api"
import { COUNTRY_FLAGS, STATUS_COLORS } from "@/lib/constants"
import type { Country } from "@/types/country"
import type { University } from "@/types/university"
import type { City } from "@/types/city"

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
    } catch {
      toast.error("Failed to delete country")
    }
  }

  async function handleDeleteCity(city: City): Promise<void> {
    if (!window.confirm(`Delete city "${city.name}"? This cannot be undone.`)) return
    try {
      await deleteCityMutation.mutateAsync(city._id)
      toast.success("City deleted")
    } catch {
      toast.error("Failed to delete city")
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
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
            <h2 className="mb-2 text-xl font-semibold">Country not found</h2>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "The country details could not be loaded."}
            </p>
          </CardContent>
        </Card>
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            {COUNTRY_FLAGS[country.name] ?? <Globe className="h-6 w-6" />}
            {country.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/countries/${country._id}/edit`}>
              <Pencil className="mr-1 h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-1 h-4 w-4 text-destructive" />
            )}
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visa Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                Requirements
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {country.visaRequirements}
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Acceptance Rate
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${country.visaAcceptanceRate}%` }}
                  />
                </div>
                <span className="font-semibold">
                  {country.visaAcceptanceRate}%
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Bank Account Required
              </span>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="font-semibold">
                  {formatCurrency(country.visaBankAccountAmount)}/year
                </span>
                <Badge
                  variant="secondary"
                  className={
                    country.visaBankAccountLocked
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }
                >
                  {country.visaBankAccountLocked
                    ? "Blocked Account"
                    : "Regular Account"}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Living Cost / Month
              </span>
              <span className="font-semibold">
                {formatCurrency(country.livingCostEstimate)}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Currency
              </span>
              <Badge variant="outline">{country.currency}</Badge>
            </div>

            {(country.pros.length > 0 || country.cons.length > 0) && (
              <>
                <Separator />
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
          </CardContent>
        </Card>

        {/* Cities Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Cities in {country.name} ({cities.length})
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/cities/new?countryName=${encodeURIComponent(country.name)}`}>
                  <Plus className="mr-1 h-4 w-4" /> Add City
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {cities.length > 0 ? (
              <div className="space-y-2">
                {cities.map((city) => (
                  <div
                    key={city._id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/cities/${city._id}`}
                        className="font-semibold hover:text-primary"
                      >
                        {city.name}
                        {city.isCapital && (
                          <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700 text-xs">
                            Capital
                          </Badge>
                        )}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        ${city.monthlyLivingCost.toLocaleString()}/mo · Quality of Life: {city.qualityOfLifeScore}/10
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link to={`/cities/${city._id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteCity(city)}
                        disabled={deleteCityMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <Globe className="h-8 w-8 text-muted/50" />
                <p>No cities added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Universities in {country.name} ({universities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {universities.length > 0 ? (
              <div className="space-y-3">
                {universities.map((uni) => (
                  <div
                    key={uni._id}
                    onClick={() => navigate(`/universities/${uni._id}`)}
                    className="flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">{uni.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {uni.city}
                        </p>
                      </div>
                      <Badge
                        className={STATUS_COLORS[uni.applicationStatus]}
                      >
                        {uni.applicationStatus}
                      </Badge>
                    </div>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {uni.degreeLevel}
                      </span>
                      <span>·</span>
                      <span>{uni.program}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <Globe className="h-8 w-8 text-muted/50" />
                <p>No universities added yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
