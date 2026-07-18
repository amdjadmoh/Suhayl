import { z } from "zod"

const applicationStatusEnum = z.enum([
  "Preparing",
  "Applied",
  "Accepted",
  "Rejected",
  "Waitlisted",
  "Enrolled",
])

const sopStatusEnum = z.enum(["not_started", "draft", "final"])

const applicationProgressSchema = z
  .object({
    documentsObtained: z.array(z.string()).optional(),
    testScores: z
      .array(
        z.object({
          name: z.string(),
          taken: z.boolean().optional(),
          score: z.number().optional(),
        })
      )
      .optional(),
    recommendationsRequested: z.number().optional(),
    recommendationsReceived: z.number().optional(),
    sopStatus: sopStatusEnum.optional(),
    applicationFeePaid: z.boolean().optional(),
    applicationSubmittedDate: z.string().datetime().optional(),
    visaApplied: z.boolean().optional(),
    visaApproved: z.boolean().optional(),
    interviewScheduled: z.string().datetime().optional(),
    interviewCompleted: z.boolean().optional(),
    visaDocumentsObtained: z.array(z.string()).optional(),
    visaDocumentsPending: z.array(z.string()).optional(),
  })
  .strict()

// Accept both ISO datetime ("2026-12-15T00:00:00Z") and date-only ("2026-12-15")
// because the client's <Input type="date"> produces date-only strings.
const deadlineSchema = z.union([z.string().datetime(), z.string().date()])

export const createApplicationSchema = z
  .object({
    programId: z.string().min(1, "programId is required"),
    studentName: z.string().min(1, "studentName is required"),
    studentEmail: z.string().email("studentEmail must be valid"),
    studentId: z.string().optional(),
    notes: z.string().optional(),
    // Client may send these on create; the controller ignores them and
    // auto-populates from the program / model defaults. Accepted here so
    // the strict schema doesn't reject the client's payload.
    applicationStatus: applicationStatusEnum.optional(),
    applicationDeadline: deadlineSchema.optional(),
    applicationProgress: applicationProgressSchema.optional(),
  })
  .strict()

export const updateApplicationSchema = z
  .object({
    studentName: z.string().min(1).optional(),
    studentEmail: z.string().email().optional(),
    applicationStatus: applicationStatusEnum.optional(),
    applicationProgress: applicationProgressSchema.optional(),
    applicationDeadline: deadlineSchema.optional(),
    notes: z.string().optional(),
  })
  .strict()

export const listApplicationsQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
})
