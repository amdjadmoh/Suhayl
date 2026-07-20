import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, MessageSquare, Loader2, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn, getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/lib/authContext";
import { useReviews, useUpsertReview, useDeleteReview } from "@/lib/api";
import type { ReviewTargetType } from "@/types/review";

function Stars({
  value,
  onChange,
  size = "h-4 w-4",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: string;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={cn(
            "transition-transform",
            onChange && "hover:scale-125 cursor-pointer",
            !onChange && "cursor-default"
          )}
          aria-label={`${n} star${n !== 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              size,
              n <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function formatReviewDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
    ? reviews.find((r) =>
        typeof r.userId === "object" ? r.userId._id === user._id : r.userId === user._id
      )
    : undefined;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);

  // Pre-fill the form when the user's own review exists and they choose to edit
  useEffect(() => {
    if (myReview && !editing) {
      setRating(myReview.rating);
      setComment(myReview.comment);
    }
  }, [myReview, editing]);

  const showForm = !!user && (!myReview || editing);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    try {
      await upsertMutation.mutateAsync({ targetType, targetId, rating, comment: comment.trim() });
      toast.success(myReview ? "Review updated" : "Review posted");
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
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            Student Reviews
          </h3>
          {count > 0 && (
            <div className="flex items-center gap-2">
              <Stars value={Math.round(averageRating)} />
              <span className="text-sm font-semibold text-foreground">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({count} review{count !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Own review / form */}
        {!user ? (
          <div className="rounded-xl border border-dashed border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>{" "}
              to write a review
            </p>
          </div>
        ) : myReview && !editing ? (
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Stars value={myReview.rating} />
                  <span className="text-xs font-medium text-muted-foreground">Your review</span>
                </div>
                <p className="mt-2 text-sm text-foreground/90 leading-relaxed">{myReview.comment}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditing(true)}
                  title="Edit your review"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-500"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  title="Delete your review"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">
              {myReview ? "Edit your review" : "Write a review"}
            </p>
            <Stars value={rating} onChange={setRating} size="h-6 w-6" />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this program / university..."
              rows={3}
              maxLength={2000}
              className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y transition-colors"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{comment.length}/2000</span>
              <div className="flex gap-2">
                {editing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => {
                      setEditing(false);
                      setRating(myReview?.rating ?? 0);
                      setComment(myReview?.comment ?? "");
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl"
                  disabled={upsertMutation.isPending || rating === 0 || comment.trim().length < 3}
                >
                  {upsertMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : myReview ? (
                    "Update review"
                  ) : (
                    "Post review"
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Reviews list */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No reviews yet — be the first to share your experience.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews
              .filter((r) => !myReview || r._id !== myReview._id)
              .map((r) => {
                const author = typeof r.userId === "object" ? r.userId.name : "Student";
                return (
                  <div key={r._id} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-cyan-500/15 text-sm font-bold text-primary">
                      {author.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{author}</span>
                        <Stars value={r.rating} size="h-3.5 w-3.5" />
                        <span className="text-xs text-muted-foreground">
                          {formatReviewDate(r.createdAt)}
                        </span>
                        {user?.role === "admin" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto h-7 w-7 text-muted-foreground hover:text-red-500"
                            onClick={() => handleAdminDelete(r._id)}
                            disabled={deleteMutation.isPending}
                            title="Delete review (admin)"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-foreground/80 leading-relaxed">{r.comment}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
