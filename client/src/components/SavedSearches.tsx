import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useSavedSearches, useCreateSavedSearch, useDeleteSavedSearch } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Saved filter sets for a catalogue page. Shown as a short list of named
 * links under the filters, with a "save this search" action.
 */
export function SavedSearches({
  entityType,
  currentFilters,
  onApply,
  placeholder,
}: {
  entityType: "program" | "university";
  currentFilters: Record<string, string>;
  onApply: (filters: Record<string, string>) => void;
  placeholder: string;
}): React.ReactElement {
  const { data } = useSavedSearches();
  const createSavedSearch = useCreateSavedSearch();
  const deleteSavedSearch = useDeleteSavedSearch();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const searches = data?.savedSearches?.filter((s) => s.entityType === entityType) ?? [];
  const hasFilters = Object.keys(currentFilters).length > 0;

  async function handleSave(): Promise<void> {
    if (!name.trim()) return;
    try {
      await createSavedSearch.mutateAsync({ name: name.trim(), entityType, filters: currentFilters });
      toast.success("Search saved");
      setOpen(false);
      setName("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save search"));
    }
  }

  async function handleDelete(id: string): Promise<void> {
    try {
      await deleteSavedSearch.mutateAsync(id);
      toast.success("Saved search removed");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete saved search"));
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="kicker">Saved searches</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!hasFilters}
          className="text-xs text-ink-2 hover:text-ink disabled:cursor-not-allowed disabled:text-ink-4 tnum"
          title={hasFilters ? "Save the current filters" : "Set some filters first"}
        >
          + Save this
        </button>
      </div>
      {searches.length === 0 ? (
        <p className="text-xs leading-relaxed text-ink-3">
          Searches you run often can be saved here and reopened with one click.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {searches.map((s) => (
            <li key={s._id} className="group flex items-center justify-between gap-2">
              <button
                type="button"
                className="link-ink truncate py-1 text-left text-sm hover:text-ink"
                onClick={() => onApply(s.filters)}
              >
                {s.name}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s._id)}
                className="rounded-lg px-1 text-ink-4 opacity-0 transition-opacity group-hover:opacity-100 hover:text-stamp focus-visible:opacity-100"
                aria-label={`Delete saved search ${s.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Save this search</DialogTitle>
            <DialogDescription>Give it a name you'll recognise later.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            placeholder={placeholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!name.trim() || createSavedSearch.isPending}>
              {createSavedSearch.isPending && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
