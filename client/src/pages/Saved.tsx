import { Link } from "react-router-dom";
import { useFavorites, useCountries, useUniversities, usePrograms } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { Star, Globe, GraduationCap, BookOpen, AlertCircle, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { COUNTRY_FLAGS } from "@/lib/constants";

export default function Saved(): React.ReactElement {
  const { user } = useAuth();
  const { data: favorites, isLoading: favsLoading } = useFavorites();
  const { data: countries } = useCountries();
  const { data: unisData } = useUniversities();
  const { data: progsData } = usePrograms();

  if (favsLoading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 p-8 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-amber-400 blur-3xl" />
          </div>
          <div className="relative">
            <h1 className="text-3xl font-bold tracking-tight">Saved</h1>
            <p className="mt-2 text-amber-100">Your favorited items</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-20 w-full rounded-xl" />))}
        </div>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 p-8 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-amber-400 blur-3xl" />
          </div>
          <div className="relative">
            <h1 className="text-3xl font-bold tracking-tight">Saved</h1>
            <p className="mt-2 text-amber-100">Your favorited items</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 mx-auto mb-4">
            <Star className="h-10 w-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">No saved items yet</h2>
          <p className="text-slate-500">Start browsing and save countries, universities, and programs you're interested in.</p>
        </div>
      </div>
    );
  }

  const countryFavorites = favorites.filter((f) => f.type === "country");
  const universityFavorites = favorites.filter((f) => f.type === "university");
  const programFavorites = favorites.filter((f) => f.type === "program");

  function getCountryById(id: string) {
    return countries?.find((c) => c._id === id);
  }

  function getUniversityById(id: string) {
    return unisData?.universities?.find((u) => u._id === id);
  }

  function getProgramById(id: string) {
    return progsData?.programs?.find((p) => p._id === id);
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-amber-400 blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">Saved</h1>
          <p className="mt-2 text-amber-100">{favorites.length} saved item{favorites.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Countries */}
        {countryFavorites.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-[#0F172A]">Countries ({countryFavorites.length})</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {countryFavorites.map((fav) => {
                const country = getCountryById(fav.itemId);
                return (
                  <Link key={fav._id} to={country ? `/countries/${country._id}` : "#"}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 hover:border-slate-200 hover:shadow-sm transition-all">
                    <div className="text-2xl">{country ? (COUNTRY_FLAGS[country.name] ?? "🌍") : "🌍"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F172A] truncate">{country?.name ?? "Unknown country"}</p>
                      {country && <p className="text-xs text-slate-500">{country.currency}</p>}
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Universities */}
        {universityFavorites.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-[#0F172A]">Universities ({universityFavorites.length})</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {universityFavorites.map((fav) => {
                const uni = getUniversityById(fav.itemId);
                return (
                  <Link key={fav._id} to={uni ? `/universities/${uni._id}` : "#"}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 hover:border-slate-200 hover:shadow-sm transition-all">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 text-lg shrink-0">
                      {uni ? (COUNTRY_FLAGS[uni.country] ?? <GraduationCap className="h-5 w-5 text-violet-500" />) : <GraduationCap className="h-5 w-5 text-violet-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F172A] truncate">{uni?.name ?? "Unknown university"}</p>
                      {uni && <p className="text-xs text-slate-500">{uni.city}, {uni.country}</p>}
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Programs */}
        {programFavorites.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-[#0F172A]">Programs ({programFavorites.length})</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {programFavorites.map((fav) => {
                const prog = getProgramById(fav.itemId);
                const uni = prog && typeof prog.universityId === "object" ? prog.universityId : null;
                return (
                  <Link key={fav._id} to={prog ? `/programs/${prog._id}` : "#"}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 hover:border-slate-200 hover:shadow-sm transition-all">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-lg shrink-0">
                      <BookOpen className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F172A] truncate">{prog?.name ?? "Unknown program"}</p>
                      {uni && <p className="text-xs text-slate-500">{uni.name} · {prog?.degreeLevel}</p>}
                      {prog && <Badge variant="outline" className="mt-1 text-[10px]">{prog.degreeLevel}</Badge>}
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
