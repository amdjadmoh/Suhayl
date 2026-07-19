import { useParams } from "react-router-dom"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  GraduationCap,
} from "lucide-react"
import {
  useRecommendationByToken,
  useSubmitRecommendation,
} from "@/lib/api-recommender"
import { getErrorMessage } from "@/lib/utils"

export default function RecommenderSubmit(): React.ReactElement {
  const { token } = useParams<{ token: string }>()
  const [letterText, setLetterText] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const { data, isLoading, isError } = useRecommendationByToken(token ?? "")
  const submitMutation = useSubmitRecommendation()

  const wordCount = useMemo(() => {
    const trimmed = letterText.trim()
    return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length
  }, [letterText])

  async function handleSubmit(): Promise<void> {
    if (!token) return
    try {
      await submitMutation.mutateAsync({ token, letterText })
      toast.success("Recommendation submitted successfully!")
      setSubmitted(true)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to submit recommendation"))
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/60 to-muted p-4">
        <div className="w-full max-w-lg space-y-6">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  // Error state - recommendation not found
  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/60 to-muted p-4">
        <div className="w-full max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <h1 className="text-2xl font-bold text-foreground">
            Recommendation not found
          </h1>
          <p className="mt-2 text-muted-foreground">
            This link may be invalid or expired. Please contact the student who
            requested the recommendation.
          </p>
        </div>
      </div>
    )
  }

  // Already submitted
  if (data.status === "submitted" && !submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/60 to-muted p-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-400" />
          <h1 className="text-2xl font-bold text-foreground">
            Letter already submitted
          </h1>
          <p className="mt-2 text-muted-foreground">
            This letter of recommendation has already been submitted. Thank you
            for your contribution!
          </p>
        </div>
      </div>
    )
  }

  // Success state after submission
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/60 to-muted p-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-400" />
          <h1 className="text-2xl font-bold text-foreground">
            Thank you!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your letter of recommendation for {data.studentName} has been
            submitted successfully. The student will be notified.
          </p>
        </div>
      </div>
    )
  }

  // Declined
  if (data.status === "declined") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/60 to-muted p-4">
        <div className="w-full max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-amber-400" />
          <h1 className="text-2xl font-bold text-foreground">
            Invitation declined
          </h1>
          <p className="mt-2 text-muted-foreground">
            This recommendation invitation was declined.
          </p>
        </div>
      </div>
    )
  }

  // Main form — invited state
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/60 to-muted p-4">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Letter of Recommendation
            </h1>
          </div>

          {/* Request Details */}
          <div className="mb-6 rounded-xl border border-border bg-muted p-4">
            <p className="text-sm text-foreground/70 leading-relaxed">
              Dear <strong>{data.recommenderName}</strong>,
            </p>
            <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
              <strong>{data.studentName}</strong> has requested a letter of
              recommendation for <strong>{data.programName}</strong>. Please
              write your letter below.
            </p>
          </div>

          {/* Letter Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Your Letter
            </label>
            <Textarea
              placeholder="Write your letter of recommendation here... (minimum 50 characters)"
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              className="min-h-48 rounded-xl border-border resize-y"
            />
            <p className="text-right text-xs text-muted-foreground">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={
              submitMutation.isPending || letterText.trim().length < 50
            }
            className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" /> Submit Letter
              </>
            )}
          </Button>
          {letterText.trim().length > 0 && letterText.trim().length < 50 && (
            <p className="mt-2 text-center text-xs text-amber-600 dark:text-amber-400">
              Letter must be at least 50 characters
              ({letterText.trim().length}/50)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
