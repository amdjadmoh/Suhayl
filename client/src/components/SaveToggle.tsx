import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

/** Bookmark toggle used across catalogue rows. */
export function SaveToggle({
  saved,
  onToggle,
  label,
  className,
  disabled,
}: {
  saved: boolean;
  onToggle: () => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      aria-pressed={saved}
      title={saved ? "Remove from saved" : "Save for later"}
      className={cn("inline-flex items-center gap-1.5 rounded-lg p-1 text-ink-4 transition-colors hover:text-ink disabled:opacity-50",
        saved && "text-stamp hover:text-stamp",
        className,
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-current")} />
      {label && <span className="text-[13px] font-medium">{label}</span>}
    </button>
  );
}
