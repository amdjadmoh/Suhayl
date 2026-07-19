import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Globe, AlertCircle, Pencil, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useCityWithUniversities, useDeleteCity } from "@/lib/api"
import { COUNTRY_FLAGS } from "@/lib/constants"

function ScoreBar({ value, label }: { value: number; label: string }): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-foreground">{value}/10</span>
      </div>
    </div>
  )
}

import { getErrorMessage } from "@/lib/utils"

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
          <Skeleton className="h-[500px] w-full" />
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
            <h2 className="mb-2 text-xl font-semibold text-foreground">City not found</h2>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "The city details could not be loaded."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { city, universities } = data

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
              <span className="mr-2">{COUNTRY_FLAGS[city.country] ?? <Globe className="inline h-6 w-6" />}</span>
              {city.name}
            </h1>
            <p className="text-sm text-muted-foreground">{city.country} · {city.climate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/cities/${city._id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
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
        {/* City Information Card */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Globe className="h-5 w-5 text-muted-foreground" /> City Information
            </h3>
          </div>
          <div className="space-y-0 p-6">
            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted-foreground">Country</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base">
                  {COUNTRY_FLAGS[city.country] ?? <Globe className="h-4 w-4" />}
                </span>
                <span className="text-sm font-medium text-foreground">{city.country}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted-foreground">Population</span>
              <span className="text-sm font-medium text-foreground">
                {formatPopulation(city.population)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted-foreground">Capital City</span>
              {city.isCapital ? (
                <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  Capital
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">No</span>
              )}
            </div>

            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted-foreground">Climate</span>
              <span className="text-sm font-medium text-foreground">{city.climate}</span>
            </div>

            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted-foreground">Language</span>
              <span className="text-sm font-medium text-foreground">{city.language}</span>
            </div>

            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted-foreground">Monthly Living Cost</span>
              <span className="text-sm font-medium text-foreground">
                ${city.monthlyLivingCost.toLocaleString()}/mo
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted-foreground">Avg Rent (Single)</span>
              <span className="text-sm font-medium text-foreground">
                ${city.averageRentSingle.toLocaleString()}/mo
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted-foreground">Avg Rent (Shared)</span>
              <span className="text-sm font-medium text-foreground">
                ${city.averageRentShared.toLocaleString()}/mo
              </span>
            </div>

            {city.internetSpeed && (
              <div className="flex items-center justify-between border-b border-border py-3">
                <span className="text-sm text-muted-foreground">Internet Speed</span>
                <span className="text-sm font-medium text-foreground">{city.internetSpeed} Mbps</span>
              </div>
            )}

            <div className="border-t border-border my-3" />

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
                <div className="border-t border-border my-3" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {city.pros.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
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
                <div className="border-t border-border my-3" />
                <div>
                  <h3 className="mb-1 text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{city.notes}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Universities Card */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Globe className="h-5 w-5 text-muted-foreground" /> Universities in {city.name} ({universities.length})
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
