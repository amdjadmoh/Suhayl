import { Link } from "react-router-dom"
import { AlertCircle, Globe, MapPin, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCities } from "@/lib/api"
import { COUNTRY_FLAGS } from "@/lib/constants"
import type { City } from "@/types/city"

function ScoreBar({ value, label }: { value: number; label: string }): React.ReactElement {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/10</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary"
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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Cities</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Cities</h1>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load cities.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Cities</h1>
        <Button asChild>
          <Link to="/cities/new">
            <Plus className="mr-1 h-4 w-4" /> Add City
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cities?.map((city) => (
          <Link
            key={city._id}
            to={`/cities/${city._id}`}
            className="block outline-none rounded-xl transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full hover:border-primary/30 hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-xl">
                    {COUNTRY_FLAGS[city.country] ?? <Globe className="h-5 w-5 text-muted-foreground" />}
                  </span>
                  <div className="flex flex-col">
                    <span>{city.name}</span>
                    <span className="text-sm font-normal text-muted-foreground">{city.country}</span>
                  </div>
                </CardTitle>
                <div className="flex items-center gap-1">
                  {city.isCapital && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                      Capital
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Living Cost</p>
                    <p className="font-semibold">
                      ${city.monthlyLivingCost.toLocaleString()}/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rent (Shared)</p>
                    <p className="font-semibold">
                      ${city.averageRentShared.toLocaleString()}/mo
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <ScoreBar value={city.qualityOfLifeScore} label="Quality of Life" />
                  <ScoreBar value={city.studentFriendliness} label="Student Friendly" />
                  <ScoreBar value={city.englishFriendliness} label="English Friendly" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
