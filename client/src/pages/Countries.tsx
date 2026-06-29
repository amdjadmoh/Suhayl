import { Link } from "react-router-dom"
import { AlertCircle, Globe, Lock, Unlock, Plus, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCountries } from "@/lib/api"
import { COUNTRY_FLAGS } from "@/lib/constants"

export default function Countries(): React.ReactElement {
  const { data: countries, isLoading, isError } = useCountries()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Countries</h1>
          <p className="mt-2 text-slate-500">Loading countries...</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-[#0F172A]">Failed to load countries</h2>
        <p className="text-sm text-slate-500">Please try again later</p>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald-400 blur-3xl" />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Countries</h1>
            <p className="mt-2 text-emerald-100">Explore study destinations and visa requirements</p>
          </div>
          <Button asChild className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl">
            <Link to="/countries/new">
              <Plus className="mr-2 h-4 w-4" /> Add Country
            </Link>
          </Button>
        </div>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {countries?.map((country) => (
          <Link
            key={country._id}
            to={`/countries/${country._id}`}
            className="group block"
          >
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#0EA5E9]/30 transition-all duration-300">
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-3xl">
                    {COUNTRY_FLAGS[country.name] ?? <Globe className="h-7 w-7 text-slate-400" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors">{country.name}</h3>
                    <Badge variant="outline" className="mt-1">{country.currency}</Badge>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[#0EA5E9] group-hover:translate-x-1 transition-all" />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <p className="text-xs text-emerald-600 font-medium mb-1">Visa Acceptance Rate</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {country.visaAcceptanceRate}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Living Cost / Month</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(country.livingCostEstimate, country.currency)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-600 font-medium">Bank Account Required</p>
                    {country.visaBankAccountLocked ? (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        <Lock className="mr-1 h-3 w-3" /> Blocked
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        <Unlock className="mr-1 h-3 w-3" /> Regular
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-[#0F172A]">
                    {formatCurrency(country.visaBankAccountAmount, country.currency)}<span className="text-sm text-slate-500 font-normal">/year</span>
                  </p>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {country.visaRequirements}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
