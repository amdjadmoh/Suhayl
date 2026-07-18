import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { getProgram } from "@/lib/api";
import { useCompare } from "@/lib/compareContext";
import type { Program } from "@/types/program";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GitCompare, X, ArrowRight, BookOpen, MapPin, CheckCircle2, XCircle,
} from "lucide-react";

function formatCurrency(amount: number, currency: string, period: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) + ` / ${period.toLowerCase()}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getUni(program: Program) {
  return typeof program.universityId === "object" ? program.universityId : null;
}

export default function Compare(): React.ReactElement {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();

  const queries = useQueries({
    queries: compareIds.map((id) => ({
      queryKey: ["programs", id],
      queryFn: () => getProgram(id),
      staleTime: 60 * 1000,
    })),
  });

  const programs = queries
    .filter((q) => q.data)
    .map((q) => q.data as Program);

  const isLoading = queries.some((q) => q.isLoading);

  if (compareIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0EA5E9]/10 mb-5">
          <GitCompare className="h-10 w-10 text-[#0EA5E9]" />
        </div>
        <h2 className="text-xl font-semibold text-[#0F172A] mb-2">Nothing to compare yet</h2>
        <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
          Add programs to your comparison list by clicking "Add to Compare" on any program page or listing.
        </p>
        <Button asChild className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-xl">
          <Link to="/programs">
            Browse Programs <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Compare Programs</h1>
          <p className="text-sm text-slate-500">
            Comparing {compareIds.length} program{compareIds.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" onClick={clearCompare} className="border-slate-200 rounded-xl">
          Clear All
        </Button>
      </div>

      {isLoading && programs.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {compareIds.map((id) => (
            <Skeleton key={id} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Program cards summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => {
              const uni = getUni(program);
              return (
                <div key={program._id} className="relative rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <button
                    onClick={() => removeFromCompare(program._id)}
                    className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0EA5E9]/10">
                        <BookOpen className="h-5 w-5 text-[#0EA5E9]" />
                      </div>
                      <Badge className="rounded-full bg-slate-100 text-slate-700">{program.degreeLevel}</Badge>
                    </div>

                    <Link to={`/programs/${program._id}`} className="block">
                      <h3 className="text-base font-semibold text-[#0F172A] hover:text-[#0EA5E9] transition-colors mb-1">
                        {program.name}
                      </h3>
                    </Link>

                    {uni && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                        <MapPin className="h-3.5 w-3.5" />
                        {uni.name} · {uni.country}
                      </div>
                    )}

                    <div className="space-y-1.5 pt-3 border-t border-slate-50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Tuition</span>
                        <span className="font-semibold text-[#0F172A]">{formatCurrency(program.tuitionFee, program.tuitionCurrency, program.tuitionPeriod)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Language</span>
                        <span className="text-[#0F172A]">{program.languageOfInstruction}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Deadline</span>
                        <span className="text-[#0F172A]">{formatDate(program.applicationDeadline)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Scholarship</span>
                        {program.scholarshipAvailable ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full text-xs">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Available
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-50 text-slate-500 border-slate-200 rounded-full text-xs">
                            <XCircle className="mr-1 h-3 w-3" /> None
                          </Badge>
                        )}
                      </div>
                      {uni?.ranking && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Ranking</span>
                          <span className="font-semibold text-[#0F172A]">#{uni.ranking}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side-by-side comparison table */}
          {programs.length >= 2 && (
            <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4">
                <h3 className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-slate-400" />
                  Side-by-Side Comparison
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-500 w-[180px]">Attribute</th>
                      {programs.map((p) => (
                        <th key={p._id} className="px-4 py-3 text-left text-sm font-semibold text-[#0F172A] min-w-[200px]">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <TableRow label="Degree" values={programs.map((p) => p.degreeLevel)} />
                    <TableRow label="University" values={programs.map((p) => getUni(p)?.name ?? "—")} />
                    <TableRow label="Country" values={programs.map((p) => getUni(p)?.country ?? "—")} />
                    <TableRow label="City" values={programs.map((p) => getUni(p)?.city ?? "—")} />
                    <TableRow label="Language" values={programs.map((p) => p.languageOfInstruction)} />
                    <TableRow label="Tuition" values={programs.map((p) => formatCurrency(p.tuitionFee, p.tuitionCurrency, p.tuitionPeriod))} />
                    <TableRow label="Deadline" values={programs.map((p) => formatDate(p.applicationDeadline))} />
                    <TableRow label="Test Req." values={programs.map((p) => (p.testRequirements ?? []).map((tr) => `${tr.name} ${tr.minimumScore}`).join(", ") || "—")} />
                    <TableRow
                      label="Scholarship"
                      values={programs.map((p) => (p.scholarshipAvailable ? "Available" : "No"))}
                    />
                    <TableRow label="Ranking" values={programs.map((p) => getUni(p)?.ranking ? `#${getUni(p)?.ranking}` : "—")} />
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TableRow({ label, values }: { label: string; values: string[] }): React.ReactElement {
  return (
    <tr className="border-b border-slate-50 transition-colors hover:bg-slate-50/30">
      <td className="px-6 py-3 text-sm font-medium text-slate-500">{label}</td>
      {values.map((val, i) => (
        <td key={i} className="px-4 py-3 text-sm text-[#0F172A]">{val}</td>
      ))}
    </tr>
  );
}
