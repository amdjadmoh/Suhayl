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

export const createApplicationSchema = z
  .object({
    programId: z.string().min(1, "programId is required"),
    studentName: z.string().min(1, "studentName is required"),
    studentEmail: z.string().email("studentEmail must be valid"),
    studentId: z.string().optional(),
    notes: z.string().optional(),
  })
  .strict()

export const updateApplicationSchema = z
  .object({
    studentName: z.string().min(1).optional(),
    studentEmail: z.string().email().optional(),
    applicationStatus: applicationStatusEnum.optional(),
    applicationProgress: applicationProgressSchema.optional(),
    applicationDeadline: z.string().datetime().optional(),
    notes: z.string().optional(),
  })
  .strict()

export const listApplicationsQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
})
