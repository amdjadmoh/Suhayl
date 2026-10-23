import { useParams } from "react-router-dom"
import { useState, useMemo } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useRecommendationByToken,
  useSubmitRecommendation,
} from "@/lib/api-recommender"
import { getErrorMessage } from "@/lib/utils"
import { todayLong } from "@/lib/format"
import { Wordmark } from "@/components/kit"

function Shell({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="min-h-screen bg-paper px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-[42rem]">
        <div className="mb-10 flex items-center justify-between">
          <Wordmark className="text-[15px]" />
          <span className="text-xs text-ink-3 tnum">{todayLong()}</span>
        </div>
        {children}
      </div>
    </div>
  )
}

function Message({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <Shell>
      <div className="py-10 text-center">
        <p className="kicker mb-3">{kicker}</p>
        <h1 className="text-3xl leading-tight font-bold tracking-[-0.02em]">{title}</h1>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-2">{children}</p>
      </div>
    </Shell>
  )
}

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
      toast.success("Letter sent")
      setSubmitted(true)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to submit recommendation"))
    }
  }

  if (isLoading) {
    return (
      <Shell>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-64 w-full" />
      </Shell>
    )
  }

  if (isError || !data) {
    return (
      <Message kicker="Link not recognised" title="We couldn't find this letter">
        The link may have expired or been withdrawn. If you were expecting it, ask the student to send a new invitation.
      </Message>
    )
  }

  if (data.status === "submitted" && !submitted) {
    return (
      <Message kicker="Already received" title="This letter is in">
        It was submitted earlier, so there's nothing more to do. Thank you for taking the time.
      </Message>
    )
  }

  if (submitted) {
    return (
      <Message kicker="Sent" title="Thank you">
        Your letter for {data.studentName} has been delivered. They'll be told it arrived — a good letter can make the
        difference, and you wrote one.
      </Message>
    )
  }

  if (data.status === "declined") {
    return (
      <Message kicker="Declined" title="This invitation was declined">
        There's nothing left to do here.
      </Message>
    )
  }

  const tooShort = letterText.trim().length < 50

  // Main form — invited state
  return (
    <Shell>
      <p className="kicker">Letter of recommendation</p>
      <h1 className="mt-2 text-[30px] leading-[1.1] font-bold tracking-[-0.01em]">
        For {data.studentName}
      </h1>
      <p className="mt-1 text-ink-3">{data.programName}</p>

      <div className="card-soft mt-8 px-5 py-4 text-[15px] leading-[1.7] text-ink-2">
        <p>Dear {data.recommenderName},</p>
        <p className="mt-3">
          {data.studentName} has asked you to write a letter of recommendation for their application to{" "}
          <span className="text-ink">{data.programName}</span>. Write it below — there's no form to fill in, just the
          letter. It goes straight to their application once you send it.
        </p>
      </div>

      <div className="card mt-6 transition-shadow focus-within:border-brand focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_16%,transparent)]">
        <textarea
          value={letterText}
          onChange={(e) => setLetterText(e.target.value)}
          placeholder="To the admissions committee…"
          className="block min-h-[22rem] w-full resize-none bg-transparent px-6 py-7 text-[15px] leading-[1.75] text-ink outline-none [field-sizing:content] placeholder:text-ink-4 sm:px-8"
          aria-label="Your letter"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs text-ink-3 tnum">
          {wordCount} {wordCount === 1 ? "word" : "words"}
          {letterText.trim().length > 0 && tooShort && (
            <span className="ml-3 text-ochre">at least 50 characters ({letterText.trim().length}/50)</span>
          )}
        </span>
        <Button variant="primary" size="lg" onClick={handleSubmit} disabled={submitMutation.isPending || tooShort}>
          {submitMutation.isPending && <Loader2 className="animate-spin" />}
          Send the letter
        </Button>
      </div>
    </Shell>
  )
}
