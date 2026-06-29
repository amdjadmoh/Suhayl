import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AxiosError } from "axios";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Extracts a human-readable message from any error, including Axios responses. */
export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err && typeof err === "object" && "isAxiosError" in err) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    return axiosErr.response?.data?.message ?? axiosErr.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
