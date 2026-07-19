import { api } from "@/lib/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query"

// ── Types ────────────────────────────────────────────────────────────────────

export interface Recommendation {
  _id: string
  applicationId: string
  studentName: string
  studentEmail: string
  programName: string
  recommenderName: string
  recommenderEmail: string
  status: "invited" | "submitted" | "declined"
  token: string
  letterText: string
  submittedAt?: string
  createdAt: string
  updatedAt: string
}

export interface RecommendationListResponse {
  recommendations: Recommendation[]
}

export interface InvitePayload {
  applicationId: string
  recommenderName: string
  recommenderEmail: string
}

export interface SubmitPayload {
  token: string
  letterText: string
}

export interface PublicRecommendation {
  recommenderName: string
  studentName: string
  programName: string
  status: "invited" | "submitted" | "declined"
  letterText?: string
  submittedAt?: string
}

// ─── API Functions ───────────────────────────────────────────────────────────

async function getRecommendations(
  applicationId: string,
): Promise<RecommendationListResponse> {
  const response = await api.get(`/recommendations/application/${applicationId}`)
  return response.data
}

async function inviteRecommender(
  data: InvitePayload,
): Promise<Recommendation> {
  const response = await api.post("/recommendations", data)
  return response.data
}

async function submitRecommendation(
  data: SubmitPayload,
): Promise<{ message: string }> {
  const response = await api.post("/recommendations/public/submit", data)
  return response.data
}

async function deleteRecommendation(id: string): Promise<void> {
  await api.delete(`/recommendations/${id}`)
}

async function getRecommendationByToken(
  token: string,
): Promise<PublicRecommendation> {
  const response = await api.get(`/recommendations/public/${token}`)
  return response.data
}

// ─── React Query Hooks ───────────────────────────────────────────────────────

export function useRecommendations(
  applicationId: string,
): UseQueryResult<RecommendationListResponse> {
  return useQuery({
    queryKey: ["recommendations", applicationId],
    queryFn: () => getRecommendations(applicationId),
    enabled: applicationId.length > 0,
  })
}

export function useInviteRecommender(): UseMutationResult<
  Recommendation,
  Error,
  InvitePayload
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inviteRecommender,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["recommendations", data.applicationId],
      })
    },
  })
}

export function useSubmitRecommendation(): UseMutationResult<
  { message: string },
  Error,
  SubmitPayload
> {
  return useMutation({
    mutationFn: submitRecommendation,
  })
}

export function useDeleteRecommendation(): UseMutationResult<
  void,
  Error,
  string
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRecommendation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] })
    },
  })
}

export function useRecommendationByToken(
  token: string,
): UseQueryResult<PublicRecommendation> {
  return useQuery({
    queryKey: ["recommendation", token],
    queryFn: () => getRecommendationByToken(token),
    enabled: token.length > 0,
    retry: false,
  })
}
