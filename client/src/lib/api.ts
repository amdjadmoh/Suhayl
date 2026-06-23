import axios from "axios";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import type {
  University,
  UniversityStats,
  UniversityFormData,
} from "@/types/university";
import type { Country, CountryWithUniversities } from "@/types/country";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

interface UniversityQueryParams {
  search?: string;
  country?: string;
  status?: string;
  degreeLevel?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export async function getUniversities(
  params?: UniversityQueryParams,
): Promise<{ universities: University[]; total: number }> {
  const response = await api.get("/universities", { params });
  return response.data;
}

export async function getUniversity(id: string): Promise<University> {
  const response = await api.get(`/universities/${id}`);
  return response.data;
}

export async function createUniversity(
  data: UniversityFormData,
): Promise<University> {
  const response = await api.post("/universities", data);
  return response.data;
}

export async function updateUniversity(
  id: string,
  data: Partial<UniversityFormData>,
): Promise<University> {
  const response = await api.put(`/universities/${id}`, data);
  return response.data;
}

export async function deleteUniversity(id: string): Promise<void> {
  await api.delete(`/universities/${id}`);
}

export async function getStats(): Promise<UniversityStats> {
  const response = await api.get("/stats");
  return response.data;
}

export function useUniversities(
  params?: UniversityQueryParams,
): UseQueryResult<{ universities: University[]; total: number }> {
  return useQuery({
    queryKey: ["universities", params],
    queryFn: () => getUniversities(params),
  });
}

export function useUniversity(id: string): UseQueryResult<University> {
  return useQuery({
    queryKey: ["universities", id],
    queryFn: () => getUniversity(id),
    enabled: id.length > 0,
  });
}

export function useStats(): UseQueryResult<UniversityStats> {
  return useQuery({
    queryKey: ["universities", "stats"],
    queryFn: getStats,
  });
}

export function useCreateUniversity(): UseMutationResult<
  University,
  Error,
  UniversityFormData
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUniversity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
    },
  });
}

export function useUpdateUniversity(): UseMutationResult<
  University,
  Error,
  { id: string; data: Partial<UniversityFormData> }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateUniversity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
    },
  });
}

export function useDeleteUniversity(): UseMutationResult<
  void,
  Error,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUniversity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
    },
  });
}

// Countries

export async function getCountries(): Promise<Country[]> {
  const response = await api.get("/countries")
  return response.data
}

export async function getCountry(id: string): Promise<Country> {
  const response = await api.get(`/countries/${id}`)
  return response.data
}

export async function getCountryWithUniversities(
  id: string
): Promise<CountryWithUniversities> {
  const response = await api.get(`/countries/${id}/universities`)
  return response.data
}

export function useCountries(): UseQueryResult<Country[]> {
  return useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCountry(id: string): UseQueryResult<Country> {
  return useQuery({
    queryKey: ["countries", id],
    queryFn: () => getCountry(id),
    enabled: id.length > 0,
  })
}

export function useCountryWithUniversities(
  id: string
): UseQueryResult<CountryWithUniversities> {
  return useQuery({
    queryKey: ["countries", id, "universities"],
    queryFn: () => getCountryWithUniversities(id),
    enabled: id.length > 0,
  })
}
