import { z } from "zod"

// ── Schemas ──────────────────────────────────────────────────────────────────

export const inviteSchema = z
  .object({
    applicationId: z.string().min(1, "applicationId is required"),
    recommenderName: z.string().min(1, "recommenderName is required"),
    recommenderEmail: z
      .string()
      .email("recommenderEmail must be a valid email address"),
  })
  .strict()

export const submitSchema = z
  .object({
    token: z.string().min(1, "token is required"),
    letterText: z
      .string()
      .min(50, "Letter must be at least 50 characters"),
  })
  .strict()
