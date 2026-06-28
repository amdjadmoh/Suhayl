import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Globe, AlertCircle, Pencil, Trash2, Loader2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useCityWithUniversities, useDeleteCity } from "@/lib/api"
import { COUNTRY_FLAGS, STATUS_COLORS } from "@/lib/constants"
import type { City } from "@/types/city"

function ScoreBar({ value, label }: { value: number; label: string }): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>
        <span className="text-sm font-semibold">{value}/10</span>
      </div>
    </div>
  )
}

function formatPopulation(pop?: number): string {
  if (!pop) return "N/A"
  return pop.toLocaleString()
}

export default function CityDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useCityWithUniversities(id ?? "")
  const deleteMutation = useDeleteCity()

  async function handleDelete(): Promise<void> {
    if (!id) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("City deleted")
      navigate("/cities")
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
          <Skeleton className="h-[500px] w-full" />
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
            <h2 className="mb-2 text-xl font-semibold">City not found</h2>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "The city details could not be loaded."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { city, universities } = data

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            {COUNTRY_FLAGS[city.country] ?? <Globe className="h-6 w-6" />}
            {city.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/cities/${city._id}/edit`}>
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
            <CardTitle className="text-lg">City Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Country
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-base">
                  {COUNTRY_FLAGS[city.country] ?? <Globe className="h-4 w-4" />}
                </span>
                <span className="font-semibold">{city.country}</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Population
              </span>
              <span className="font-semibold">
                {formatPopulation(city.population)}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Capital City
              </span>
              {city.isCapital ? (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  Capital
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">No</span>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Climate
              </span>
              <span className="font-semibold">{city.climate}</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Language
              </span>
              <span className="font-semibold">{city.language}</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Monthly Living Cost
              </span>
              <span className="font-semibold">
                ${city.monthlyLivingCost.toLocaleString()}/mo
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Avg Rent (Single)
              </span>
              <span className="font-semibold">
                ${city.averageRentSingle.toLocaleString()}/mo
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Avg Rent (Shared)
              </span>
              <span className="font-semibold">
                ${city.averageRentShared.toLocaleString()}/mo
              </span>
            </div>

            {city.internetSpeed && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Internet Speed
                  </span>
                  <span className="font-semibold">{city.internetSpeed} Mbps</span>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Scores</h3>
              <div className="space-y-2">
                <ScoreBar value={city.qualityOfLifeScore} label="Quality of Life" />
                <ScoreBar value={city.safetyScore} label="Safety" />
                <ScoreBar value={city.publicTransportScore} label="Public Transport" />
                <ScoreBar value={city.studentFriendliness} label="Student Friendliness" />
                <ScoreBar value={city.englishFriendliness} label="English Friendliness" />
              </div>
            </div>

            {(city.pros.length > 0 || city.cons.length > 0) && (
              <>
                <Separator />
                <div className="grid gap-3 sm:grid-cols-2">
                  {city.pros.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                        Pros
                      </h3>
                      <ul className="space-y-1.5">
                        {city.pros.map((p, i) => (
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
                  {city.cons.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-500">
                        Cons
                      </h3>
                      <ul className="space-y-1.5">
                        {city.cons.map((c, i) => (
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

            {city.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-1 text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{city.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Universities in {city.name} ({universities.length})
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
