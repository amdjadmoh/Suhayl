import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

async function downloadBlob(path: string, filename: string, failure: string): Promise<void> {
  try {
    const response = await api.get(path, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err: unknown) {
    toast.error(getErrorMessage(err, failure));
  }
}

/** Every application deadline as an .ics file for Google, Apple or Outlook calendars. */
export function downloadDeadlinesCalendar(): Promise<void> {
  return downloadBlob("/applications/calendar.ics", "suhayl-deadlines.ics", "Couldn't download the calendar");
}

export function exportAgencyApplicationsCsv(): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  return downloadBlob(
    "/agency/applications/export.csv",
    `agency-applications-${today}.csv`,
    "Couldn't export the applications",
  );
}

/** A file a family uploaded through the portal. */
export function downloadAgencyDocument(id: string, filename: string): Promise<void> {
  return downloadBlob(`/documents/${id}/file`, filename, "Couldn't download the file");
}
