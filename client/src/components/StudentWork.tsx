import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Student } from "@/types/student";
import { useAddPayment, useAddTask, useRemovePayment, useRemoveTask, useSetFee, useUpdateTask } from "@/lib/api-agency-work";
import { cn, getErrorMessage } from "@/lib/utils";
import { daysUntil, formatDate, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Section } from "@/components/kit";

const today = (): string => new Date().toISOString().slice(0, 10);

function dueLabel(dueDate?: string): { text: string; tone: string } | null {
  const d = daysUntil(dueDate);
  if (d === null) return null;
  if (d < 0) return { text: `${Math.abs(d)} d overdue`, tone: "text-stamp font-semibold" };
  if (d === 0) return { text: "Today", tone: "text-stamp font-semibold" };
  if (d === 1) return { text: "Tomorrow", tone: "text-ochre font-semibold" };
  return { text: formatDate(dueDate), tone: "text-ink-3" };
}

/** The counsellor's to-do list for one student. */
export function FollowUps({ student }: { student: Student }): React.ReactElement {
  const add = useAddTask();
  const update = useUpdateTask();
  const remove = useRemoveTask();
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showDone, setShowDone] = useState(false);

  const tasks = student.tasks ?? [];
  const open = tasks
    .filter((t) => !t.done)
    .sort((a, b) => (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - (b.dueDate ? new Date(b.dueDate).getTime() : Infinity));
  const done = tasks.filter((t) => t.done).sort((a, b) => new Date(b.doneAt ?? b.createdAt).getTime() - new Date(a.doneAt ?? a.createdAt).getTime());

  async function onAdd(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await add.mutateAsync({ studentId: student._id, text: text.trim(), dueDate: dueDate || undefined });
      setText("");
      setDueDate("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't add the follow-up"));
    }
  }

  async function setDone(taskId: string, value: boolean): Promise<void> {
    try {
      await update.mutateAsync({ studentId: student._id, taskId, done: value });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't update the follow-up"));
    }
  }

  return (
    <Section title="Follow-ups" count={open.length}>
      <div className="card overflow-hidden">
        <form onSubmit={onAdd} className="flex flex-wrap gap-2 border-b border-rule-soft p-4">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Call the parents about the deposit"
            className="min-w-0 flex-1 basis-56"
            aria-label="New follow-up"
          />
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-40" aria-label="Due date" min={today()} />
          <Button type="submit" variant="primary" disabled={!text.trim() || add.isPending} className="h-10">
            {add.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            Add
          </Button>
        </form>
        {open.length === 0 ? (
          <p className="px-5 py-4 text-sm text-ink-3">Nothing to do for {student.name.split(" ")[0]} right now.</p>
        ) : (
          <ul className="divide-y divide-rule-soft">
            {open.map((t) => {
              const due = dueLabel(t.dueDate);
              return (
                <li key={t._id} className="flex items-center gap-3 px-5 py-3">
                  <Checkbox checked={false} onCheckedChange={() => setDone(t._id, true)} aria-label={`Mark "${t.text}" done`} />
                  <span className="min-w-0 flex-1 text-[14.5px] text-ink">{t.text}</span>
                  {due && <span className={cn("text-[13px] whitespace-nowrap tnum", due.tone)}>{due.text}</span>}
                  <button
                    type="button"
                    onClick={() => remove.mutate({ studentId: student._id, taskId: t._id })}
                    className="rounded-lg p-1 text-ink-4 hover:bg-stamp-soft hover:text-stamp"
                    aria-label={`Delete "${t.text}"`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {done.length > 0 && (
          <div className="border-t border-rule-soft px-5 py-2.5">
            <button type="button" onClick={() => setShowDone((v) => !v)} className="text-[13px] font-semibold text-ink-3 hover:text-ink">
              {showDone ? "Hide" : "Show"} {done.length} done
            </button>
            {showDone && (
              <ul className="mt-2 space-y-1.5 pb-1">
                {done.map((t) => (
                  <li key={t._id} className="flex items-center gap-3 text-[13.5px] text-ink-3">
                    <Checkbox checked onCheckedChange={() => setDone(t._id, false)} aria-label={`Reopen "${t.text}"`} />
                    <span className="flex-1 line-through decoration-ink-4">{t.text}</span>
                    {t.doneAt && <span className="text-xs tnum">{formatDate(t.doneAt)}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}

/** What the family agreed to pay the agency and what's come in. */
export function Payments({ student }: { student: Student }): React.ReactElement {
  const setFee = useSetFee();
  const add = useAddPayment();
  const remove = useRemovePayment();
  const currency = student.feeCurrency ?? "DZD";
  const [editingFee, setEditingFee] = useState(student.feeAgreed == null);
  const [fee, setFeeText] = useState(student.feeAgreed?.toString() ?? "");
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(today());
  const [method, setMethod] = useState("");

  const payments = (student.payments ?? []).slice().sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = student.feeAgreed != null ? Math.max(0, student.feeAgreed - paid) : null;
  const pct = student.feeAgreed ? Math.min(100, Math.round((paid / student.feeAgreed) * 100)) : 0;

  async function saveFee(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    try {
      await setFee.mutateAsync({ studentId: student._id, feeAgreed: fee ? Number(fee) : null, feeCurrency: currency });
      setEditingFee(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't save the fee"));
    }
  }

  async function addPayment(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    try {
      await add.mutateAsync({ studentId: student._id, amount: Number(amount), paidAt, method: method.trim() || undefined });
      toast.success(`${formatMoney(Number(amount), currency)} recorded`);
      setAmount("");
      setMethod("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't record the payment"));
    }
  }

  return (
    <div>
      <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">Payments</p>
      <div className="card p-5">
        {editingFee ? (
          <form onSubmit={saveFee} className="grid gap-2">
            <label htmlFor="fee" className="text-[13px] font-semibold text-ink-2">
              Agreed fee ({currency})
            </label>
            <div className="flex gap-2">
              <Input id="fee" type="number" inputMode="numeric" min="0" value={fee} onChange={(e) => setFeeText(e.target.value)} placeholder="150000" />
              <Button type="submit" variant="primary" disabled={setFee.isPending}>
                Save
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] text-ink-3">Agreed</span>
              <button type="button" onClick={() => setEditingFee(true)} className="text-[15px] font-bold text-ink tnum hover:text-brand-ink">
                {formatMoney(student.feeAgreed ?? 0, currency)}
              </button>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-sunken">
              <div className={cn("h-full rounded-full", balance === 0 ? "bg-moss-solid" : "bg-brand")} style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[13px] tnum">
              <span className="text-ink-2">Paid {formatMoney(paid, currency)}</span>
              <span className={cn("font-semibold", balance === 0 ? "text-moss" : "text-ink")}>
                {balance === 0 ? "Fully paid" : `${formatMoney(balance ?? 0, currency)} left`}
              </span>
            </div>
          </>
        )}

        <form onSubmit={addPayment} className="mt-4 grid gap-2 border-t border-rule-soft pt-4">
          <p className="text-[13px] font-semibold text-ink-2">Record a payment</p>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" inputMode="numeric" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" aria-label="Amount" />
            <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} aria-label="Paid on" max={today()} />
          </div>
          <div className="flex gap-2">
            <Input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Cash, CCP, BaridiMob…" aria-label="How they paid" />
            <Button type="submit" variant="outline" disabled={!amount || Number(amount) <= 0 || add.isPending}>
              Add
            </Button>
          </div>
        </form>

        {payments.length > 0 && (
          <ul className="mt-3 divide-y divide-rule-soft text-[13px]">
            {payments.map((p) => (
              <li key={p._id} className="flex items-center gap-2 py-2">
                <span className="font-semibold text-ink tnum">{formatMoney(p.amount, currency)}</span>
                <span className="min-w-0 flex-1 truncate text-ink-3">
                  {formatDate(p.paidAt)}
                  {p.method ? ` · ${p.method}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => remove.mutate({ studentId: student._id, paymentId: p._id })}
                  className="rounded-lg p-1 text-ink-4 hover:bg-stamp-soft hover:text-stamp"
                  aria-label="Delete this payment"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
