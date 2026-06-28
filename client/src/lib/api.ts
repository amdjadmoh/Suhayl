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
import type { City, CityWithUniversities, CityFormData } from "@/types/city";

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

export async function createCountry(data: Partial<Country>): Promise<Country> {
  const response = await api.post("/countries", data)
  return response.data
}

export async function updateCountry(
  id: string,
  data: Partial<Country>
): Promise<Country> {
  const response = await api.put(`/countries/${id}`, data)
  return response.data
}

export async function deleteCountry(id: string): Promise<void> {
  await api.delete(`/countries/${id}`)
}

export function useCreateCountry(): UseMutationResult<
  Country,
  Error,
  Partial<Country>
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] })
    },
  })
}

export function useUpdateCountry(): UseMutationResult<
  Country,
  Error,
  { id: string; data: Partial<Country> }
> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateCountry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] })
    },
  })
}

export function useDeleteCountry(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] })
    },
  })
}

// Cities

export async function getCities(country?: string): Promise<City[]> {
  const params = country ? { country } : undefined;
  const response = await api.get("/cities", { params });
  return response.data;
}

export async function getCity(id: string): Promise<City> {
  const response = await api.get(`/cities/${id}`);
  return response.data;
}

export async function getCitiesByCountry(countryName: string): Promise<City[]> {
  const response = await api.get(`/cities/by-country/${encodeURIComponent(countryName)}`);
  return response.data;
}

export async function getCityWithUniversities(id: string): Promise<CityWithUniversities> {
  const response = await api.get(`/cities/${id}/universities`);
  return response.data;
}

export async function createCity(data: CityFormData): Promise<City> {
  const response = await api.post("/cities", data);
  return response.data;
}

export async function updateCity(id: string, data: Partial<CityFormData>): Promise<City> {
  const response = await api.put(`/cities/${id}`, data);
  return response.data;
}

export async function deleteCity(id: string): Promise<void> {
  await api.delete(`/cities/${id}`);
}

export function useCities(country?: string): UseQueryResult<City[]> {
  return useQuery({
    queryKey: ["cities", country],
    queryFn: () => getCities(country),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCity(id: string): UseQueryResult<City> {
  return useQuery({
    queryKey: ["cities", id],
    queryFn: () => getCity(id),
    enabled: id.length > 0,
  });
}

export function useCitiesByCountry(countryName: string): UseQueryResult<City[]> {
  return useQuery({
    queryKey: ["cities", "by-country", countryName],
    queryFn: () => getCitiesByCountry(countryName),
    enabled: countryName.length > 0,
  });
}

export function useCityWithUniversities(id: string): UseQueryResult<CityWithUniversities> {
  return useQuery({
    queryKey: ["cities", id, "universities"],
    queryFn: () => getCityWithUniversities(id),
    enabled: id.length > 0,
  });
}

export function useCreateCity(): UseMutationResult<City, Error, CityFormData> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
  });
}

export function useUpdateCity(): UseMutationResult<City, Error, { id: string; data: Partial<CityFormData> }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
  });
}

export function useDeleteCity(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
  });
}
