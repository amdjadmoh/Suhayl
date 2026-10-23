import { Link } from "react-router-dom";
import { ArrowLeft, Check, Minus, TriangleAlert, ShieldCheck, CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_META, countryCode, type ApplicationStatus } from "@/lib/constants";
import { daysUntil, ledgerDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

/* ─── Brand ─────────────────────────────────────────────────────────────── */

/** Suhayl (Canopus): a four-pointed star, drawn the way it is on the logo. */
export function StarGlyph({ className }: { className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className} fill="currentColor">
      <path d="M50 2C54 36 64 46 90 50 64 54 54 64 50 98 46 64 36 54 10 50 36 46 46 36 50 2Z" />
    </svg>
  );
}

export function Wordmark({
  className,
  showArabic = false,
}: {
  className?: string;
  showArabic?: boolean;
}): React.ReactElement {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink", className)}>
      <span className="flex size-[1.9em] items-center justify-center rounded-[0.6em] bg-brand text-on-brand">
        <StarGlyph className="size-[1.05em]" />
      </span>
      <span className="text-[1.2em] leading-none font-bold tracking-[-0.02em]">Suhayl</span>
      {showArabic && (
        <span lang="ar" dir="rtl" className="text-[0.95em] leading-none text-ink-3">
          سهيل
        </span>
      )}
    </span>
  );
}

/* ─── Page structure ────────────────────────────────────────────────────── */

export function BackLink({
  to,
  onClick,
  children,
}: {
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
}): React.ReactElement {
  const cls =
    "group -ml-2 inline-flex items-center gap-1.5 rounded-full py-1 pr-3 pl-2 text-sm font-medium text-ink-3 transition-colors hover:bg-paper-sunken hover:text-ink";
  const inner = (
    <>
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
      {children}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

/** Page heading: small grey context line, a big friendly title, a line of help, actions on the right. */
export function PageHeader({
  kicker,
  title,
  children,
  actions,
  back,
  className,
}: {
  kicker?: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  back?: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <header className={cn("mb-8", className)}>
      {back && <div className="mb-4">{back}</div>}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0 max-w-3xl">
          {kicker && <p className="kicker mb-1">{kicker}</p>}
          <h1 className="text-[28px] leading-[1.15] font-bold tracking-[-0.025em] text-ink sm:text-[34px]">{title}</h1>
          {children && <div className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-ink-3">{children}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function Section({
  title,
  count,
  action,
  children,
  className,
  id,
}: {
  title: React.ReactNode;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}): React.ReactElement {
  return (
    <section id={id} className={cn("min-w-0", className)}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-[17px] leading-tight font-bold tracking-[-0.01em] text-ink">
          {title}
          {count !== undefined && (
            <span className="rounded-full bg-paper-sunken px-2 py-0.5 text-xs font-semibold text-ink-3 tnum">{count}</span>
          )}
        </h2>
        {action && <div className="flex shrink-0 items-center gap-2 text-sm">{action}</div>}
      </div>
      {children}
    </section>
  );
}

/* ─── Key/value sheets ──────────────────────────────────────────────────── */

export function Facts({ children, className }: { children: React.ReactNode; className?: string }): React.ReactElement {
  return <dl className={cn("divide-y divide-rule-soft text-sm", className)}>{children}</dl>;
}

export function Fact({
  label,
  children,
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}): React.ReactElement | null {
  if (children === undefined || children === null || children === "") return null;
  return (
    <div className={cn("flex items-baseline gap-4 py-2.5", className)}>
      <dt className="shrink-0 text-ink-3">{label}</dt>
      <span className="leader" aria-hidden="true" />
      <dd className="min-w-0 max-w-[65%] text-right font-semibold text-ink">{children}</dd>
    </div>
  );
}

/* ─── Tags & marks ──────────────────────────────────────────────────────── */

const STATUS_PILL: Record<string, string> = {
  ink: "bg-paper-sunken text-ink-2",
  sea: "bg-brand-soft text-brand-ink",
  ochre: "bg-ochre-soft text-ochre",
  moss: "bg-moss-soft text-moss",
  stamp: "bg-stamp-soft text-stamp",
};

export function StatusTag({
  status,
  className,
}: {
  status: string;
  className?: string;
}): React.ReactElement {
  const meta = STATUS_META[status as ApplicationStatus];
  const enrolled = status === "Enrolled";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs leading-5 font-semibold whitespace-nowrap",
        enrolled ? "bg-moss-solid text-white dark:text-paper" : STATUS_PILL[meta?.tone ?? "ink"],
        className,
      )}
    >
      {enrolled ? (
        <Check className="size-3" strokeWidth={3} />
      ) : (
        <span className={cn("size-1.5 shrink-0 rounded-full", meta?.dot ?? "bg-ink-3")} />
      )}
      {status}
    </span>
  );
}

function tileIndex(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return (h % 6) + 1;
}

/** Rounded tile with the country's ISO code, tinted by country. */
export function CountryPlate({ country, className }: { country?: string; className?: string }): React.ReactElement {
  const n = country ? tileIndex(country) : 3;
  return (
    <span
      title={country}
      style={{ background: `var(--tile-${n}-bg)`, color: `var(--tile-${n}-fg)` }}
      className={cn(
        "inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg px-1 text-[11px] leading-none font-bold tracking-[0.02em]",
        className,
      )}
    >
      {countryCode(country)}
    </span>
  );
}

/** "12 days left" · "Today" · "3 days late", coloured by urgency. */
export function DaysLeft({
  date,
  className,
  short = false,
  hidePast = false,
}: {
  date?: string | null;
  className?: string;
  short?: boolean;
  /** Catalogue entries: a past deadline usually means last year's intake, not "late". */
  hidePast?: boolean;
}): React.ReactElement | null {
  const days = daysUntil(date);
  if (days === null || (hidePast && days < 0)) return null;
  let text: string;
  let tone = "text-ink-3";
  if (days < 0) {
    text = short ? `${Math.abs(days)}d late` : `${Math.abs(days)} day${days === -1 ? "" : "s"} late`;
    tone = "text-ink-4";
  } else if (days === 0) {
    text = "Today";
    tone = "text-stamp font-semibold";
  } else {
    text = short ? `${days}d left` : `${days} day${days === 1 ? "" : "s"} left`;
    if (days <= 14) tone = "text-stamp font-semibold";
    else if (days <= 30) tone = "text-ochre font-semibold";
  }
  return <span className={cn("text-[13px] whitespace-nowrap tnum", tone, className)}>{text}</span>;
}

/** Calendar chip: big day number, small month. */
export function LedgerDate({ date, className }: { date: string; className?: string }): React.ReactElement {
  const d = ledgerDate(date);
  return (
    <span
      className={cn(
        "inline-flex size-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-paper-sunken leading-none",
        className,
      )}
    >
      <span className="text-[17px] font-bold tnum">{d.day}</span>
      <span className="mt-0.5 text-[10.5px] font-semibold text-ink-3 capitalize">{d.month.toLowerCase()}</span>
    </span>
  );
}

/** A smooth bar for a 1–10 score. */
export function Meter({
  value,
  max = 10,
  className,
}: {
  value: number;
  max?: number;
  className?: string;
}): React.ReactElement {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  const tone = value / max >= 0.7 ? "bg-moss-solid" : value / max >= 0.4 ? "bg-ochre" : "bg-stamp";
  return (
    <span
      className={cn("inline-block h-2 w-20 overflow-hidden rounded-full bg-paper-sunken", className)}
      aria-label={`${value} out of ${max}`}
    >
      <span className={cn("block h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
    </span>
  );
}

export function ScoreLine({ label, value }: { label: string; value: number }): React.ReactElement {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-ink-2">{label}</span>
      <span className="flex items-center gap-3">
        <Meter value={value} className="w-24" />
        <span className="w-9 text-right text-[13px] font-semibold text-ink tnum">{value}/10</span>
      </span>
    </div>
  );
}

/** A large status pill for outcomes, with an optional date. */
export function Stamp({
  children,
  sub,
  tone = "moss",
  className,
}: {
  children: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "moss" | "stamp" | "ochre" | "sea" | "ink";
  className?: string;
}): React.ReactElement {
  const color = {
    moss: "bg-moss-soft text-moss",
    stamp: "bg-stamp-soft text-stamp",
    ochre: "bg-ochre-soft text-ochre",
    sea: "bg-brand-soft text-brand-ink",
    ink: "bg-paper-sunken text-ink-2",
  }[tone];
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-bold select-none", color, className)}>
      {children}
      {sub && <span className="font-medium opacity-75">· {sub}</span>}
    </span>
  );
}

/* ─── Empty, loading and error states ───────────────────────────────────── */

export function EmptyState({
  title,
  children,
  action,
  className,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <div className={cn("card-soft px-6 py-12 text-center", className)}>
      <span className="mx-auto mb-4 flex size-11 items-center justify-center rounded-2xl bg-paper-raised text-brand shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
        <StarGlyph className="size-4" />
      </span>
      <p className="text-lg font-bold tracking-[-0.01em] text-ink">{title}</p>
      {children && <div className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-3">{children}</div>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  children,
  action,
}: {
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <span className="mx-auto mb-4 flex size-11 items-center justify-center rounded-2xl bg-stamp-soft text-stamp">
        <TriangleAlert className="size-5" />
      </span>
      <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">{title}</h1>
      {children && <p className="mt-2 text-sm leading-relaxed text-ink-3">{children}</p>}
      {action && <div className="mt-6 flex justify-center gap-2">{action}</div>}
    </div>
  );
}

export function LoadingRows({ rows = 5, className }: { rows?: number; className?: string }): React.ReactElement {
  return (
    <div className={cn("card divide-y divide-rule-soft px-5", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4">
          <Skeleton className="size-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function LoadingPage(): React.ReactElement {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="mb-3 h-3.5 w-24" />
        <Skeleton className="h-9 w-2/3 max-w-md" />
        <Skeleton className="mt-4 h-4 w-1/2 max-w-sm" />
      </div>
      <LoadingRows rows={4} />
    </div>
  );
}

/* ─── Data reliability ──────────────────────────────────────────────────── */

const VERIFICATION = {
  manual: { label: "Checked by hand", tag: "Verified", pill: "bg-moss-soft text-moss", fg: "text-moss", box: "bg-moss-soft", icon: ShieldCheck },
  ai: { label: "Compiled with AI", tag: "AI-compiled", pill: "bg-ochre-soft text-ochre", fg: "text-ochre", box: "bg-ochre-soft", icon: TriangleAlert },
  none: { label: "Not verified", tag: "Unverified", pill: "bg-stamp-soft text-stamp", fg: "text-stamp", box: "bg-stamp-soft", icon: CircleHelp },
} as const;

export function VerificationTag({
  status,
  className,
}: {
  status?: "manual" | "ai" | "none";
  className?: string;
}): React.ReactElement {
  const v = VERIFICATION[status ?? "ai"];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold", v.pill, className)}>
      <v.icon className="size-3" />
      {v.tag}
    </span>
  );
}

/** A note about how far to trust the data on this page. */
export function VerificationNote({
  status,
  subject,
  className,
}: {
  status?: "manual" | "ai" | "none";
  subject: "program" | "visa";
  className?: string;
}): React.ReactElement {
  const s = status ?? "ai";
  const v = VERIFICATION[s];
  const text =
    s === "manual"
      ? subject === "program"
        ? "Someone added these details by hand and checked them."
        : "This visa information was checked by hand."
      : s === "ai"
        ? subject === "program"
          ? "These requirements were compiled with AI. Confirm tuition, deadlines and documents with the university before you rely on them."
          : "This visa information was compiled with AI. Always confirm fees and documents with the embassy."
        : subject === "program"
          ? "Nobody has verified these details yet. Treat them as a starting point."
          : "Nobody has verified this visa information yet. Check the embassy website for the current rules.";
  return (
    <div className={cn("flex gap-3 rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed", v.box, className)}>
      <v.icon className={cn("mt-0.5 size-4 shrink-0", v.fg)} />
      <p>
        <span className={cn("font-semibold", v.fg)}>{v.label}.</span> <span className="text-ink-2">{text}</span>
      </p>
    </div>
  );
}

/* ─── Misc ──────────────────────────────────────────────────────────────── */

/** Segmented pill control. */
export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}): React.ReactElement {
  return (
    <div className={cn("no-scrollbar max-w-full overflow-x-auto", className)}>
      <div role="tablist" className="inline-flex gap-1 rounded-full bg-paper-sunken p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
                active ? "bg-paper-raised text-ink shadow-[0_1px_3px_rgb(0_0_0/0.1)]" : "text-ink-3 hover:text-ink",
              )}
            >
              {o.label}
              {o.count !== undefined && <span className={cn("tnum", active ? "text-brand" : "text-ink-4")}>{o.count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Pros({ items, title = "Good" }: { items: string[]; title?: string }): React.ReactElement | null {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-ink">{title}</p>
      <ul className="space-y-2 text-sm leading-relaxed text-ink-2">
        {items.map((p, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-moss-soft text-moss">
              <Check className="size-3" strokeWidth={3} />
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Cons({ items, title = "Less good" }: { items: string[]; title?: string }): React.ReactElement | null {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-ink">{title}</p>
      <ul className="space-y-2 text-sm leading-relaxed text-ink-2">
        {items.map((c, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-stamp-soft text-stamp">
              <Minus className="size-3" strokeWidth={3} />
            </span>
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FormError({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <p role="alert" className="flex gap-2 rounded-xl bg-stamp-soft px-3.5 py-2.5 text-sm font-medium text-stamp">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** Field wrapper for forms: label, control, hint/error. */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline gap-1 text-[13px] font-semibold text-ink-2">
        {label}
        {required && <span className="text-stamp" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-stamp">{error}</p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

/** A form section: a card with a title and explanation, fields underneath. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="card mb-4 p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-[17px] leading-tight font-bold tracking-[-0.01em] text-ink">{title}</h2>
        {description && <p className="mt-1 text-[13.5px] leading-relaxed text-ink-3">{description}</p>}
      </div>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

/** Removable chip used for documents, tests and country picks. */
export function Token({
  children,
  onRemove,
  className,
}: {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-paper-sunken py-1 pr-1 pl-3 text-[13px] font-medium text-ink",
        !onRemove && "pr-3",
        className,
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex size-5 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-stamp-soft hover:text-stamp"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
