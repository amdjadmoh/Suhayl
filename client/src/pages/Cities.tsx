import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCities } from "@/lib/api"
import { useAuth } from "@/lib/authContext"
import { formatMoney, plural } from "@/lib/format"
import { CountryPlate, ErrorState, LoadingRows, Meter, PageHeader } from "@/components/kit"

export default function Cities(): React.ReactElement {
  const { data: cities, isLoading, isError } = useCities()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [query, setQuery] = useState("")

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = (cities ?? []).slice().sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name))
    return q ? list.filter((c) => `${c.name} ${c.country}`.toLowerCase().includes(q)) : list
  }, [cities, query])

  if (isError) {
    return <ErrorState title="Cities didn't load">Please try again in a moment.</ErrorState>
  }

  return (
    <>
      <PageHeader
        kicker={isLoading ? "Destinations" : `Destinations · ${plural(cities?.length ?? 0, "city", "cities")}`}
        title="Cities"
        actions={
          isAdmin && (
            <Button variant="outline" asChild>
              <Link to="/cities/new">Add a city</Link>
            </Button>
          )
        }
      >
        Rent, living costs and how each city scores for students. Scores are out of ten.
      </PageHeader>

      <div className="mb-4 flex justify-end">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-4" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="City or country" className="pl-8" aria-label="Find a city" />
        </div>
      </div>

      {isLoading ? (
        <LoadingRows rows={8} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-rule bg-paper-sunken/60">
                <th className="kicker py-3 pr-3 pl-5 text-left">City</th>
                <th className="kicker px-3 py-3 text-right">Living / mo</th>
                <th className="kicker px-3 py-3 text-right">Shared room</th>
                <th className="kicker px-3 py-3 text-left">Quality of life</th>
                <th className="kicker px-3 py-3 text-left">Student life</th>
                <th className="kicker py-3 pr-5 pl-3 text-left">English</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((city) => (
                <tr key={city._id} className="group border-b border-rule-soft transition-colors last:border-0 hover:bg-paper-hover">
                  <td className="py-3.5 pr-3 pl-5">
                    <Link to={`/cities/${city._id}`} className="flex items-center gap-3">
                      <CountryPlate country={city.country} />
                      <span>
                        <span className="block text-[15px] leading-tight font-semibold group-hover:text-brand-ink">
                          {city.name}
                        </span>
                        <span className="text-xs text-ink-3">
                          {city.country}
                          {city.isCapital && " · capital"}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3.5 text-right text-[13px] whitespace-nowrap tnum">
                    {formatMoney(city.monthlyLivingCost)}
                  </td>
                  <td className="px-3 py-3.5 text-right text-[13px] whitespace-nowrap text-ink-2 tnum">
                    {formatMoney(city.averageRentShared)}
                  </td>
                  <td className="px-3 py-3.5">
                    <Meter value={city.qualityOfLifeScore} />
                  </td>
                  <td className="px-3 py-3.5">
                    <Meter value={city.studentFriendliness} />
                  </td>
                  <td className="py-3.5 pr-5 pl-3">
                    <Meter value={city.englishFriendliness} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <p className="py-10 text-center text-sm text-ink-3">
              {query ? `Nothing matches “${query}”.` : "No cities yet."}
            </p>
          )}
        </div>
      )}
    </>
  )
}
