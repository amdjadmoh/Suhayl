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

export const TUITION_PERIODS = ["Year", "Semester", "Total"] as const;

export const STATUS_COLORS: Record<string, string> = {
  Preparing:
    "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/15",
  Applied:
    "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/15",
  Accepted:
    "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/15",
  Rejected:
    "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/15",
  Waitlisted:
    "bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-500/15 dark:text-orange-400 dark:hover:bg-orange-500/15",
  Enrolled:
    "bg-violet-100 text-violet-700 hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400 dark:hover:bg-violet-500/15",
};

export const COUNTRY_FLAGS: Record<string, string> = {
  Germany: "🇩🇪",
  France: "🇫🇷",
  Italy: "🇮🇹",
  Spain: "🇪🇸",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  Sweden: "🇸🇪",
  Norway: "🇳🇴",
  Denmark: "🇩🇰",
  Finland: "🇫🇮",
  Switzerland: "🇨🇭",
  Austria: "🇦🇹",
  "United Kingdom": "🇬🇧",
  Ireland: "🇮🇪",
  Portugal: "🇵🇹",
  Poland: "🇵🇱",
  "Czech Republic": "🇨🇿",
  Hungary: "🇭🇺",
  Romania: "🇷🇴",
  Bulgaria: "🇧🇬",
  Greece: "🇬🇷",
  Turkey: "🇹🇷",
  Russia: "🇷🇺",
  Ukraine: "🇺🇦",
  "United States": "🇺🇸",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  "New Zealand": "🇳🇿",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  China: "🇨🇳",
  Singapore: "🇸🇬",
  Malaysia: "🇲🇾",
  "United Arab Emirates": "🇦🇪",
  "Saudi Arabia": "🇸🇦",
  Morocco: "🇲🇦",
  Algeria: "🇩🇿",
  Egypt: "🇪🇬",
  "South Africa": "🇿🇦",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  Mexico: "🇲🇽",
};

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
