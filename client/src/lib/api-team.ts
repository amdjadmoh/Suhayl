import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { AuthResponse } from "@/types/auth"

export interface TeamMember {
  _id: string
  name: string
  email: string
  isOwner: boolean
  /** False while the counsellor hasn't used their invite link yet */
  joined: boolean
  invitedAt?: string
  students: number
}

export interface Team {
  members: TeamMember[]
  unassigned: number
}

export function useTeam(enabled = true): UseQueryResult<Team> {
  return useQuery({ queryKey: ["team"], queryFn: async () => (await api.get("/agency/team")).data, enabled })
}

export function joinUrl(token: string): string {
  return `${window.location.origin}/join/${token}`
}

export function useInviteMember(): UseMutationResult<{ _id: string; inviteToken: string }, Error, { name: string; email: string }> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body) => (await api.post("/agency/team", body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team"] }),
  })
}

export function useRenewInvite(): UseMutationResult<{ _id: string; inviteToken: string }, Error, string> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => (await api.post(`/agency/team/${id}/invite`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team"] }),
  })
}

export function useRemoveMember(): UseMutationResult<{ studentsUnassigned: number }, Error, string> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/agency/team/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] })
      qc.invalidateQueries({ queryKey: ["students"] })
    },
  })
}

export function useBulkAssign(): UseMutationResult<{ updated: number }, Error, { studentIds: string[]; counsellorId: string | null }> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body) => (await api.post("/students/bulk/assign", body)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] })
      qc.invalidateQueries({ queryKey: ["team"] })
    },
  })
}

// ─── Joining (no account yet, so no auth header) ───────────────────────────

const publicApi = axios.create({ baseURL: "/api/auth", timeout: 15000 })

export function useInvite(token: string): UseQueryResult<{ name: string; email: string; agencyName: string }> {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: async () => (await publicApi.get(`/invite/${token}`)).data,
    enabled: token.length > 0,
    retry: false,
  })
}

export async function acceptInvite(token: string, name: string, password: string): Promise<AuthResponse> {
  return (await publicApi.post(`/invite/${token}`, { name, password })).data
}
