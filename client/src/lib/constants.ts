export const CURRENCIES = [
  "EUR",
  "USD",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "KRW",
  "CNY",
  "TRY",
  "SAR",
  "MAD",
  "DZD",
] as const;

export const DEGREE_LEVELS = [
  "Bachelor",
  "Master",
  "PhD",
  "Diploma",
] as const;

export const APPLICATION_STATUSES = [
  "Wishlist",
  "Preparing",
  "Applied",
  "Accepted",
  "Rejected",
  "Enrolled",
] as const;

export const TUITION_PERIODS = ["Year", "Semester", "Total"] as const;

export const STATUS_COLORS: Record<string, string> = {
  Wishlist: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  Preparing: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Applied: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  Accepted: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Rejected: "bg-red-100 text-red-700 hover:bg-red-100",
  Enrolled: "bg-violet-100 text-violet-700 hover:bg-violet-100",
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
