import type { Application } from "@/types/application";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/constants";

/* Helpers for the populated `programId` on an application */

type PopulatedProgram = Exclude<Application["programId"], string>;

export function appProgram(a: Application): PopulatedProgram | null {
  return typeof a.programId === "object" && a.programId ? a.programId : null;
}

export function appUniversity(a: Application): PopulatedProgram["universityId"] | null {
  const p = appProgram(a);
  return p?.universityId && typeof p.universityId === "object" ? p.universityId : null;
}

export function countByStatus(apps: Application[]): Record<ApplicationStatus, number> {
  const out = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<ApplicationStatus, number>;
  for (const a of apps) out[a.applicationStatus] += 1;
  return out;
}

/** Open applications with a deadline from yesterday up to `withinDays` ahead, soonest first. */
export function upcomingDeadlines(apps: Application[], withinDays = 90): Application[] {
  const now = Date.now();
  const limit = now + withinDays * 24 * 60 * 60 * 1000;
  return apps
    .filter((a) => {
      if (!a.applicationDeadline) return false;
      if (a.applicationStatus !== "Preparing" && a.applicationStatus !== "Applied") return false;
      const t = new Date(a.applicationDeadline).getTime();
      return t >= now - 24 * 60 * 60 * 1000 && t <= limit;
    })
    .sort(
      (a, b) =>
        new Date(a.applicationDeadline!).getTime() - new Date(b.applicationDeadline!).getTime(),
    );
}

/** Applications still being prepared whose deadline has already gone by, latest first. */
export function missedDeadlines(apps: Application[]): Application[] {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return apps
    .filter((a) => a.applicationStatus === "Preparing" && !!a.applicationDeadline && new Date(a.applicationDeadline).getTime() < cutoff)
    .sort((a, b) => new Date(b.applicationDeadline!).getTime() - new Date(a.applicationDeadline!).getTime());
}
