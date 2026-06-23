export interface University {
  _id: string;
  name: string;
  country: string;
  city: string;
  ranking?: number;
  program: string;
  degreeLevel: "Bachelor" | "Master" | "PhD" | "Diploma";
  languageOfInstruction: string;
  tuitionFee: number;
  tuitionCurrency: string;
  tuitionPeriod: "Year" | "Semester" | "Total";
  livingCostEstimate?: number;
  applicationDeadline?: string;
  applicationStatus:
    | "Wishlist"
    | "Preparing"
    | "Applied"
    | "Accepted"
    | "Rejected"
    | "Enrolled";
  visaRequirements?: string;
  requiredDocuments: string[];
  gpaRequirement?: number;
  ieltsRequirement?: number;
  toeflRequirement?: number;
  scholarshipAvailable: boolean;
  scholarshipDetails?: string;
  websiteUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UniversityStats {
  totalUniversities: number;
  countriesCount: number;
  byCountry: { country: string; count: number }[];
  byStatus: { status: string; count: number }[];
  avgTuition: number;
  upcomingDeadlines: University[];
  recentlyAdded: University[];
  scholarshipCount: number;
}

export type UniversityFormData = Omit<
  University,
  "_id" | "createdAt" | "updatedAt"
>;
