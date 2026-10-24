import type { Request, Response } from "express"
import { Types } from "mongoose"
import { Review, type ReviewTargetType } from "../models/Review"
import { University } from "../models/University"
import { Program } from "../models/Program"
import { findVisibleProgram, findVisibleUniversity } from "../services/visibility"

/** Whether the target exists and this caller may see it (private records are only their owner's). */
async function targetExists(
  targetType: ReviewTargetType,
  targetId: string,
  viewer?: Request["user"]
): Promise<boolean> {
  if (targetType === "university") return (await findVisibleUniversity(viewer, targetId)) != null
  return (await findVisibleProgram(viewer, targetId)) != null
}

/**
 * GET /api/reviews?targetType=&targetId=
 * Public list with average rating. Authenticated users also get their own
 * review flagged client-side via the populated userId.
 */
export async function listReviews(req: Request, res: Response): Promise<void> {
  const { targetType, targetId } = req.query as unknown as {
    targetType: ReviewTargetType
    targetId: string
  }
  if (!(await targetExists(targetType, targetId, req.user))) {
    res.status(404).json({ message: "Not found" })
    return
  }

  const [reviews, agg] = await Promise.all([
    Review.find({ targetType, targetId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(200),
    Review.aggregate([
      { $match: { targetType, targetId: new Types.ObjectId(targetId) } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
  ])

  const averageRating = agg.length > 0 ? Math.round(agg[0].avg * 10) / 10 : 0
  const count = agg.length > 0 ? agg[0].count : 0

  res.json({ reviews, averageRating, count })
}

/**
 * POST /api/reviews
 * Creates or updates the caller's review for a target (one per user).
 */
export async function upsertReview(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" })
    return
  }

  const { targetType, targetId, rating, comment } = req.body as {
    targetType: ReviewTargetType
    targetId: string
    rating: number
    comment: string
  }

  if (!(await targetExists(targetType, targetId, req.user))) {
    res.status(404).json({ message: "Review target not found" })
    return
  }

  const review = await Review.findOneAndUpdate(
    { targetType, targetId, userId: req.user._id },
    { rating, comment },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).populate("userId", "name")

  res.status(200).json(review)
}

/**
 * DELETE /api/reviews/:id
 * Only the review's author or an admin can delete.
 */
export async function deleteReview(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" })
    return
  }

  const review = await Review.findById(req.params["id"])
  if (!review) {
    res.status(404).json({ message: "Review not found" })
    return
  }

  const isOwner = review.userId.toString() === req.user._id
  if (!isOwner && req.user.role !== "admin") {
    res.status(403).json({ message: "Forbidden" })
    return
  }

  await Review.findByIdAndDelete(req.params["id"])
  res.json({ message: "Review deleted" })
}
