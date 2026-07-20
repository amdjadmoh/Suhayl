import { Link } from "react-router-dom"
import { AlertCircle, Globe, MapPin, Plus, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCities } from "@/lib/api"
import { COUNTRY_FLAGS } from "@/lib/constants"

function ScoreBar({ value, label }: { value: number; label: string }): React.ReactElement {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-foreground/70 font-medium">{label}</span>
        <span className="font-bold text-foreground">{value}/10</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default function Cities(): React.ReactElement {
  const { data: cities, isLoading, isError } = useCities()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Cities</h1>
          <p className="mt-2 text-muted-foreground">Loading cities...</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-foreground">Failed to load cities</h2>
        <p className="text-sm text-muted-foreground">Please try again later</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-card blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-cyan-400 blur-3xl" />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cities</h1>
            <p className="mt-2 text-cyan-100">Discover cities and their quality of life scores</p>
          </div>
          <Button asChild className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl">
            <Link to="/cities/new">
              <Plus className="mr-2 h-4 w-4" /> Add City
            </Link>
          </Button>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {cities?.map((city) => (
          <Link
            key={city._id}
            to={`/cities/${city._id}`}
            className="group block"
          >
            <div className="relative overflow-hidden rounded-2xl bg-card p-6 shadow-sm border border-border card-hover">
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 text-2xl">
                    {COUNTRY_FLAGS[city.country] ?? <Globe className="h-7 w-7 text-muted-foreground" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{city.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {city.country}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {city.isCapital && (
                    <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 rounded-full">
                      Capital
                    </Badge>
                  )}
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 p-3">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Living Cost / Month</p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                      ${city.monthlyLivingCost.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-purple-50 dark:bg-purple-500/10 p-3">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Rent (Shared)</p>
                    <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
                      ${city.averageRentShared.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <ScoreBar value={city.qualityOfLifeScore} label="Quality of Life" />
                  <ScoreBar value={city.studentFriendliness} label="Student Friendly" />
                  <ScoreBar value={city.englishFriendliness} label="English Friendly" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
