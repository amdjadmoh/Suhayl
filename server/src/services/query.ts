/*
 * Helpers for turning query-string input into safe database queries: user text is
 * never used as a regular expression pattern, and every list has a ceiling.
 */

export const MAX_SEARCH_LENGTH = 100

/** Escapes every regex metacharacter, so the text matches literally. */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** A case-insensitive "contains" match for user text, or null when there is nothing to search for. */
export function containsText(value: unknown, max = MAX_SEARCH_LENGTH): RegExp | null {
  if (typeof value !== "string") return null
  const text = value.trim().slice(0, max)
  return text ? new RegExp(escapeRegex(text), "i") : null
}

/** Plain search text for $text queries: trimmed and capped. */
export function searchText(value: unknown, max = MAX_SEARCH_LENGTH): string | null {
  if (typeof value !== "string") return null
  const text = value.trim().slice(0, max)
  return text || null
}

/** limit/page from the query string, clamped to [1, max]. */
export function paging(query: Record<string, unknown>, defaults: { limit: number; max: number }): { limit: number; skip: number; page: number } {
  const limitIn = Number.parseInt(String(query["limit"] ?? ""), 10)
  const pageIn = Number.parseInt(String(query["page"] ?? ""), 10)
  const limit = Number.isFinite(limitIn) ? Math.min(Math.max(limitIn, 1), defaults.max) : defaults.limit
  const page = Number.isFinite(pageIn) && pageIn > 0 ? Math.min(pageIn, 10_000) : 1
  return { limit, skip: (page - 1) * limit, page }
}
