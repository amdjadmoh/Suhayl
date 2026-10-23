import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "sonner"
import { Check, Link2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useRecommendations,
  useInviteRecommender,
  useDeleteRecommendation,
} from "@/lib/api-recommender"
import type { Recommendation } from "@/lib/api-recommender"
import { cn, getErrorMessage } from "@/lib/utils"
import { formatDate, plural } from "@/lib/format"
import { BackLink, EmptyState, ErrorState, Field, LoadingPage, PageHeader } from "@/components/kit"

const STATUS_LABEL: Record<Recommendation["status"], { label: string; tone: string }> = {
  invited: { label: "Waiting", tone: "bg-ochre-soft text-ochre" },
  submitted: { label: "Letter in", tone: "bg-moss-soft text-moss" },
  declined: { label: "Declined", tone: "bg-stamp-soft text-stamp" },
}

function letterLink(rec: Recommendation): string {
  return `${window.location.origin}/recommendation/${rec.token}`
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export default function RecommenderManager(): React.ReactElement {
  const { id: applicationId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  // View letter dialog state
  const [letterOpen, setLetterOpen] = useState(false)
  const [selected, setSelected] = useState<Recommendation | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { data, isLoading, isError } = useRecommendations(applicationId ?? "")
  const inviteMutation = useInviteRecommender()
  const deleteMutation = useDeleteRecommendation()

  const recommendations = data?.recommendations ?? []
  const received = recommendations.filter((r) => r.status === "submitted").length

  async function handleInvite(e?: React.FormEvent): Promise<void> {
    e?.preventDefault()
    if (!applicationId || !name.trim() || !email.trim()) return
    try {
      const rec = await inviteMutation.mutateAsync({
        applicationId,
        recommenderName: name.trim(),
        recommenderEmail: email.trim(),
      })
      if (rec.emailSent) {
        toast.success(`Invitation emailed to ${name.trim()}`)
      } else {
        // No email on this server: hand the student the link to send themselves
        const copied = await copyText(letterLink(rec))
        toast.success(copied ? `Link copied — send it to ${name.trim()}` : `Invitation ready — copy the link and send it to ${name.trim()}`, {
          description: "They write the letter there, no account needed.",
        })
      }
      setInviteOpen(false)
      setName("")
      setEmail("")
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to invite recommender"))
    }
  }

  async function handleDelete(id: string): Promise<void> {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Invitation withdrawn")
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to cancel recommendation"))
    }
  }

  async function handleCopy(rec: Recommendation): Promise<void> {
    if (await copyText(letterLink(rec))) {
      setCopiedId(rec._id)
      toast.success("Link copied")
      window.setTimeout(() => setCopiedId((id) => (id === rec._id ? null : id)), 2000)
    } else {
      window.prompt("Copy this link and send it to them:", letterLink(rec))
    }
  }

  function viewLetter(rec: Recommendation): void {
    setSelected(rec)
    setLetterOpen(true)
  }

  if (isLoading) return <LoadingPage />

  if (isError) {
    return (
      <ErrorState
        title="Recommenders didn't load"
        action={
          <Button variant="outline" onClick={() => navigate(`/applications/${applicationId ?? ""}`)}>
            Back to the application
          </Button>
        }
      />
    )
  }

  const inviteButton = (
    <Button variant="primary" onClick={() => setInviteOpen(true)}>
      Invite a recommender
    </Button>
  )

  return (
    <>
      <PageHeader
        back={<BackLink to={`/applications/${applicationId ?? ""}`}>Application</BackLink>}
        kicker={recommendations.length ? `${received} of ${plural(recommendations.length, "letter")} received` : "Letters of recommendation"}
        title="Recommenders"
        actions={inviteButton}
      >
        Each person gets a private link. They write the letter there, with no account needed, and you can read it here once it's in.
      </PageHeader>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <form onSubmit={handleInvite} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>Invite a recommender</DialogTitle>
              <DialogDescription>
                A professor, a manager, someone who knows your work. They'll get a private link to write the letter.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <Field label="Their name" htmlFor="rec-name">
                <Input id="rec-name" placeholder="Dr. Amina Benali" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Their email" htmlFor="rec-email">
                <Input
                  id="rec-email"
                  type="email"
                  placeholder="a.benali@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setInviteOpen(false)
                  setName("")
                  setEmail("")
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={inviteMutation.isPending || !name.trim() || !email.trim()}>
                {inviteMutation.isPending && <Loader2 className="animate-spin" />}
                Send invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {recommendations.length === 0 ? (
        <EmptyState title="Invite your first recommender" action={inviteButton}>
          Ask early — people are busy, and a good letter takes a week or two to write.
        </EmptyState>
      ) : (
        <ul className="card divide-y divide-rule-soft overflow-hidden">
          {recommendations.map((rec) => {
            const st = STATUS_LABEL[rec.status]
            return (
              <li key={rec._id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 px-5">
                <div className="min-w-0 flex-1">
                  <p className="text-base leading-tight font-semibold">{rec.recommenderName}</p>
                  <p className="truncate text-[13px] text-ink-3">{rec.recommenderEmail}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", st.tone)}>{st.label}</span>
                  <p className="text-xs text-ink-4 tnum">
                    {rec.status === "submitted" && rec.submittedAt
                      ? `received ${formatDate(rec.submittedAt)}`
                      : `asked ${formatDate(rec.createdAt)}`}
                  </p>
                </div>
                <div className="flex w-full justify-end gap-2 sm:w-auto">
                  {rec.status === "submitted" && (
                    <Button variant="outline" size="sm" onClick={() => viewLetter(rec)}>
                      Read letter
                    </Button>
                  )}
                  {rec.status === "invited" && (
                    <Button variant="outline" size="sm" onClick={() => handleCopy(rec)}>
                      {copiedId === rec._id ? <Check /> : <Link2 />}
                      {copiedId === rec._id ? "Copied" : "Copy link"}
                    </Button>
                  )}
                  {rec.status === "invited" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rec._id)}
                      disabled={deleteMutation.isPending}
                      className="text-stamp hover:bg-stamp-soft hover:text-stamp"
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* View letter dialog */}
      <Dialog open={letterOpen} onOpenChange={setLetterOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <p className="kicker">Letter of recommendation</p>
            <DialogTitle>From {selected?.recommenderName}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-2xl bg-paper-sunken px-5 py-5 text-[15px] leading-[1.7] whitespace-pre-wrap text-ink">
            {selected?.letterText || "No letter text available."}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setLetterOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
