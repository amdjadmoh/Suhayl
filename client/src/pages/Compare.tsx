import { useState } from "react";
import { useApplications } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GitCompare, X, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const MAX_COMPARE = 3;

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getProgName(a: any): string {
  return typeof a.programId === "object" && a.programId?.name ? a.programId.name : "Program";
}

function getUniName(a: any): string {
  return typeof a.programId === "object" && a.programId?.universityId?.name ? a.programId.universityId.name : "";
}

function getUniCountry(a: any): string {
  return typeof a.programId === "object" && a.programId?.universityId?.country ? a.programId.universityId.country : "";
}

function CompareRow({ label, values }: { label: string; values: (string | number | undefined)[] }): React.ReactElement {
  return (
    <tr className="border-b">
      <td className="py-3 pr-4 text-sm font-medium text-muted-foreground">{label}</td>
      {values.map((val, i) => (
        <td key={i} className="py-3 text-sm">{val !== undefined && val !== null && val !== "" ? String(val) : "—"}</td>
      ))}
    </tr>
  );
}

export default function Compare(): React.ReactElement {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data, isLoading, isError, error } = useApplications();
  const applications = data?.applications ?? [];

  function toggleApplication(id: string): void {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load applications</h2>
        <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  const selected = applications.filter((a) => selectedIds.includes(a._id));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Compare Applications</h1>

      <Card>
        <CardHeader><CardTitle className="text-lg">Select Applications (up to {MAX_COMPARE})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-10 w-full" /> : (
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id) => {
                const a = applications.find((x) => x._id === id);
                if (!a) return null;
                return (
                  <Badge key={id} variant="secondary" className="cursor-pointer gap-1 px-3 py-1.5 text-sm" onClick={() => toggleApplication(id)}>
                    {getProgName(a)} <X className="ml-1 h-3 w-3" />
                  </Badge>
                );
              })}
              {selectedIds.length < MAX_COMPARE && (
                <Select value="" onValueChange={(v) => { if (v) toggleApplication(v); }}>
                  <SelectTrigger className="w-[250px]"><SelectValue placeholder="Search and select..." /></SelectTrigger>
                  <SelectContent>
                    {applications.filter((a) => !selectedIds.includes(a._id)).map((a) => (
                      <SelectItem key={a._id} value={a._id}>{getProgName(a)} — {getUniName(a)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selected.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <GitCompare className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="text-lg font-semibold">Select applications to compare</h2>
            <p className="text-sm text-muted-foreground">Choose up to {MAX_COMPARE} applications</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Comparison</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>Clear All</Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 pr-4 text-left text-sm font-medium text-muted-foreground">Attribute</th>
                  {selected.map((a) => (
                    <th key={a._id} className="py-3 pr-4 text-left text-sm">
                      <Link to={`/applications/${a._id}`} className="font-semibold hover:text-primary">{getProgName(a)}</Link>
                      <div className="text-xs text-muted-foreground">{getUniName(a)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <CompareRow label="Program" values={selected.map((a) => getProgName(a))} />
                <CompareRow label="University" values={selected.map((a) => getUniName(a))} />
                <CompareRow label="Country" values={selected.map((a) => getUniCountry(a))} />
                <CompareRow label="Student" values={selected.map((a) => a.studentName)} />
                <CompareRow label="Status" values={selected.map((a) => a.applicationStatus)} />
                <CompareRow label="Deadline" values={selected.map((a) => formatDate(a.applicationDeadline))} />
                {selected.some((a) => a.livingCostEstimate) && (
                  <CompareRow label="Living Cost" values={selected.map((a) => a.livingCostEstimate ? `€${a.livingCostEstimate.toLocaleString()}` : undefined)} />
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
