import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "wannaout-compare";
const MAX_COMPARE = 3;

interface CompareContextValue {
  compareIds: string[];
  addToCompare: (programId: string) => void;
  removeFromCompare: (programId: string) => void;
  isInCompare: (programId: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

function loadFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((id): id is string => typeof id === "string")) {
      return parsed.slice(0, MAX_COMPARE);
    }
  } catch {
    // corrupted data
  }
  return [];
}

function saveToStorage(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function CompareProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [compareIds, setCompareIds] = useState<string[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(compareIds);
  }, [compareIds]);

  const addToCompare = useCallback((programId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(programId)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, programId];
    });
  }, []);

  const removeFromCompare = useCallback((programId: string) => {
    setCompareIds((prev) => prev.filter((id) => id !== programId));
  }, []);

  const isInCompare = useCallback(
    (programId: string) => compareIds.includes(programId),
    [compareIds],
  );

  const clearCompare = useCallback(() => {
    setCompareIds([]);
  }, []);

  return (
    <CompareContext.Provider value={{ compareIds, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
