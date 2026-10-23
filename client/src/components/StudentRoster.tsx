import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Copy, FileText, Loader2, Search, X } from "lucide-react";
import type { Student } from "@/types/student";
import type { Application } from "@/types/application";
import type { DocumentRequest } from "@/types/document";
import { STAGES, summarise, type Stage, type StudentSummary } from "@/lib/agencyInsights";
import { useBulkRequestDocument } from "@/lib/api-agency-work";
import { useBulkAssign, useTeam } from "@/lib/api-team";
import { useAuth } from "@/lib/authContext";
import { COMMON_DOCUMENTS } from "@/lib/documentPresets";
import { cn, getErrorMessage } from "@/lib/utils";
import { formatMoney, plural, shortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DaysLeft, Field, StatusTag } from "@/components/kit";

type Sort = "urgent" | "deadline" | "name" | "newest" | "balance";
type Quick = "attention" | "owes" | "new" | null;

const PAGE = 50;
const ALL = "all";

/** Lower is more urgent: missed deadlines, then this week, then follow-ups and documents. */
function urgency(s: StudentSummary): number {
  if (s.missed.length) return 0;
  if (s.dueThisWeek.length) return 1;
  if (s.tasksDue.length) return 2;
  if (s.docsToCheck || s.docsLate) return 3;
  return 4;
}

function money(amount: number, currency = "DZD"): string {
  return formatMoney(amount, currency);
}

function BulkAskDialog({
  open,
  onOpenChange,
  students,
  onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  students: StudentSummary[];
  onDone: () => void;
}): React.ReactElement {
  const bulk = useBulkRequestDocument();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    try {
      const r = await bulk.mutateAsync({
        studentIds: students.map((s) => s.student._id),
        title: title.trim(),
        note: note.trim() || undefined,
        dueDate: dueDate || undefined,
      });
      toast.success(`Asked ${plural(r.requested, "student")} for ${title.trim()}`, {
        description: r.alreadyAsked ? `${plural(r.alreadyAsked, "student")} already had this request open.` : undefined,
      });
      setTitle("");
      setNote("");
      setDueDate("");
      onOpenChange(false);
      onDone();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't send the requests"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Ask {plural(students.length, "student")} for a document</DialogTitle>
            <DialogDescription>
              It appears on each family link. Students who already have the same request open are skipped.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {COMMON_DOCUMENTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTitle(t)}
                aria-pressed={title === t}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                  title === t ? "border-brand bg-brand text-on-brand" : "border-rule bg-paper-raised text-ink-2 hover:bg-paper-hover",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
            <Field label="Document" htmlFor="bulk-title">
              <Input id="bulk-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Or type your own" />
            </Field>
            <Field label="Needed by" htmlFor="bulk-due">
              <Input id="bulk-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
            <Field label="Note for them" htmlFor="bulk-note" className="sm:col-span-2">
              <Input id="bulk-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Valid for at least 18 months" />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!title.trim() || bulk.isPending}>
              {bulk.isPending && <Loader2 className="animate-spin" />}
              Ask {plural(students.length, "student")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StudentRoster({
  students,
  applications,
  documents,
  onEdit,
  onDelete,
}: {
  students: Student[];
  applications: Application[];
  documents: DocumentRequest[];
  onEdit: (s: Student) => void;
  onDelete: (s: Student) => void;
}): React.ReactElement {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<Stage | typeof ALL>(ALL);
  const [intake, setIntake] = useState<string>(ALL);
  const [country, setCountry] = useState<string>(ALL);
  // The dashboard links here with ?show=attention or ?show=owes
  const [searchParams] = useSearchParams();
  const [quick, setQuick] = useState<Quick>(() => {
    const show = searchParams.get("show");
    return show === "attention" || show === "owes" || show === "new" ? show : null;
  });
  // ?counsellor=<id> or ?counsellor=none; a counsellor starts on their own students
  const { user } = useAuth();
  const { data: team } = useTeam();
  const members = team?.members ?? [];
  const hasTeam = members.length > 1;
  const [counsellor, setCounsellor] = useState<string>(
    () => searchParams.get("counsellor") ?? (user?.agencyRole === "counsellor" && user ? user._id : ALL),
  );
  const bulkAssign = useBulkAssign();
  const memberName = (id?: string | null): string | null => members.find((m) => m._id === id)?.name ?? null;
  const [sort, setSort] = useState<Sort>("urgent");
  const [shown, setShown] = useState(PAGE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [askOpen, setAskOpen] = useState(false);

  const summaries = useMemo(() => summarise(students, applications, documents), [students, applications, documents]);

  const intakes = useMemo(
    () => [...new Set(summaries.map((s) => s.student.targetIntake).filter((v): v is string => !!v))].sort(),
    [summaries],
  );
  const countries = useMemo(
    () => [...new Set(summaries.flatMap((s) => [...s.countries, ...(s.student.preferredCountries ?? [])]))].sort(),
    [summaries],
  );
  const counts = useMemo(
    () => ({
      attention: summaries.filter((s) => s.attention.length).length,
      owes: summaries.filter((s) => (s.balance ?? 0) > 0).length,
      new: summaries.filter((s) => s.stage === "New").length,
    }),
    [summaries],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = summaries.filter((s) => {
      if (q && !`${s.student.name} ${s.student.email} ${s.student.phone ?? ""}`.toLowerCase().includes(q)) return false;
      if (stage !== ALL && s.stage !== stage) return false;
      if (counsellor === "none" && s.student.counsellorId) return false;
      if (counsellor !== ALL && counsellor !== "none" && s.student.counsellorId !== counsellor) return false;
      if (intake !== ALL && s.student.targetIntake !== intake) return false;
      if (country !== ALL && !s.countries.includes(country) && !(s.student.preferredCountries ?? []).includes(country)) return false;
      if (quick === "attention" && !s.attention.length) return false;
      if (quick === "owes" && !((s.balance ?? 0) > 0)) return false;
      if (quick === "new" && s.stage !== "New") return false;
      return true;
    });
    const byName = (a: StudentSummary, b: StudentSummary): number => a.student.name.localeCompare(b.student.name);
    const deadlineOf = (s: StudentSummary): number => (s.nextDeadline ? new Date(s.nextDeadline.applicationDeadline!).getTime() : Infinity);
    return list.sort((a, b) => {
      switch (sort) {
        case "urgent":
          return urgency(a) - urgency(b) || deadlineOf(a) - deadlineOf(b) || byName(a, b);
        case "deadline":
          return deadlineOf(a) - deadlineOf(b) || byName(a, b);
        case "newest":
          return new Date(b.student.createdAt).getTime() - new Date(a.student.createdAt).getTime();
        case "balance":
          return (b.balance ?? -1) - (a.balance ?? -1) || byName(a, b);
        default:
          return byName(a, b);
      }
    });
  }, [summaries, query, stage, intake, country, quick, sort, counsellor]);

  const page = visible.slice(0, shown);
  const selectedSummaries = summaries.filter((s) => selected.has(s.student._id));
  const allOnPageSelected = page.length > 0 && page.every((s) => selected.has(s.student._id));
  const filtered = !!query || stage !== ALL || intake !== ALL || country !== ALL || quick !== null || counsellor !== ALL;

  function toggle(id: string): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible(): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (visible.every((s) => next.has(s.student._id))) for (const s of visible) next.delete(s.student._id);
      else for (const s of visible) next.add(s.student._id);
      return next;
    });
  }

  function clearFilters(): void {
    setQuery("");
    setStage(ALL);
    setIntake(ALL);
    setCountry(ALL);
    setQuick(null);
    setCounsellor(ALL);
    setShown(PAGE);
  }

  async function assign(to: string): Promise<void> {
    const counsellorId = to === "none" ? null : to;
    try {
      const r = await bulkAssign.mutateAsync({ studentIds: [...selected], counsellorId });
      toast.success(
        counsellorId ? `${plural(r.updated, "student")} given to ${memberName(counsellorId) ?? "them"}` : `${plural(r.updated, "student")} unassigned`,
      );
      setSelected(new Set());
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't assign them"));
    }
  }

  async function copyPhones(): Promise<void> {
    const phones = selectedSummaries.map((s) => s.student.phone).filter(Boolean).join("\n");
    if (!phones) {
      toast.error("None of them have a phone number on file");
      return;
    }
    try {
      await navigator.clipboard.writeText(phones);
      toast.success(`Copied ${plural(phones.split("\n").length, "phone number")}`, { description: "Paste them into a WhatsApp broadcast list." });
    } catch {
      toast.error("Copy didn't work in this browser");
    }
  }

  const quickChip = (value: Exclude<Quick, null>, label: string, count: number): React.ReactElement => (
    <button
      type="button"
      onClick={() => {
        setQuick(quick === value ? null : value);
        setShown(PAGE);
      }}
      aria-pressed={quick === value}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors",
        quick === value ? "border-brand bg-brand text-on-brand" : "border-rule bg-paper-raised text-ink-2 hover:bg-paper-hover",
      )}
    >
      {label}
      <span className={cn("tnum", quick === value ? "opacity-80" : "text-ink-4")}>{count}</span>
    </button>
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {quickChip("attention", "Needs attention", counts.attention)}
        {quickChip("owes", "Owes a balance", counts.owes)}
        {quickChip("new", "No application yet", counts.new)}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,1fr))]">
        <div className="relative col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-4" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(PAGE);
            }}
            placeholder="Name, email or phone"
            className="pl-10"
            aria-label="Find a student"
          />
        </div>
        <Select value={stage} onValueChange={(v) => { setStage(v as Stage | typeof ALL); setShown(PAGE); }}>
          <SelectTrigger aria-label="Stage">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Every stage</SelectItem>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "New" ? "No application yet" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={intake} onValueChange={(v) => { setIntake(v); setShown(PAGE); }}>
          <SelectTrigger aria-label="Intake">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Every intake</SelectItem>
            {intakes.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={country} onValueChange={(v) => { setCountry(v); setShown(PAGE); }}>
          <SelectTrigger aria-label="Country">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Every country</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasTeam && (
          <Select value={counsellor} onValueChange={(v) => { setCounsellor(v); setShown(PAGE); }}>
            <SelectTrigger aria-label="Counsellor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Every counsellor</SelectItem>
              {user && <SelectItem value={user._id}>My students</SelectItem>}
              <SelectItem value="none">No counsellor</SelectItem>
              {members
                .filter((m) => m._id !== user?._id)
                .map((m) => (
                  <SelectItem key={m._id} value={m._id}>
                    {m.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger aria-label="Sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="urgent">Most urgent first</SelectItem>
            <SelectItem value="deadline">Next deadline</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="balance">Largest balance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[13px] text-ink-3">
        <span className="tnum">
          {visible.length === students.length ? plural(students.length, "student") : `${visible.length} of ${students.length} students`}
        </span>
        {filtered && (
          <button type="button" onClick={clearFilters} className="font-semibold text-brand-ink hover:underline">
            Clear filters
          </button>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-rule bg-paper-sunken/60">
              <th className="w-10 py-3 pl-5">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={toggleAllVisible}
                  aria-label={`Select all ${visible.length} shown`}
                />
              </th>
              <th className="kicker py-3 pr-3 pl-2 text-left">Student</th>
              <th className="kicker px-3 py-3 text-left">Stage</th>
              {hasTeam && <th className="kicker px-3 py-3 text-left">Counsellor</th>}
              <th className="kicker px-3 py-3 text-left">Next deadline</th>
              <th className="kicker px-3 py-3 text-left">Documents</th>
              <th className="kicker px-3 py-3 text-right">Balance</th>
              <th className="py-3 pr-5 pl-3" />
            </tr>
          </thead>
          <tbody>
            {page.map((s) => {
              const st = s.student;
              const checked = selected.has(st._id);
              return (
                <tr key={st._id} className={cn("border-b border-rule-soft transition-colors last:border-0", checked ? "bg-brand-soft/40" : "hover:bg-paper-hover")}>
                  <td className="py-3.5 pl-5 align-top">
                    <Checkbox checked={checked} onCheckedChange={() => toggle(st._id)} aria-label={`Select ${st.name}`} className="mt-0.5" />
                  </td>
                  <td className="max-w-[20rem] py-3.5 pr-3 pl-2 align-top">
                    <Link to={`/agency/students/${st._id}`} className="font-semibold text-ink hover:text-brand-ink">
                      {st.name}
                    </Link>
                    <p className="truncate text-[13px] text-ink-3">
                      {[st.degreeLevel, st.targetIntake].filter(Boolean).join(" · ") || st.email}
                      {s.apps.length > 0 && ` · ${plural(s.apps.length, "application")}`}
                    </p>
                    {s.attention.length > 0 && (
                      <p className="mt-1 text-[12.5px] font-semibold text-stamp">{s.attention.join(" · ")}</p>
                    )}
                  </td>
                  <td className="px-3 py-3.5 align-top">
                    {s.stage === "New" ? (
                      <span className="rounded-full bg-paper-sunken px-2.5 py-0.5 text-xs font-semibold text-ink-3">No application</span>
                    ) : (
                      <StatusTag status={s.stage} />
                    )}
                  </td>
                  {hasTeam && (
                    <td className="px-3 py-3.5 align-top text-[13px] whitespace-nowrap">
                      {memberName(st.counsellorId) ? (
                        <span className="font-medium text-ink-2">{memberName(st.counsellorId)!.split(" ")[0]}</span>
                      ) : (
                        <span className="text-ink-4">Nobody</span>
                      )}
                    </td>
                  )}
                  <td className="px-3 py-3.5 align-top whitespace-nowrap">
                    {s.nextDeadline ? (
                      <>
                        <span className="block text-[13px] font-medium text-ink-2 tnum">{shortDate(s.nextDeadline.applicationDeadline!)}</span>
                        <DaysLeft date={s.nextDeadline.applicationDeadline} short />
                      </>
                    ) : (
                      <span className="text-ink-4">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 align-top text-[13px] whitespace-nowrap">
                    {s.docsToCheck === 0 && s.docsOwed === 0 ? (
                      <span className="text-ink-4">—</span>
                    ) : (
                      <span className="flex flex-wrap gap-1.5">
                        {s.docsToCheck > 0 && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-ink">{s.docsToCheck} to check</span>}
                        {s.docsOwed > 0 && <span className="rounded-full bg-ochre-soft px-2 py-0.5 text-xs font-semibold text-ochre">{s.docsOwed} owed</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-right align-top whitespace-nowrap tnum">
                    {s.balance === null ? (
                      <span className="text-ink-4">—</span>
                    ) : s.balance === 0 ? (
                      <span className="text-[13px] font-semibold text-moss">Paid</span>
                    ) : (
                      <span className="text-[13px] font-semibold text-ink">{money(s.balance, st.feeCurrency)}</span>
                    )}
                  </td>
                  <td className="py-3.5 pr-5 pl-3 text-right align-top whitespace-nowrap">
                    <Button variant="ghost" size="xs" onClick={() => onEdit(st)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="xs" className="text-stamp hover:bg-stamp-soft hover:text-stamp" onClick={() => onDelete(st)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && <p className="py-10 text-center text-sm text-ink-3">Nobody matches these filters.</p>}
      </div>

      {visible.length > shown && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setShown((n) => n + PAGE)}>
            Show {Math.min(PAGE, visible.length - shown)} more
          </Button>
        </div>
      )}

      {selected.size > 0 && (
        <div className="sticky bottom-24 z-20 mt-4 md:bottom-6">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-paper shadow-[0_16px_40px_-12px_rgb(0_0_0/0.45)]">
            <span className="mr-auto text-sm font-semibold tnum">{plural(selected.size, "student")} selected</span>
            <Button size="sm" variant="primary" onClick={() => setAskOpen(true)}>
              <FileText />
              Ask for a document
            </Button>
            {hasTeam && (
              <Select value="" onValueChange={assign}>
                <SelectTrigger className="h-8 w-auto gap-1.5 rounded-full border-0 bg-paper-raised px-3 text-[13px] font-semibold text-ink" aria-label="Assign to">
                  <SelectValue placeholder="Assign to…" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m._id} value={m._id}>
                      {m._id === user?._id ? `${m.name} (me)` : m.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="none">No counsellor</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button size="sm" variant="secondary" onClick={copyPhones}>
              <Copy />
              Copy phone numbers
            </Button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="inline-flex size-8 items-center justify-center rounded-full text-paper/70 hover:bg-white/10 hover:text-paper"
              aria-label="Clear selection"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <BulkAskDialog open={askOpen} onOpenChange={setAskOpen} students={selectedSummaries} onDone={() => setSelected(new Set())} />
    </>
  );
}
