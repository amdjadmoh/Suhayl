import { Link } from "react-router-dom"
import { AlertCircle, Globe, Lock, Unlock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useCountries } from "@/lib/api"
import { COUNTRY_FLAGS } from "@/lib/constants"
import type { Country } from "@/types/country"

export default function Countries(): React.ReactElement {
  const { data: countries, isLoading, isError } = useCountries()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Countries</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Countries</h1>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load countries.</p>
        </div>
      </div>
    )
  }

  function formatCurrency(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    } catch {
      return `${amount} ${currency}`
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Countries</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {countries?.map((country) => (
          <Link
            key={country._id}
            to={`/countries/${country._id}`}
            className="block outline-none rounded-xl transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full hover:border-primary/30 hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-xl">
                    {COUNTRY_FLAGS[country.name] ?? <Globe className="h-5 w-5 text-muted-foreground" />}
                  </span>
                  {country.name}
                </CardTitle>
                <Badge variant="outline">{country.currency}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Visa Rate</p>
                    <p className="font-semibold text-emerald-600">
                      {country.visaAcceptanceRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Living Cost</p>
                    <p className="font-semibold">
                      {formatCurrency(country.livingCostEstimate, country.currency)}/mo
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Bank Account</p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatCurrency(country.visaBankAccountAmount, country.currency)}/year
                      </span>
                      {country.visaBankAccountLocked ? (
                        <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 text-xs">
                          <Lock className="h-3 w-3" /> Blocked
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700 text-xs">
                          <Unlock className="h-3 w-3" /> Regular
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground border-t pt-2">
                  {country.visaRequirements}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
