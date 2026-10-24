import { FR } from "@/lib/i18n-fr"

/*
 * Interface language. English text is the key and French comes from i18n-fr.ts;
 * anything not translated yet shows in English. The language is picked once per
 * page load (saved choice, else the browser's language), so `t()` is a plain
 * function and switching language reloads the page.
 */

export type Lang = "en" | "fr"

const KEY = "suhayl-lang"

function detect(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === "fr" || saved === "en") return saved
  } catch {
    // storage blocked: fall through to the browser's language
  }
  if (typeof navigator !== "undefined" && /^fr\b/i.test(navigator.language ?? "")) return "fr"
  return "en"
}

export const lang: Lang = detect()

if (typeof document !== "undefined") document.documentElement.lang = lang

export function setLang(next: Lang): void {
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // can't remember it, but still switch for this load
  }
  window.location.reload()
}

/** Translate an English string, filling {placeholders} from `vars`. */
export function t(en: string, vars?: Record<string, string | number>): string {
  const text = lang === "fr" ? (FR[en] ?? en) : en
  return vars ? text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : text
}

/**
 * A counted sentence, e.g. tn(n, "{n} deadline missed", "{n} deadlines missed").
 * Whole sentences rather than glued words, because French agrees adjectives too.
 */
export function tn(n: number, one: string, many: string, vars?: Record<string, string | number>): string {
  const singular = lang === "fr" ? n <= 1 : n === 1
  return t(singular ? one : many, { n, ...vars })
}
