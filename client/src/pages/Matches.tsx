import { useState } from "react";
import { Link } from "react-router-dom";
import { useMatches, useCountries, usePreferences } from "@/lib/api";
import { COUNTRY_FLAGS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles, Search, MapPin, DollarSign, AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MatchResult } from "@/lib/api";

function MatchCard({ match }: { match: MatchResult }): React.ReactElement {
  const uni = typeof match.universityId === "object" ? match.universityId : null;

  const scoreColor =
    match.matchScore >= 80 ? "bg-emerald-500" :
    match.matchScore >= 60 ? "bg-amber-500" :
    match.matchScore >= 40 ? "bg-orange-500" : "bg-red-500";

  const admitBadgeColor =
    match.admitChance === "safe"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : match.admitChance === "target"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : match.admitChance === "reach"
      ? "bg-red-100 text-red-700 border-red-200"
      : "";

  return (
    <Link
      to={`/programs/${match._id}`}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#0EA5E9]/30 transition-all duration-300 block"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-6">
        {/* Match Score + Admit Chance */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-20 rounded-full bg-slate-100`}>
              <div className={`h-full rounded-full ${scoreColor} transition-all`} style={{ width: `${match.matchScore}%` }} />
            </div>
            <span className="text-sm font-bold text-[#0F172A] tabular-nums">{match.matchScore}%</span>
          </div>
          <div className="flex items-center gap-2">
            {match.admitChance && (
              <Badge className={`${admitBadgeColor} rounded-full`}>
                {match.admitChance === "safe" ? "Safe" : match.admitChance === "target" ? "Target" : "Reach"}
              </Badge>
            )}
            {match.admitScore !== undefined && (
              <span className="text-xs text-slate-500 font-medium">{match.admitScore}% fit</span>
            )}
            {match.scholarshipAvailable && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full">Scholarship</Badge>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors mb-2">
          {match.name}
        </h3>

        {uni && (
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <MapPin className="h-4 w-4" />
            {uni.name}{uni.country ? ` · ${uni.country}` : ""}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 rounded-full">{match.degreeLevel}</Badge>
          <span>·</span>
          <span>{match.languageOfInstruction}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span className="text-lg font-bold text-[#0F172A]">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: match.tuitionCurrency, minimumFractionDigits: 0 }).format(match.tuitionFee)}
              <span className="text-sm font-normal text-slate-500">/{match.tuitionPeriod?.toLowerCase()}</span>
            </span>
          </div>
          <div className="flex gap-2 text-xs text-slate-500">
            {match.testRequirements?.map((tr, i) => (
              <span key={i}>{i > 0 && <span className="mx-1">·</span>}{tr.name} {tr.minimumScore}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Matches(): React.ReactElement {
  const { data: countries } = useCountries();
  const { data: prefs } = usePreferences();

  const [budget, setBudget] = useState(prefs?.preferredMonthlyBudget?.toString() ?? "");
  const [gpa, setGpa] = useState(prefs?.gpa?.toString() ?? "");
  const [ielts, setIelts] = useState(prefs?.ieltsScore?.toString() ?? "");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(prefs?.preferredCountries ?? []);
  const [searched, setSearched] = useState(false);

  const params = {
    budget: budget ? Number(budget) : undefined,
    gpa: gpa ? Number(gpa) : undefined,
    ielts: ielts ? Number(ielts) : undefined,
    countries: selectedCountries.length > 0 ? selectedCountries.join(",") : undefined,
  };

  const { data, isLoading, isError } = useMatches(params, searched);

  function handleFind(): void {
    setSearched(true);
  }

  function handleClear(): void {
    setBudget("");
    setGpa("");
    setIelts("");
    setSelectedCountries([]);
    setSearched(false);
  }

  function toggleCountry(name: string): void {
    setSelectedCountries((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  const hasFilled = budget || gpa || ielts || selectedCountries.length > 0;
  const matches = data?.matches ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald-400 blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">Matches for You</h1>
          <p className="mt-2 text-emerald-100">Find programs that match your profile and preferences</p>
        </div>
      </div>

      {/* Preferences Form */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-[#0F172A] mb-4">Your Preferences</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">Monthly Budget (€)</Label>
            <Input type="number" placeholder="e.g. 1500" value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="rounded-lg border-slate-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">GPA</Label>
            <Input type="number" step="0.1" min="0" max="4" placeholder="e.g. 3.5" value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              className="rounded-lg border-slate-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">IELTS Score</Label>
            <Input type="number" step="0.5" min="0" max="9" placeholder="e.g. 6.5" value={ielts}
              onChange={(e) => setIelts(e.target.value)}
              className="rounded-lg border-slate-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-500">Preferred Countries</Label>
            <Select value="" onValueChange={(v) => { if (v) toggleCountry(v); }}>
              <SelectTrigger className="rounded-lg border-slate-200">
                <SelectValue placeholder={selectedCountries.length > 0 ? `${selectedCountries.length} selected` : "Select countries"} />
              </SelectTrigger>
              <SelectContent>
                {countries?.map((c) => (
                  <SelectItem key={c._id} value={c.name}>
                    <span className="flex items-center gap-2">
                      {selectedCountries.includes(c.name) && <span className="text-emerald-500">✓</span>}
                      {COUNTRY_FLAGS[c.name] ?? ""} {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCountries.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedCountries.map((c) => (
                  <Badge key={c} variant="secondary" className="cursor-pointer" onClick={() => toggleCountry(c)}>
                    {c} ✕
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 pt-4 border-t border-slate-100">
          <Button onClick={handleFind} disabled={!hasFilled}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg">
            <Sparkles className="mr-1.5 h-4 w-4" /> Find Matches
          </Button>
          {searched && (
            <Button variant="outline" onClick={handleClear} className="rounded-lg border-slate-200">
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {searched && isLoading && (
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-52 rounded-2xl" />))}
        </div>
      )}

      {searched && isError && (
        <div className="rounded-2xl bg-white p-12 shadow-sm border border-slate-100 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">Failed to load matches</h2>
          <p className="text-slate-500">Please try again later</p>
        </div>
      )}

      {searched && !isLoading && !isError && matches.length === 0 && (
        <div className="rounded-2xl bg-white p-12 shadow-sm border border-slate-100 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 mx-auto mb-4">
            <Search className="h-10 w-10 text-teal-500" />
          </div>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">No matches found</h2>
          <p className="text-slate-500">Try adjusting your preferences or budget range</p>
        </div>
      )}

      {searched && !isLoading && !isError && matches.length > 0 && (
        <>
          <p className="text-sm text-slate-500">{data?.total ?? matches.length} match{matches.length === 1 ? "" : "es"} found</p>

          {/* Admit Chance Legend */}
          {matches.some((m) => m.admitChance) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
              <span className="font-medium text-[#0F172A]">Admit Chance:</span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" /> Safe — Likely admission
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" /> Target — Competitive
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" /> Reach — Stretch goal
              </span>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {matches.map((m) => (
              <MatchCard key={m._id} match={m} />
            ))}
          </div>
        </>
      )}

      {!searched && (
        <div className="rounded-2xl bg-white p-12 shadow-sm border border-slate-100 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 mx-auto mb-4">
            <Sparkles className="h-10 w-10 text-teal-500" />
          </div>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">Enter your preferences</h2>
          <p className="text-slate-500">Fill in your budget, GPA, IELTS score, and preferred countries to find matching programs</p>
        </div>
      )}
    </div>
  );
}
