export const CURRENCIES = [
  "EUR",
] as const;

export const DEGREE_LEVELS = [
  "Bachelor",
  "Master",
  "PhD",
  "Diploma",
] as const;

export const APPLICATION_STATUSES = [
  "Preparing",
  "Applied",
  "Accepted",
  "Rejected",
  "Waitlisted",
  "Enrolled",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const TUITION_PERIODS = ["Year", "Semester", "Total"] as const;

/**
 * Colour + wording for each application status. `tone` maps to the
 * paper/ink palette in index.css; `note` is the plain-language meaning.
 */
export const STATUS_META: Record<
  ApplicationStatus,
  { tone: "ink" | "sea" | "moss" | "stamp" | "ochre"; dot: string; text: string; note: string }
> = {
  Preparing: { tone: "ink", dot: "bg-ink-3", text: "text-ink-2", note: "Still gathering documents" },
  Applied: { tone: "sea", dot: "bg-sea", text: "text-sea", note: "Submitted, waiting to hear back" },
  Waitlisted: { tone: "ochre", dot: "bg-ochre", text: "text-ochre", note: "On the waiting list" },
  Accepted: { tone: "moss", dot: "bg-moss", text: "text-moss", note: "Offer received" },
  Rejected: { tone: "stamp", dot: "bg-stamp", text: "text-stamp", note: "Not this time" },
  Enrolled: { tone: "moss", dot: "bg-moss", text: "text-moss", note: "Enrolled — done" },
};

/** ISO 3166-1 alpha-2 codes, shown as small oval plates instead of emoji flags. */
export const COUNTRY_CODES: Record<string, string> = {
  Germany: "DE",
  France: "FR",
  Italy: "IT",
  Spain: "ES",
  Netherlands: "NL",
  Belgium: "BE",
  Sweden: "SE",
  Norway: "NO",
  Denmark: "DK",
  Finland: "FI",
  Switzerland: "CH",
  Austria: "AT",
  "United Kingdom": "GB",
  Ireland: "IE",
  Portugal: "PT",
  Poland: "PL",
  "Czech Republic": "CZ",
  Hungary: "HU",
  Romania: "RO",
  Bulgaria: "BG",
  Greece: "GR",
  Turkey: "TR",
  Russia: "RU",
  Ukraine: "UA",
  Estonia: "EE",
  Croatia: "HR",
  Slovakia: "SK",
  Luxembourg: "LU",
  "United States": "US",
  Canada: "CA",
  Australia: "AU",
  "New Zealand": "NZ",
  Japan: "JP",
  "South Korea": "KR",
  China: "CN",
  Singapore: "SG",
  Malaysia: "MY",
  "United Arab Emirates": "AE",
  "Saudi Arabia": "SA",
  Morocco: "MA",
  Algeria: "DZ",
  Tunisia: "TN",
  Egypt: "EG",
  "South Africa": "ZA",
  Brazil: "BR",
  Argentina: "AR",
  Mexico: "MX",
};

export function countryCode(name?: string): string {
  if (!name) return "··";
  return COUNTRY_CODES[name] ?? name.slice(0, 2).toUpperCase();
}

export const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "tuition", label: "Tuition" },
  { value: "deadline", label: "Deadline" },
  { value: "ranking", label: "Ranking" },
] as const;

export const FIELD_CATEGORIES = [
  "Computer Science",
  "Engineering",
  "Business & Management",
  "Medicine & Health",
  "Law",
  "Natural Sciences",
  "Mathematics",
  "Economics",
  "Arts & Humanities",
  "Architecture",
  "Social Sciences",
  "Environmental Science",
] as const;
