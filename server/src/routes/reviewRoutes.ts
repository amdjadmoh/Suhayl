import { Router } from "express"
import { authenticate, optionalAuth } from "../middleware/auth"
import { validate } from "../middleware/validate"
import {
  upsertReviewSchema,
  listReviewsQuerySchema,
} from "../validators/reviewValidator"
import {
  listReviews,
  upsertReview,
  deleteReview,
} from "../controllers/reviewController"

export const reviewRouter = Router()

reviewRouter.get(
  "/",
  optionalAuth,
  validate(listReviewsQuerySchema, "query"),
  listReviews
)
reviewRouter.post("/", authenticate, validate(upsertReviewSchema, "body"), upsertReview)
reviewRouter.delete("/:id", authenticate, deleteReview)
