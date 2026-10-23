import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useApplication, useUpdateApplication } from "@/lib/api";
import { cn, getErrorMessage } from "@/lib/utils";
import type { Program } from "@/types/program";
import { Button } from "@/components/ui/button";
import { BackLink, ErrorState, LoadingPage } from "@/components/kit";

export default function StatementEditor(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: application, isLoading, isError } = useApplication(id ?? "");
  const updateMutation = useUpdateApplication();

  const [text, setText] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "dirty" | "saving" | "saved">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  // Load initial statement text
  useEffect(() => {
    if (application && !initialLoadDone.current) {
      setText(application.personalStatement ?? "");
      initialLoadDone.current = true;
    }
  }, [application]);

  // Auto-save with debounce
  const autoSave = useCallback(
    async (content: string) => {
      if (!id) return;
      setSaveStatus("saving");
      try {
        await updateMutation.mutateAsync({
          id,
          data: { personalStatement: content } as never,
        });
        setSaveStatus("saved");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to save"));
        setSaveStatus("dirty");
      }
    },
    [id, updateMutation],
  );

  function handleChange(value: string): void {
    setText(value);
    setSaveStatus("dirty");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      autoSave(value);
    }, 2000);
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const prog =
    application && typeof application.programId === "object"
      ? (application.programId as unknown as Program)
      : null;
  const wordLimit = (prog as (Program & { sopWordLimit?: number }) | null)?.sopWordLimit ?? 1000;
  const wordPercent = wordLimit > 0 ? (wordCount / wordLimit) * 100 : 0;

  if (isLoading) return <LoadingPage />;

  if (isError || !application) {
    return (
      <ErrorState
        title="Application not found"
        action={<Button variant="outline" onClick={() => navigate("/applications")}>Back to applications</Button>}
      />
    );
  }

  const statusText =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "dirty"
          ? "Unsaved"
          : "Saves as you type";

  return (
    <div className="mx-auto max-w-[46rem]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <BackLink to={`/applications/${id}`}>Application</BackLink>
        <span
          className={cn("text-xs tnum",
            saveStatus === "saved" ? "text-moss" : saveStatus === "dirty" ? "text-ochre" : "text-ink-3",
          )}
          aria-live="polite"
        >
          {statusText}
        </span>
      </div>

      <p className="kicker">Statement of purpose</p>
      <h1 className="mt-1 text-2xl leading-tight font-bold tracking-[-0.01em]">
        {prog?.name ?? "Application"}
      </h1>
      <p className="mt-1 text-sm text-ink-3">For {application.studentName}</p>

      <div className="card mt-6 transition-shadow focus-within:border-brand focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_16%,transparent)]">
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Start with why. Why this program, why now, and what you'll bring to it…"
          className="block min-h-[60vh] w-full resize-none bg-transparent px-6 py-8 text-[16px] leading-[1.75] text-ink outline-none [field-sizing:content] placeholder:text-ink-4 sm:px-10 sm:py-10"
          spellCheck
          aria-label="Statement of purpose"
        />
      </div>

      <div className="sticky bottom-0 mt-4 flex items-center gap-4 bg-paper/95 py-3 backdrop-blur-[2px]">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-sunken">
          <div
            className={cn("h-full transition-[width] duration-300",
              wordPercent > 100 ? "bg-stamp" : wordPercent > 90 ? "bg-ochre" : "bg-ink",
            )}
            style={{ width: `${Math.min(wordPercent, 100)}%` }}
          />
        </div>
        <span
          className={cn("text-xs tnum",
            wordPercent > 100 ? "font-semibold text-stamp" : wordPercent > 90 ? "text-ochre" : "text-ink-2",
          )}
        >
          {wordCount.toLocaleString()} / {wordLimit.toLocaleString()} words
        </span>
        <span className="hidden text-xs text-ink-4 tnum sm:inline">{charCount.toLocaleString()} chars</span>
      </div>
    </div>
  );
}
