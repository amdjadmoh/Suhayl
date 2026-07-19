import type { Request, Response } from "express"
import "../middleware/auth"
import { Recommendation } from "../models/Recommendation"
import { Application } from "../models/Application"
import { sendEmail, isEmailEnabled } from "../services/email"
import { renderRecommenderInvite } from "../templates/email/renderRecommenderInvite"

// ── Helpers ──────────────────────────────────────────────────────────────────

function getClientUrl(): string {
  return process.env["CLIENT_URL"] ?? "http://localhost:5173"
}

/**
 * Verify that the authenticated user has access to the given application.
 * Returns the application or null.
 */
async function verifyApplicationAccess(
  applicationId: string,
  user: { _id: string; role: string } | undefined,
): Promise<boolean> {
  if (!user) return false
  if (user.role === "admin") return true

  const application = await Application.findById(applicationId).select(
    "createdBy agencyId",
  )
  if (!application) return false

  if (user.role === "student") {
    return application.createdBy?.toString() === user._id
  }

  if (user.role === "agency") {
    return application.agencyId?.toString() === user._id
  }

  return false
}

// ── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST / — invite a recommender (authenticated)
 * Body: { applicationId, recommenderName, recommenderEmail }
 */
export async function invite(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as {
      applicationId: string
      recommenderName: string
      recommenderEmail: string
    }
    const { applicationId, recommenderName, recommenderEmail } = body

    // Verify the application exists and user has access
    const application = await Application.findById(applicationId).populate({
      path: "programId",
      select: "name",
    })
    if (!application) {
      res.status(404).json({ message: "Application not found" })
      return
    }

    const hasAccess = await verifyApplicationAccess(
      applicationId,
      req.user,
    )
    if (!hasAccess) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    // Extract program name
    const program =
      typeof application.programId === "object"
        ? (application.programId as unknown as { name: string })
        : null
    const programName = program?.name ?? "Unknown Program"

    // Create the recommendation record
    const recommendation = await Recommendation.create({
      applicationId,
      studentName: application.studentName,
      studentEmail: application.studentEmail,
      programName,
      recommenderName,
      recommenderEmail,
    })

    // Send email to the recommender
    if (isEmailEnabled()) {
      const submitUrl = `${getClientUrl()}/recommendation/${recommendation.token}`
      const { html } = await renderRecommenderInvite({
        studentName: application.studentName,
        programName,
        recommenderName,
        submitUrl,
      })

      await sendEmail({
        to: recommenderEmail,
        subject: `${application.studentName} has requested a letter of recommendation`,
        html,
      })
    }

    res.status(201).json(recommendation)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    res.status(500).json({ message: `Failed to invite recommender: ${message}` })
  }
}

/**
 * GET /application/:applicationId — list recommendations for an application (authenticated)
 */
export async function listByApplication(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const applicationId = String(req.params["applicationId"])
    const hasAccess = await verifyApplicationAccess(applicationId, req.user)
    if (!hasAccess) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const recommendations = await Recommendation.find({
      applicationId,
    }).sort({ createdAt: -1 })

    res.json({ recommendations })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    res
      .status(500)
      .json({ message: `Failed to list recommendations: ${message}` })
  }
}

/**
 * GET /public/:token — get recommendation request details by token (PUBLIC)
 */
export async function getByToken(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const token = req.params["token"] as string
    const recommendation = await Recommendation.findOne({ token }).select(
      "recommenderName studentName programName status letterText submittedAt",
    )

    if (!recommendation) {
      res.status(404).json({ message: "Recommendation not found" })
      return
    }

    // Return everything except the token itself for security
    res.json({
      recommenderName: recommendation.recommenderName,
      studentName: recommendation.studentName,
      programName: recommendation.programName,
      status: recommendation.status,
      letterText: recommendation.letterText,
      submittedAt: recommendation.submittedAt,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    res
      .status(500)
      .json({ message: `Failed to get recommendation: ${message}` })
  }
}

/**
 * POST /public/submit — submit a recommendation (PUBLIC)
 * Body: { token, letterText }
 */
export async function submit(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as { token: string; letterText: string }
    const { token, letterText } = body

    const recommendation = await Recommendation.findOne({ token })
    if (!recommendation) {
      res.status(404).json({ message: "Recommendation not found" })
      return
    }

    if (recommendation.status !== "invited") {
      res.status(400).json({
        message: `This recommendation has already been ${recommendation.status}`,
      })
      return
    }

    recommendation.letterText = letterText
    recommendation.status = "submitted"
    recommendation.submittedAt = new Date()
    await recommendation.save()

    res.json({ message: "Recommendation submitted successfully" })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    res
      .status(500)
      .json({ message: `Failed to submit recommendation: ${message}` })
  }
}

/**
 * DELETE /:id — remove a recommendation (authenticated)
 */
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params["id"] as string
    const recommendation = await Recommendation.findById(id)
    if (!recommendation) {
      res.status(404).json({ message: "Recommendation not found" })
      return
    }

    const hasAccess = await verifyApplicationAccess(
      recommendation.applicationId.toString(),
      req.user,
    )
    if (!hasAccess) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    await Recommendation.findByIdAndDelete(id)
    res.json({ message: "Recommendation removed" })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    res
      .status(500)
      .json({ message: `Failed to remove recommendation: ${message}` })
  }
}
