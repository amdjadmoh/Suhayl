import { Link } from "react-router-dom"
import { AlertCircle, Globe, Lock, Unlock, Plus, ArrowRight, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { useCountries, useFavorites, useAddFavorite, useRemoveFavorite } from "@/lib/api"
import { useAuth } from "@/lib/authContext"
import { COUNTRY_FLAGS } from "@/lib/constants"

const verificationStyles: Record<string, string> = {
  manual: "bg-emerald-100 text-emerald-700 border-emerald-200 rounded-full",
  ai: "bg-amber-100 text-amber-700 border-amber-200 rounded-full",
  none: "bg-red-100 text-red-700 border-red-200 rounded-full",
};
const verificationLabels: Record<string, string> = {
  manual: "✓ Verified",
  ai: "⚠ AI-Verified",
  none: "⚠ Unverified",
};

export default function Countries(): React.ReactElement {
  const { data: countries, isLoading, isError } = useCountries()
  const { data: favorites } = useFavorites()
  const addFav = useAddFavorite()
  const removeFav = useRemoveFavorite()
  const { user } = useAuth()
  const isLoggedIn = !!user

  const favoritesMap: Record<string, boolean> = {}
  if (favorites) {
    favorites.forEach((f) => { favoritesMap[f.itemId] = true })
  }

  function handleToggleFavorite(type: string, itemId: string, isFav: boolean): void {
    if (isFav) {
      removeFav.mutate({ type, itemId })
    } else {
      addFav.mutate({ type, itemId })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
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

        <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                {["Country", "Bank Account Required", "Processing", ""].map((h) => (
                  <TableHead key={h} className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

      {/* Countries Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Country</TableHead>
              <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bank Account Required</TableHead>
              <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Processing</TableHead>
              <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Visa Docs</TableHead>
              <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {countries?.map((country) => {
              const isFav = favoritesMap[country._id] ?? false
              return (
              <TableRow key={country._id} className="group hover:bg-slate-50 transition-colors">
                {/* Country */}
                <TableCell>
                  <Link
                    to={`/countries/${country._id}`}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-lg shrink-0">
                      {COUNTRY_FLAGS[country.name] ?? <Globe className="h-4 w-4 text-slate-400" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors">
                        {country.name}
                      </span>
                      <Badge className={`text-[10px] px-1.5 py-0 ${verificationStyles[country.verificationStatus || "ai"]}`}>
                        {verificationLabels[country.verificationStatus || "ai"]}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{country.currency}</Badge>
                      {isLoggedIn && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFavorite("country", country._id, isFav); }}
                          className="ml-1"
                          title={isFav ? "Remove from saved" : "Save"}
                        >
                          <Star className={`h-4 w-4 ${isFav ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`} />
                        </button>
                      )}
                    </div>
                  </Link>
                </TableCell>

                {/* Bank Account Required */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-[#0F172A] whitespace-nowrap">
                      {formatCurrency(country.visaBankAccountAmount, country.currency)}
                      <span className="text-xs text-slate-400 font-normal">/year</span>
                    </span>
                    {country.visaBankAccountLocked ? (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 w-fit text-xs">
                        <Lock className="mr-1 h-3 w-3" /> Blocked
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 w-fit text-xs">
                        <Unlock className="mr-1 h-3 w-3" /> Regular
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Processing */}
                <TableCell>
                  {country.processingTime ? (
                    <span className="text-sm text-slate-600 whitespace-nowrap">{country.processingTime}</span>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </TableCell>

                {/* Visa Docs */}
                <TableCell>
                  {country.requiredDocuments?.length > 0 ? (
                    <Badge variant="outline" className="text-xs rounded-full">
                      {country.requiredDocuments.length} doc{country.requiredDocuments.length !== 1 ? "s" : ""}
                    </Badge>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <Link
                    to={`/countries/${country._id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#0EA5E9]" />
                  </Link>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
