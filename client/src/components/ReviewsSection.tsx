import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, getErrorMessage } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/lib/authContext";
import { useReviews, useUpsertReview, useDeleteReview } from "@/lib/api";
import type { ReviewTargetType } from "@/types/review";
import { Section } from "@/components/kit";

const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** Five stars, filled up to the rating. Clickable when editable. */
function Rating({
  value,
  onChange,
  size = "sm",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "lg";
}): React.ReactElement {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <span className="inline-flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          aria-label={`${n} out of 5`}
          className={cn("transition-transform", onChange ? "cursor-pointer hover:scale-110" : "cursor-default")}
        >
          <Star
            className={cn(
              size === "lg" ? "size-6" : "size-3.5",
              n <= shown ? "fill-ochre text-ochre" : "fill-paper-sunken text-rule",
            )}
          />
        </button>
      ))}
    </span>
  );
}

export default function ReviewsSection({
  targetType,
  targetId,
}: {
  targetType: ReviewTargetType;
  targetId: string;
}): React.ReactElement {
  const { user } = useAuth();
  const { data, isLoading } = useReviews(targetType, targetId);
  const upsertMutation = useUpsertReview();
  const deleteMutation = useDeleteReview();

  const reviews = data?.reviews ?? [];
  const averageRating = data?.averageRating ?? 0;
  const count = data?.count ?? 0;

  const myReview = user
    ? reviews.find((r) => (r.userId && typeof r.userId === "object" ? r.userId._id === user._id : r.userId === user._id))
    : undefined;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);

  const showForm = !!user && (!myReview || editing);
  const others = reviews.filter((r) => !myReview || r._id !== myReview._id);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Choose a rating first");
      return;
    }
    try {
      await upsertMutation.mutateAsync({ targetType, targetId, rating, comment: comment.trim() });
      toast.success(myReview ? "Review updated" : "Thanks for writing it up");
      setEditing(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save review"));
    }
  }

  async function handleDelete(): Promise<void> {
    if (!myReview) return;
    try {
      await deleteMutation.mutateAsync({ id: myReview._id, targetType, targetId });
      toast.success("Review deleted");
      setRating(0);
      setComment("");
      setEditing(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete review"));
    }
  }

  async function handleAdminDelete(reviewId: string): Promise<void> {
    try {
      await deleteMutation.mutateAsync({ id: reviewId, targetType, targetId });
      toast.success("Review deleted");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete review"));
    }
  }

  return (
    <Section
      title="From students"
      count={count || undefined}
      action={
        count > 0 && (
          <span className="flex items-center gap-2">
            <Rating value={Math.round(averageRating)} />
            <span className="text-xs text-ink-2 tnum">{averageRating.toFixed(1)} / 5</span>
          </span>
        )
      }
    >
      <div className="space-y-6 pt-2">
        {!user ? (
          <p className="text-sm text-ink-3">
            <Link to="/login" className="link-ink">
              Sign in
            </Link>{" "}
            to write a review.
          </p>
        ) : myReview && !editing ? (
          <div className="card-soft px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="kicker">Your review</span>
              <Rating value={myReview.rating} />
              <span className="ml-auto flex gap-1">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    // Start the form from what they wrote before
                    setRating(myReview.rating);
                    setComment(myReview.comment);
                    setEditing(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-stamp hover:bg-stamp-soft hover:text-stamp"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && <Loader2 className="animate-spin" />}
                  Delete
                </Button>
              </span>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{myReview.comment}</p>
          </div>
        ) : null}

        {showForm && (
          <form onSubmit={handleSubmit} className="card p-5">
            <p className="text-base leading-tight font-semibold">{myReview ? "Edit your review" : "Been there? Tell the next person."}</p>
            <div className="mt-3 flex items-center gap-3">
              <Rating value={rating} onChange={setRating} size="lg" />
              <span className="text-xs text-ink-3 tnum">
                {rating ? RATING_WORDS[rating] : "Your rating"}
              </span>
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What was it actually like? Teaching, admin, the city, what you wish you'd known…"
              rows={3}
              maxLength={2000}
              className="mt-3 bg-paper"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-ink-4 tnum">{comment.length}/2000</span>
              <div className="flex gap-2">
                {editing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(false);
                      setRating(myReview?.rating ?? 0);
                      setComment(myReview?.comment ?? "");
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" size="sm" disabled={upsertMutation.isPending || rating === 0 || comment.trim().length < 3}>
                  {upsertMutation.isPending && <Loader2 className="animate-spin" />}
                  {myReview ? "Update" : "Post review"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {isLoading ? (
          <p className="text-sm text-ink-3">Loading reviews…</p>
        ) : others.length === 0 ? (
          !myReview && <p className="text-sm text-ink-3">No reviews yet.</p>
        ) : (
          <ul className="divide-y divide-rule">
            {others.map((r) => {
              const author = r.userId && typeof r.userId === "object" ? r.userId.name : "A former student";
              return (
                <li key={r._id} className="py-4 first:pt-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-sm font-medium text-ink">{author}</span>
                    <Rating value={r.rating} />
                    <span className="text-xs text-ink-4 tnum">{formatDate(r.createdAt)}</span>
                    {user?.role === "admin" && (
                      <Button
                        variant="ghost"
                        size="xs"
                        className="ml-auto text-stamp hover:bg-stamp-soft hover:text-stamp"
                        onClick={() => handleAdminDelete(r._id)}
                        disabled={deleteMutation.isPending}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="mt-1.5 max-w-prose text-[15px] leading-relaxed text-ink-2">{r.comment}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Section>
  );
}
