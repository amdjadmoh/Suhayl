import type { Student } from "@/types/student";

/** The academic profile an agency keeps on a student, as form strings. */
export interface StudentProfileForm {
  gpa: string;
  ieltsScore: string;
  monthlyBudget: string;
  degreeLevel: string;
  targetIntake: string;
  preferredCountries: string[];
}

export const EMPTY_PROFILE: StudentProfileForm = {
  gpa: "",
  ieltsScore: "",
  monthlyBudget: "",
  degreeLevel: "",
  targetIntake: "",
  preferredCountries: [],
};

export function profileToForm(s: Student): StudentProfileForm {
  return {
    gpa: s.gpa?.toString() ?? "",
    ieltsScore: s.ieltsScore?.toString() ?? "",
    monthlyBudget: s.monthlyBudget?.toString() ?? "",
    degreeLevel: s.degreeLevel ?? "",
    targetIntake: s.targetIntake ?? "",
    preferredCountries: s.preferredCountries ?? [],
  };
}

/** Empty fields are sent as null / "" so clearing one actually clears it. */
export function profileToPayload(f: StudentProfileForm): Partial<Student> {
  const num = (v: string): number | null => (v.trim() === "" ? null : Number(v));
  return {
    gpa: num(f.gpa),
    ieltsScore: num(f.ieltsScore),
    monthlyBudget: num(f.monthlyBudget),
    degreeLevel: f.degreeLevel,
    targetIntake: f.targetIntake.trim(),
    preferredCountries: f.preferredCountries,
  };
}

/** Link to Matches, filled in with this student's numbers. */
export function matchesHref(s: Student): string {
  const q = new URLSearchParams({ for: s.name });
  if (s.monthlyBudget != null) q.set("budget", String(s.monthlyBudget));
  if (s.gpa != null) q.set("gpa", String(s.gpa));
  if (s.ieltsScore != null) q.set("ielts", String(s.ieltsScore));
  if (s.preferredCountries?.length) q.set("countries", s.preferredCountries.join(","));
  return `/matches?${q.toString()}`;
}

export function hasProfile(s: Student): boolean {
  return s.gpa != null || s.ieltsScore != null || s.monthlyBudget != null || !!s.preferredCountries?.length;
}

/** Whether an agency application belongs to this student file. */
export function belongsTo(a: { studentId?: string; studentEmail: string }, s: Student): boolean {
  return a.studentId ? a.studentId === s._id : a.studentEmail.toLowerCase() === s.email.toLowerCase();
}
