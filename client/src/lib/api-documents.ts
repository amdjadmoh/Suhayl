import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Student } from "@/types/student"
import type { DocumentRequest, DocumentStatus, PortalData } from "@/types/document"

// ─── Agency side ─────────────────────────────────────────────────────────────

export function useStudentDocuments(studentId: string): UseQueryResult<DocumentRequest[]> {
  return useQuery({
    queryKey: ["documents", "student", studentId],
    queryFn: async () => (await api.get(`/students/${studentId}/documents`)).data,
    enabled: studentId.length > 0,
  })
}

/** Every request the agency has open, optionally only one status (e.g. "uploaded" = to review). */
export function useAgencyDocuments(status?: DocumentStatus): UseQueryResult<DocumentRequest[]> {
  return useQuery({
    queryKey: ["documents", "agency", status ?? "all"],
    queryFn: async () => (await api.get("/documents", { params: status ? { status } : {} })).data,
  })
}

function useInvalidateDocuments(): () => void {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ["documents"] })
}

export function useRequestDocument(): UseMutationResult<
  DocumentRequest & { emailSent?: boolean },
  Error,
  { studentId: string; title: string; note?: string; dueDate?: string }
> {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: async ({ studentId, ...body }) => (await api.post(`/students/${studentId}/documents`, body)).data,
    onSuccess: invalidate,
  })
}

export function useReviewDocument(): UseMutationResult<
  DocumentRequest,
  Error,
  { id: string; status: "accepted" | "rejected"; rejectReason?: string }
> {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: async ({ id, ...body }) => (await api.put(`/documents/${id}`, body)).data,
    onSuccess: invalidate,
  })
}

export function useDeleteDocument(): UseMutationResult<void, Error, string> {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/documents/${id}`)
    },
    onSuccess: invalidate,
  })
}

/** Turns the family link on (or replaces it); `enabled: false` turns it off. */
export function useSetPortal(): UseMutationResult<Student, Error, { studentId: string; enabled: boolean }> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ studentId, enabled }) =>
      (enabled ? await api.post(`/students/${studentId}/portal`) : await api.delete(`/students/${studentId}/portal`)).data,
    onSuccess: (student) => {
      qc.setQueryData(["students", student._id], student)
      qc.invalidateQueries({ queryKey: ["students"] })
    },
  })
}

export function useExtendPortal(): UseMutationResult<Student, Error, string> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (studentId) => (await api.put(`/students/${studentId}/portal/extend`)).data,
    onSuccess: (student) => {
      qc.setQueryData(["students", student._id], student)
      qc.invalidateQueries({ queryKey: ["students"] })
    },
  })
}

export function portalUrl(token: string): string {
  return `${window.location.origin}/portal/${token}`
}

// ─── Family portal (no account; the link is the key) ────────────────────────

// A separate client: the portal must never send a signed-in agency's token along
const portalApi = axios.create({ baseURL: "/api/portal", timeout: 60000 })

export function usePortal(token: string): UseQueryResult<PortalData> {
  return useQuery({
    queryKey: ["portal", token],
    queryFn: async () => (await portalApi.get(`/${token}`)).data,
    enabled: token.length > 0,
    retry: false,
  })
}

export function useUploadToPortal(token: string): UseMutationResult<unknown, Error, { docId: string; file: File }> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ docId, file }) => {
      const form = new FormData()
      form.append("file", file)
      return (await portalApi.post(`/${token}/documents/${docId}`, form)).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portal", token] }),
  })
}

export function portalFileUrl(token: string, docId: string): string {
  return `/api/portal/${token}/documents/${docId}/file`
}
