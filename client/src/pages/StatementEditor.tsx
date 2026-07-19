import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApplication, useUpdateApplication } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { Program } from "@/types/program";

export default function StatementEditor(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: application, isLoading, isError } = useApplication(id ?? "");
  const updateMutation = useUpdateApplication();

  const [text, setText] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
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
          data: { personalStatement: content } as any,
        });
        setSaveStatus("saved");
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to save"));
        setSaveStatus("idle");
      }
    },
    [id, updateMutation],
  );

  function handleChange(value: string): void {
    setText(value);
    setSaveStatus("idle");

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
    application &&
    typeof application.programId === "object"
      ? (application.programId as unknown as Program)
      : null;
  const wordLimit = (prog as any)?.sopWordLimit ?? 1000;
  const wordPercent = wordLimit > 0 ? (wordCount / wordLimit) * 100 : 0;

  const wordColor =
    wordPercent > 100
      ? "text-red-600"
      : wordPercent > 90
      ? "text-amber-600"
      : "text-emerald-600";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-[#0F172A]">Application not found</h2>
        <button
          onClick={() => navigate("/applications")}
          className="mt-4 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/applications/${id}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Statement of Purpose
            </h1>
            <p className="text-sm text-slate-500">
              {prog?.name ?? "Application"} · {application.studentName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Save status indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0EA5E9]" />
                <span className="text-[#0EA5E9]">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Save className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600">All changes saved</span>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-lg border-slate-200"
          >
            <Link to={`/applications/${id}`}>Back to Application</Link>
          </Button>
        </div>
      </div>

      {/* Word count bar */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-[#0F172A]">
              Word Count
            </span>
          </div>
          <span className={`text-sm font-medium ${wordColor}`}>
            {wordCount} / {wordLimit} words
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              wordPercent > 100
                ? "bg-red-500"
                : wordPercent > 90
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(wordPercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {charCount} character{charCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Editor */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
            <FileText className="h-5 w-5 text-slate-400" />
            Personal Statement
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Write your statement of purpose below. It auto-saves as you type.
          </p>
        </div>
        <div className="p-6">
          <textarea
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Start writing your statement of purpose..."
            className="w-full min-h-[400px] rounded-xl border border-slate-200 bg-white p-4 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] resize-y transition-colors"
            spellCheck
          />
        </div>
      </div>
    </div>
  );
}
