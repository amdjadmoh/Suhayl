import { useState } from "react";
import { usePrograms, useBudgetCalculation } from "@/lib/api";
import type { Program } from "@/types/program";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calculator, Wallet, TrendingUp, BookOpen, DollarSign, AlertCircle } from "lucide-react";

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BudgetCalculator(): React.ReactElement {
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");

  const { data: programsData, isLoading: programsLoading } = usePrograms();
  const { data: budget, isLoading: budgetLoading } = useBudgetCalculation(selectedProgramId || null);

  const programs = programsData?.programs ?? [];

  const selectedProgram = programs.find(
    (p) => p._id === selectedProgramId,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald-400 blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">Budget Calculator</h1>
          <p className="mt-2 text-emerald-100">
            Estimate your total study costs including tuition, living expenses, visa fees, and insurance
          </p>
        </div>
      </div>

      {/* Program Selector */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-[#0F172A]">
            <Calculator className="h-5 w-5 text-[#0EA5E9]" />
            Select a Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          {programsLoading ? (
            <Skeleton className="h-10 w-full rounded-lg" />
          ) : (
            <Select
              value={selectedProgramId}
              onValueChange={(v) => setSelectedProgramId(v)}
            >
              <SelectTrigger className="w-full rounded-lg border-slate-200">
                <SelectValue placeholder="Choose a program to calculate costs..." />
              </SelectTrigger>
              <SelectContent>
                {programs.map((p) => {
                  const uni =
                    typeof p.universityId === "object" ? p.universityId : null;
                  return (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                      {uni ? ` — ${uni.name}` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {selectedProgramId && budgetLoading && (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {selectedProgramId && !budgetLoading && !budget && (
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="mb-4 h-12 w-12 text-slate-300" />
            <h2 className="text-lg font-semibold text-[#0F172A]">
              No budget data available
            </h2>
            <p className="text-sm text-slate-500">
              Budget information is not available for this program yet.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedProgramId && budget && (
        <>
          {/* Program summary */}
          {selectedProgram && (
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A]">
                    {selectedProgram.name}
                  </h3>
                  {(() => {
                    const uni =
                      typeof selectedProgram.universityId === "object"
                        ? selectedProgram.universityId
                        : null;
                    return uni ? (
                      <p className="text-sm text-slate-500">
                        {uni.name} · {uni.country}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-700 rounded-full"
              >
                {selectedProgram.degreeLevel}
              </Badge>
              <span className="mx-2 text-slate-300">·</span>
              <span className="text-sm text-slate-500">
                {formatCurrency(
                  selectedProgram.tuitionFee,
                  selectedProgram.tuitionCurrency,
                )}
                /{selectedProgram.tuitionPeriod?.toLowerCase()}
              </span>
            </div>
          )}

          {/* Breakdown Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">Tuition</p>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">
                {formatCurrency(budget.tuition, budget.currency)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedProgram?.tuitionPeriod?.toLowerCase() ?? "per year"}
              </p>
            </div>

            <div className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">Living Costs</p>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">
                {formatCurrency(budget.livingCost, budget.currency)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Monthly × duration</p>
            </div>

            <div className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-amber-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">Visa / Blocked Account</p>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">
                {formatCurrency(budget.visaFees, budget.currency)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Visa application & blocked account</p>
            </div>

            <div className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-rose-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">Insurance</p>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/20">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">
                {formatCurrency(budget.insurance, budget.currency)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Health insurance estimate</p>
            </div>
          </div>

          {/* Total */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0F172A] via-slate-900 to-slate-800 p-8 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Estimated Total Cost</p>
                <p className="text-4xl font-bold mt-2">
                  {formatCurrency(budget.total, budget.currency)}
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Calculator className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          {budget.breakdown && budget.breakdown.length > 0 && (
            <Card className="border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-[#0F172A]">
                  <Calculator className="h-5 w-5 text-[#0EA5E9]" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-slate-100">
                  {budget.breakdown.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-medium text-[#0F172A]">
                        {formatCurrency(item.amount, budget.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-3 text-sm font-bold">
                    <span className="text-[#0F172A]">Total</span>
                    <span className="text-[#0F172A]">
                      {formatCurrency(
                        budget.breakdown.reduce((sum, b) => sum + b.amount, 0),
                        budget.currency,
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!selectedProgramId && !programsLoading && (
        <div className="rounded-2xl bg-white p-12 shadow-sm border border-slate-100 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 mx-auto mb-4">
            <Calculator className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
            Select a program to begin
          </h2>
          <p className="text-slate-500">
            Choose a program from the dropdown above to see a detailed cost
            breakdown including tuition, living costs, visa fees, and insurance.
          </p>
        </div>
      )}
    </div>
  );
}
