import { useState } from "react";
import { useUniversities } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GitCompare, X, AlertCircle } from "lucide-react";

const MAX_COMPARE = 3;

function formatCurrency(
  amount: number,
  currency: string,
  period: string,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ` / ${period.toLowerCase()}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function bestValue(
  values: (number | undefined)[],
  mode: "lowest" | "highest",
): number | undefined {
  const defined = values.filter(
    (v): v is number => v !== undefined && v !== null,
  );
  if (defined.length < 2) return undefined;
  return mode === "lowest"
    ? Math.min(...defined)
    : Math.max(...defined);
}

function CompareRow({
  label,
  values,
  bestMode,
  format,
}: {
  label: string;
  values: (string | number | undefined)[];
  bestMode?: "lowest" | "highest";
  format?: "currency" | "date";
}): React.ReactElement {
  // For "best" highlighting
  let bestVal: number | undefined;
  let bestIndex: number | undefined;
  if (bestMode && format === "currency") {
    const nums = values.map((v) =>
      typeof v === "number" ? v : undefined,
    );
    bestVal = bestValue(nums, bestMode);
    if (bestVal !== undefined) {
      bestIndex = nums.indexOf(bestVal);
    }
  }

  return (
    <tr className="border-b">
      <td className="py-3 pr-4 text-sm font-medium text-muted-foreground">
        {label}
      </td>
      {values.map((val, i) => {
        const isBest =
          bestIndex !== undefined && i === bestIndex;
        let display: string;
        if (format === "currency" && typeof val === "number") {
          display = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(val);
        } else if (format === "date" && typeof val === "string") {
          display = formatDate(val);
        } else if (val !== undefined && val !== null && val !== "") {
          display = String(val);
        } else {
          display = "—";
        }
        return (
          <td
            key={i}
            className={`py-3 text-sm ${isBest ? "font-semibold text-emerald-600" : ""}`}
          >
            {display}
          </td>
        );
      })}
    </tr>
  );
}

export default function Compare(): React.ReactElement {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data, isLoading, isError, error } = useUniversities();

  const universities = data?.universities ?? [];
  const selected = universities.filter((u) => selectedIds.includes(u._id));

  function toggleUniversity(id: string): void {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev;
      }
      return [...prev, id];
    });
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load universities</h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Compare Universities</h1>

      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Select Universities (up to {MAX_COMPARE})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id) => {
                const u = universities.find((x) => x._id === id);
                if (!u) return null;
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="cursor-pointer gap-1 px-3 py-1.5 text-sm"
                    onClick={() => toggleUniversity(id)}
                  >
                    {u.name}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                );
              })}
              {selectedIds.length < MAX_COMPARE && (
                <Select
                  value=""
                  onValueChange={(v: string) => {
                    if (v) toggleUniversity(v);
                  }}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Search and select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {universities
                      .filter((u) => !selectedIds.includes(u._id))
                      .map((u) => (
                        <SelectItem key={u._id} value={u._id}>
                          {u.name} — {u.country}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selected.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <GitCompare className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="text-lg font-semibold">Select universities to compare</h2>
            <p className="text-sm text-muted-foreground">
              Choose up to {MAX_COMPARE} universities from the dropdown above
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Comparison</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 pr-4 text-left text-sm font-medium text-muted-foreground">
                    Attribute
                  </th>
                  {selected.map((u) => (
                    <th key={u._id} className="py-3 pr-4 text-left text-sm">
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.city}, {u.country}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  label="Country"
                  values={selected.map((u) => u.country)}
                />
                <CompareRow
                  label="City"
                  values={selected.map((u) => u.city)}
                />
                <CompareRow
                  label="Program"
                  values={selected.map((u) => u.program)}
                />
                <CompareRow
                  label="Degree"
                  values={selected.map((u) => u.degreeLevel)}
                />
                <CompareRow
                  label="Tuition"
                  values={selected.map((u) =>
                    formatCurrency(
                      u.tuitionFee,
                      u.tuitionCurrency,
                      u.tuitionPeriod,
                    ),
                  )}
                />
                <CompareRow
                  label="Tuition (raw)"
                  values={selected.map((u) => u.tuitionFee)}
                  bestMode="lowest"
                  format="currency"
                />
                {selected.some((u) => u.livingCostEstimate) && (
                  <CompareRow
                    label="Living Cost"
                    values={selected.map((u) => u.livingCostEstimate)}
                    bestMode="lowest"
                    format="currency"
                  />
                )}
                <CompareRow
                  label="GPA Req"
                  values={selected.map((u) => u.gpaRequirement)}
                />
                <CompareRow
                  label="IELTS"
                  values={selected.map((u) => u.ieltsRequirement)}
                />
                <CompareRow
                  label="TOEFL"
                  values={selected.map((u) => u.toeflRequirement)}
                />
                <CompareRow
                  label="Deadline"
                  values={selected.map((u) => u.applicationDeadline)}
                  format="date"
                />
                <CompareRow
                  label="Status"
                  values={selected.map((u) => u.applicationStatus)}
                />
                <CompareRow
                  label="Scholarship"
                  values={selected.map((u) =>
                    u.scholarshipAvailable ? "Yes" : "No",
                  )}
                />
                <CompareRow
                  label="Visa"
                  values={selected.map((u) => u.visaRequirements)}
                />
                <CompareRow
                  label="Language"
                  values={selected.map((u) => u.languageOfInstruction)}
                />
                {selected.some((u) => u.ranking) && (
                  <CompareRow
                    label="Ranking"
                    values={selected.map((u) => u.ranking)}
                    bestMode="highest"
                    format="currency"
                  />
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
