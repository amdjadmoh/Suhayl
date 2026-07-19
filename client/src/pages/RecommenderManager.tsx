import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Loader2,
  Mail,
  User,
  Check,
  X,
  Clock,
  AlertCircle,
} from "lucide-react"
import {
  useRecommendations,
  useInviteRecommender,
  useDeleteRecommendation,
} from "@/lib/api-recommender"
import type { Recommendation } from "@/lib/api-recommender"
import { getErrorMessage } from "@/lib/utils"

const STATUS_BADGE: Record<
  Recommendation["status"],
  { label: string; className: string }
> = {
  invited: { label: "Invited", className: "bg-amber-100 dark:bg-amber-500/15 text-amber-800 border-amber-200 dark:border-amber-500/30" },
  submitted: { label: "Submitted", className: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 border-emerald-200 dark:border-emerald-500/30" },
  declined: { label: "Declined", className: "bg-red-100 dark:bg-red-500/15 text-red-800 border-red-200 dark:border-red-500/30" },
}

const STATUS_ICON: Record<Recommendation["status"], React.ReactNode> = {
  invited: <Clock className="h-4 w-4 text-amber-500" />,
  submitted: <Check className="h-4 w-4 text-emerald-500" />,
  declined: <X className="h-4 w-4 text-red-500" />,
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
  const [selectedLetter, setSelectedLetter] = useState("")

  const { data, isLoading, isError } = useRecommendations(applicationId ?? "")
  const inviteMutation = useInviteRecommender()
  const deleteMutation = useDeleteRecommendation()

  const recommendations = data?.recommendations ?? []

  async function handleInvite(): Promise<void> {
    if (!applicationId || !name.trim() || !email.trim()) return
    try {
      await inviteMutation.mutateAsync({
        applicationId,
        recommenderName: name.trim(),
        recommenderEmail: email.trim(),
      })
      toast.success("Recommender invited")
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
      toast.success("Recommendation cancelled")
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to cancel recommendation"))
    }
  }

  function viewLetter(letterText: string): void {
    setSelectedLetter(letterText)
    setLetterOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-foreground">Error loading recommenders</h2>
        <button
          onClick={() => navigate(`/applications/${applicationId ?? ""}`)}
          className="mt-4 inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Back to Application
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/applications/${applicationId ?? ""}`)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Recommenders
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage letters of recommendation for this application
            </p>
          </div>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
              <Plus className="mr-1.5 h-4 w-4" /> Invite Recommender
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Recommender</DialogTitle>
              <DialogDescription>
                Send an email invitation to a professor, employer, or other
                recommender.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Recommender Name
                </label>
                <Input
                  placeholder="e.g. Dr. Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Recommender Email
                </label>
                <Input
                  type="email"
                  placeholder="e.g. jane.smith@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border-border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setInviteOpen(false)
                  setName("")
                  setEmail("")
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={
                  inviteMutation.isPending ||
                  !name.trim() ||
                  !email.trim()
                }
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {inviteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Sending...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
          <Mail className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-foreground">
            No recommenders yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite your first recommender to get started.
          </p>
          <Button
            onClick={() => setInviteOpen(true)}
            className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Invite Recommender
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div
              key={rec._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-6 py-4"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">
                    {rec.recommenderName}
                  </p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {rec.recommenderEmail}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge
                  variant="outline"
                  className={STATUS_BADGE[rec.status].className}
                >
                  <span className="flex items-center gap-1">
                    {STATUS_ICON[rec.status]}
                    {STATUS_BADGE[rec.status].label}
                  </span>
                </Badge>
                {rec.status === "submitted" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewLetter(rec.letterText)}
                    className="border-border rounded-lg"
                  >
                    <Eye className="mr-1.5 h-4 w-4" /> View Letter
                  </Button>
                )}
                {rec.status === "invited" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(rec._id)}
                    disabled={deleteMutation.isPending}
                    className="border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" /> Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Letter Dialog */}
      <Dialog open={letterOpen} onOpenChange={setLetterOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recommendation Letter</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-muted p-4 text-sm text-foreground leading-relaxed">
            {selectedLetter || "No letter text available."}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLetterOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
