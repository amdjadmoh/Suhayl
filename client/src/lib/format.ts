import { lang, t } from "@/lib/i18n";

// Dates and numbers follow the interface language
const LOCALE = lang === "fr" ? "fr-FR" : "en-GB";

const DAY = 1000 * 60 * 60 * 24;

/** Whole days from now until the date; negative when it has passed. */
export function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / DAY);
}

export function formatMoney(amount: number, currency = "EUR"): string {
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(LOCALE)} ${currency}`;
  }
}

/** "€1,500 / year" */
export function formatTuition(amount: number, currency: string, period?: string): string {
  const base = formatMoney(amount, currency);
  return period ? `${base} / ${t(period.toLowerCase())}` : base;
}

/** "12 Nov 2026" */
export function formatDate(dateStr?: string | null, fallback = "—"): string {
  if (!dateStr) return fallback;
  return new Date(dateStr).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "12 Nov", with the year only when it isn't this year */
export function shortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(LOCALE, { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
}

/** "12 November 2026" */
export function formatDateLong(dateStr?: string | null, fallback = "—"): string {
  if (!dateStr) return fallback;
  return new Date(dateStr).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Two-line ledger date: { day: "12", month: "NOV" } */
export function ledgerDate(dateStr: string): { day: string; month: string; year: string } {
  const d = new Date(dateStr);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleDateString(LOCALE, { month: "short" }).toUpperCase(),
    year: String(d.getFullYear()),
  };
}

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return t("just now");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("{n} min ago", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("{n} h ago", { n: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t("{n} d ago", { n: days });
  return formatDate(dateStr);
}

export function todayLong(): string {
  return new Date().toLocaleDateString(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return t("Up late");
  if (h < 12) return t("Good morning");
  if (h < 18) return t("Good afternoon");
  return t("Good evening");
}

export function plural(n: number, one: string, many = `${one}s`): string {
  // French treats 0 and 1 as singular
  const singular = lang === "fr" ? n <= 1 : n === 1;
  return `${n} ${t(singular ? one : many)}`;
}

/** "Germany, France and Italy" */
export function listJoin(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} ${t("and")} ${items[items.length - 1]}`;
}

export function initials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1]![0] : "")).toUpperCase();
}
