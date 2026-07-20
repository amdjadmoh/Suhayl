export type ReviewTargetType = "university" | "program";

export interface Review {
  _id: string;
  targetType: ReviewTargetType;
  targetId: string;
  userId: { _id: string; name: string } | string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  count: number;
}

export interface UpsertReviewPayload {
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment: string;
}
