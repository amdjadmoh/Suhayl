import type { Application } from "@/types/application"
import type { DocumentRequest } from "@/types/document"
import type { Student, StudentTask } from "@/types/student"
import type { ApplicationStatus } from "@/lib/constants"
import { daysUntil } from "@/lib/format"
import { tn } from "@/lib/i18n"
import { belongsTo } from "@/lib/studentProfile"
import { appUniversity } from "@/lib/applications"

/*
 * Turns an agency's students, applications and document requests into one
 * summary per student: how far along they are and what needs doing now.
 */

/** Furthest point any of the student's applications has reached; "New" before the first one. */
export type Stage = "New" | ApplicationStatus

const STAGE_RANK: Record<Stage, number> = {
  New: 0,
  Rejected: 1,
  Preparing: 2,
  Applied: 3,
  Waitlisted: 4,
  Accepted: 5,
  Enrolled: 6,
}

export const STAGES: Stage[] = ["New", "Preparing", "Applied", "Waitlisted", "Accepted", "Enrolled", "Rejected"]

export interface StudentSummary {
  student: Student
  apps: Application[]
  stage: Stage
  countries: string[]
  /** Soonest deadline among applications still being prepared */
  nextDeadline: Application | null
  missed: Application[]
  dueThisWeek: Application[]
  docsToCheck: number
  docsOwed: number
  docsLate: number
  tasksDue: StudentTask[]
  openTasks: number
  paid: number
  balance: number | null
  /** Short reasons this student needs the agency's attention, most urgent first */
  attention: string[]
}

export function stageOf(apps: Application[]): Stage {
  if (apps.length === 0) return "New"
  return apps.reduce<Stage>((best, a) => (STAGE_RANK[a.applicationStatus] > STAGE_RANK[best] ? a.applicationStatus : best), "Rejected")
}


export function summarise(students: Student[], apps: Application[], docs: DocumentRequest[]): StudentSummary[] {
  const docsByStudent = new Map<string, DocumentRequest[]>()
  for (const d of docs) {
    const id = typeof d.studentId === "object" ? d.studentId._id : d.studentId
    docsByStudent.set(id, [...(docsByStudent.get(id) ?? []), d])
  }

  return students.map((student) => {
    const mine = apps.filter((a) => belongsTo(a, student))
    const preparing = mine.filter((a) => a.applicationStatus === "Preparing" && a.applicationDeadline)
    const missed = preparing.filter((a) => (daysUntil(a.applicationDeadline) ?? 0) < 0)
    const dueThisWeek = preparing.filter((a) => {
      const d = daysUntil(a.applicationDeadline)
      return d !== null && d >= 0 && d <= 7
    })
    const nextDeadline =
      preparing
        .filter((a) => (daysUntil(a.applicationDeadline) ?? -1) >= 0)
        .sort((a, b) => new Date(a.applicationDeadline!).getTime() - new Date(b.applicationDeadline!).getTime())[0] ?? null

    const myDocs = docsByStudent.get(student._id) ?? []
    const docsToCheck = myDocs.filter((d) => d.status === "uploaded").length
    const owed = myDocs.filter((d) => d.status === "requested" || d.status === "rejected")
    const docsLate = owed.filter((d) => d.dueDate && (daysUntil(d.dueDate) ?? 0) < 0).length

    const open = (student.tasks ?? []).filter((t) => !t.done)
    const tasksDue = open.filter((t) => t.dueDate && (daysUntil(t.dueDate) ?? 1) <= 0)

    const paid = (student.payments ?? []).reduce((sum, p) => sum + p.amount, 0)
    const balance = student.feeAgreed != null ? Math.max(0, student.feeAgreed - paid) : null

    const attention: string[] = []
    if (missed.length) attention.push(tn(missed.length, "{n} deadline missed", "{n} deadlines missed"))
    if (dueThisWeek.length) attention.push(tn(dueThisWeek.length, "{n} deadline this week", "{n} deadlines this week"))
    if (tasksDue.length) attention.push(tn(tasksDue.length, "{n} follow-up due", "{n} follow-ups due"))
    if (docsToCheck) attention.push(tn(docsToCheck, "{n} document to check", "{n} documents to check"))
    if (docsLate) attention.push(tn(docsLate, "{n} document overdue from the family", "{n} documents overdue from the family"))

    const countries = [...new Set(mine.map((a) => appUniversity(a)?.country).filter((c): c is string => !!c))]

    return {
      student,
      apps: mine,
      stage: stageOf(mine),
      countries,
      nextDeadline,
      missed,
      dueThisWeek,
      docsToCheck,
      docsOwed: owed.length,
      docsLate,
      tasksDue,
      openTasks: open.length,
      paid,
      balance,
      attention,
    }
  })
}
