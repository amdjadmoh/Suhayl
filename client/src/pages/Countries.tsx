import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCountries, useFavorites, useAddFavorite, useRemoveFavorite } from "@/lib/api"
import { useAuth } from "@/lib/authContext"
import { formatMoney, plural } from "@/lib/format"
import { CountryPlate, ErrorState, LoadingRows, PageHeader, VerificationTag } from "@/components/kit"
import { SaveToggle } from "@/components/SaveToggle"

export default function Countries(): React.ReactElement {
  const { data: countries, isLoading, isError } = useCountries()
  const { data: favorites } = useFavorites()
  const addFav = useAddFavorite()
  const removeFav = useRemoveFavorite()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [query, setQuery] = useState("")

  const favoritesMap: Record<string, boolean> = {}
  favorites?.forEach((f) => {
    favoritesMap[f.itemId] = true
  })

  function handleToggleFavorite(itemId: string, isFav: boolean): void {
    if (isFav) removeFav.mutate({ type: "country", itemId })
    else addFav.mutate({ type: "country", itemId })
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = (countries ?? []).slice().sort((a, b) => a.name.localeCompare(b.name))
    return q ? list.filter((c) => c.name.toLowerCase().includes(q)) : list
  }, [countries, query])

  if (isError) {
    return <ErrorState title="Countries didn't load">Please try again in a moment.</ErrorState>
  }

  return (
    <>
      <PageHeader
        kicker={isLoading ? "Destinations" : `Destinations · ${plural(countries?.length ?? 0, "country", "countries")}`}
        title="Countries"
        actions={
          isAdmin && (
            <Button variant="outline" asChild>
              <Link to="/countries/new">Add a country</Link>
            </Button>
          )
        }
      >
        What each country asks of a student visa: the money you have to show, whether it has to sit in a blocked
        account, and how long the embassy usually takes.
      </PageHeader>

      <div className="mb-4 flex justify-end">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-4" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a country" className="pl-8" aria-label="Find a country" />
        </div>
      </div>

      {isLoading ? (
        <LoadingRows rows={8} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-rule bg-paper-sunken/60">
                <th className="kicker py-3 pr-3 pl-5 text-left">Country</th>
                <th className="kicker px-3 py-3 text-right">Funds to show</th>
                <th className="kicker px-3 py-3 text-left">Account</th>
                <th className="kicker px-3 py-3 text-left">Processing</th>
                <th className="kicker px-3 py-3 text-right">Visa docs</th>
                <th className="w-8 py-3 pr-5 pl-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((country) => {
                const isFav = favoritesMap[country._id] ?? false
                return (
                  <tr key={country._id} className="group border-b border-rule-soft transition-colors last:border-0 hover:bg-paper-hover">
                    <td className="py-3.5 pr-3 pl-5">
                      <Link to={`/countries/${country._id}`} className="flex items-center gap-3">
                        <CountryPlate country={country.name} />
                        <span>
                          <span className="block text-[15px] leading-tight font-semibold group-hover:text-brand-ink">
                            {country.name}
                          </span>
                          <VerificationTag status={country.verificationStatus} className="text-[11px]" />
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3.5 text-right text-[13px] whitespace-nowrap tnum">
                      {formatMoney(country.visaBankAccountAmount, country.currency)}
                      <span className="text-ink-4"> /yr</span>
                    </td>
                    <td className="px-3 py-3.5">
                      {country.visaBankAccountLocked ? (
                        <span className="rounded-full bg-ochre-soft px-2.5 py-0.5 text-xs font-semibold text-ochre">Blocked</span>
                      ) : (
                        <span className="rounded-full bg-paper-sunken px-2.5 py-0.5 text-xs font-semibold text-ink-3">Regular</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-ink-2">
                      {country.processingTime || <span className="text-ink-4">—</span>}
                    </td>
                    <td className="px-3 py-3.5 text-right text-[13px] text-ink-2 tnum">
                      {country.requiredDocuments?.length || <span className="text-ink-4">—</span>}
                    </td>
                    <td className="py-3.5 pr-5 pl-3 text-right">
                      <SaveToggle saved={isFav} onToggle={() => handleToggleFavorite(country._id, isFav)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {visible.length === 0 && (
            <p className="py-10 text-center text-sm text-ink-3">No country called “{query}”.</p>
          )}
        </div>
      )}
    </>
  )
}
