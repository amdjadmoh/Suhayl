import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Globe, AlertCircle, Pencil, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useCityWithUniversities, useDeleteCity } from "@/lib/api"
import { COUNTRY_FLAGS, STATUS_COLORS } from "@/lib/constants"
import type { City } from "@/types/city"

function ScoreBar({ value, label }: { value: number; label: string }): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#0EA5E9]"
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-[#0F172A]">{value}/10</span>
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
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="rounded-xl border border-slate-100 bg-white p-12">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold text-[#0F172A]">City not found</h2>
            <p className="text-sm text-slate-500">
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
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              <span className="mr-2">{COUNTRY_FLAGS[city.country] ?? <Globe className="inline h-6 w-6" />}</span>
              {city.name}
            </h1>
            <p className="text-sm text-slate-500">{city.country} · {city.climate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/cities/${city._id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
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
        {/* City Information Card */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <Globe className="h-5 w-5 text-slate-400" /> City Information
            </h3>
          </div>
          <div className="space-y-0 p-6">
            <div className="flex items-center justify-between border-b border-slate-50 py-3">
              <span className="text-sm text-slate-500">Country</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base">
                  {COUNTRY_FLAGS[city.country] ?? <Globe className="h-4 w-4" />}
                </span>
                <span className="text-sm font-medium text-[#0F172A]">{city.country}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 py-3">
              <span className="text-sm text-slate-500">Population</span>
              <span className="text-sm font-medium text-[#0F172A]">
                {formatPopulation(city.population)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 py-3">
              <span className="text-sm text-slate-500">Capital City</span>
              {city.isCapital ? (
                <Badge className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                  Capital
                </Badge>
              ) : (
                <span className="text-sm text-slate-400">No</span>
              )}
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 py-3">
              <span className="text-sm text-slate-500">Climate</span>
              <span className="text-sm font-medium text-[#0F172A]">{city.climate}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 py-3">
              <span className="text-sm text-slate-500">Language</span>
              <span className="text-sm font-medium text-[#0F172A]">{city.language}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 py-3">
              <span className="text-sm text-slate-500">Monthly Living Cost</span>
              <span className="text-sm font-medium text-[#0F172A]">
                ${city.monthlyLivingCost.toLocaleString()}/mo
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 py-3">
              <span className="text-sm text-slate-500">Avg Rent (Single)</span>
              <span className="text-sm font-medium text-[#0F172A]">
                ${city.averageRentSingle.toLocaleString()}/mo
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 py-3">
              <span className="text-sm text-slate-500">Avg Rent (Shared)</span>
              <span className="text-sm font-medium text-[#0F172A]">
                ${city.averageRentShared.toLocaleString()}/mo
              </span>
            </div>

            {city.internetSpeed && (
              <div className="flex items-center justify-between border-b border-slate-50 py-3">
                <span className="text-sm text-slate-500">Internet Speed</span>
                <span className="text-sm font-medium text-[#0F172A]">{city.internetSpeed} Mbps</span>
              </div>
            )}

            <div className="border-t border-slate-100 my-3" />

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-500">Scores</h3>
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
                <div className="border-t border-slate-100 my-3" />
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
                <div className="border-t border-slate-100 my-3" />
                <div>
                  <h3 className="mb-1 text-sm font-medium text-slate-500">Notes</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#0F172A]">{city.notes}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Universities Card */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
              <Globe className="h-5 w-5 text-slate-400" /> Universities in {city.name} ({universities.length})
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
                      <Badge
                        className={STATUS_COLORS[uni.applicationStatus]}
                      >
                        {uni.applicationStatus}
                      </Badge>
                    </div>
                    <div className="flex gap-2 text-sm text-slate-500">
                      <span className="font-medium text-[#0F172A]">
                        {uni.degreeLevel}
                      </span>
                      <span>·</span>
                      <span>{uni.program}</span>
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
