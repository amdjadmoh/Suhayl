import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { UseMutationResult } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { Student } from "@/types/student"

/* Follow-ups, payments and bulk document requests on an agency's students */

function useStudentMutation<V>(fn: (v: V) => Promise<Student>): UseMutationResult<Student, Error, V> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (student) => {
      qc.setQueryData(["students", student._id], student)
      qc.invalidateQueries({ queryKey: ["students"], exact: true })
    },
  })
}

export function useAddTask(): UseMutationResult<Student, Error, { studentId: string; text: string; dueDate?: string }> {
  return useStudentMutation(async ({ studentId, ...body }) => (await api.post(`/students/${studentId}/tasks`, body)).data)
}

export function useUpdateTask(): UseMutationResult<
  Student,
  Error,
  { studentId: string; taskId: string; done?: boolean; text?: string; dueDate?: string | null }
> {
  return useStudentMutation(async ({ studentId, taskId, ...body }) => (await api.put(`/students/${studentId}/tasks/${taskId}`, body)).data)
}

export function useRemoveTask(): UseMutationResult<Student, Error, { studentId: string; taskId: string }> {
  return useStudentMutation(async ({ studentId, taskId }) => (await api.delete(`/students/${studentId}/tasks/${taskId}`)).data)
}

export function useAddPayment(): UseMutationResult<
  Student,
  Error,
  { studentId: string; amount: number; paidAt: string; method?: string; note?: string }
> {
  return useStudentMutation(async ({ studentId, ...body }) => (await api.post(`/students/${studentId}/payments`, body)).data)
}

export function useRemovePayment(): UseMutationResult<Student, Error, { studentId: string; paymentId: string }> {
  return useStudentMutation(async ({ studentId, paymentId }) => (await api.delete(`/students/${studentId}/payments/${paymentId}`)).data)
}

export function useSetFee(): UseMutationResult<Student, Error, { studentId: string; feeAgreed: number | null; feeCurrency?: string }> {
  return useStudentMutation(async ({ studentId, ...body }) => (await api.put(`/students/${studentId}`, body)).data)
}

export interface BulkRequestResult {
  requested: number
  alreadyAsked: number
  notFound: number
}

export function useBulkRequestDocument(): UseMutationResult<
  BulkRequestResult,
  Error,
  { studentIds: string[]; title: string; note?: string; dueDate?: string }
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body) => (await api.post("/students/bulk/documents", body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  })
}
