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
import type { Program, ProgramFormData } from "@/types/program";
import type {
  Application,
  ApplicationFormData,
} from "@/types/application";
import type { Country, CountryWithUniversities } from "@/types/country";
import type { City, CityWithUniversities, CityFormData } from "@/types/city";
import type { User, AuthResponse } from "@/types/auth";
import type { Student } from "@/types/student";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token to every request if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Universities (institution-only catalog) ─────────────────────────────────

interface UniversityQueryParams {
  search?: string;
  country?: string;
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

// ─── Programs (degree offerings at universities) ────────────────────────────

interface ProgramQueryParams {
  search?: string;
  country?: string;
  degreeLevel?: string;
}

export async function getPrograms(
  params?: ProgramQueryParams,
): Promise<{ programs: Program[]; total: number }> {
  const response = await api.get("/programs", { params });
  return response.data;
}

export async function getProgram(id: string): Promise<Program> {
  const response = await api.get(`/programs/${id}`);
  return response.data;
}

export async function getProgramsByUniversity(
  universityId: string,
): Promise<Program[]> {
  const response = await api.get(`/programs/by-university/${universityId}`);
  return response.data;
}

export async function createProgram(
  data: ProgramFormData,
): Promise<Program> {
  const response = await api.post("/programs", data);
  return response.data;
}

export async function updateProgram(
  id: string,
  data: Partial<ProgramFormData>,
): Promise<Program> {
  const response = await api.put(`/programs/${id}`, data);
  return response.data;
}

export async function deleteProgram(id: string): Promise<void> {
  await api.delete(`/programs/${id}`);
}

export function usePrograms(
  params?: ProgramQueryParams,
): UseQueryResult<{ programs: Program[]; total: number }> {
  return useQuery({
    queryKey: ["programs", params],
    queryFn: () => getPrograms(params),
  });
}

export function useProgram(id: string): UseQueryResult<Program> {
  return useQuery({
    queryKey: ["programs", id],
    queryFn: () => getProgram(id),
    enabled: id.length > 0,
  });
}

export function useProgramsByUniversity(
  universityId: string,
): UseQueryResult<Program[]> {
  return useQuery({
    queryKey: ["programs", "by-university", universityId],
    queryFn: () => getProgramsByUniversity(universityId),
    enabled: universityId.length > 0,
  });
}

export function useCreateProgram(): UseMutationResult<
  Program,
  Error,
  ProgramFormData
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });
}

export function useUpdateProgram(): UseMutationResult<
  Program,
  Error,
  { id: string; data: Partial<ProgramFormData> }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProgram(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });
}

export function useDeleteProgram(): UseMutationResult<
  void,
  Error,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });
}

// ─── Applications (role-scoped, linked to programs) ─────────────────────────

interface ApplicationQueryParams {
  status?: string;
  search?: string;
}

export async function getApplications(
  params?: ApplicationQueryParams,
): Promise<{ applications: Application[]; total: number }> {
  const response = await api.get("/applications", { params });
  return response.data;
}

export async function getApplication(id: string): Promise<Application> {
  const response = await api.get(`/applications/${id}`);
  return response.data;
}

export async function createApplication(
  data: ApplicationFormData,
): Promise<Application> {
  const response = await api.post("/applications", data);
  return response.data;
}

export async function updateApplication(
  id: string,
  data: Partial<ApplicationFormData>,
): Promise<Application> {
  const response = await api.put(`/applications/${id}`, data);
  return response.data;
}

export async function deleteApplication(id: string): Promise<void> {
  await api.delete(`/applications/${id}`);
}

export function useApplications(
  params?: ApplicationQueryParams,
): UseQueryResult<{ applications: Application[]; total: number }> {
  return useQuery({
    queryKey: ["applications", params],
    queryFn: () => getApplications(params),
  });
}

export function useApplication(
  id: string,
): UseQueryResult<Application> {
  return useQuery({
    queryKey: ["applications", id],
    queryFn: () => getApplication(id),
    enabled: id.length > 0,
  });
}

export function useCreateApplication(): UseMutationResult<
  Application,
  Error,
  ApplicationFormData
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useUpdateApplication(): UseMutationResult<
  Application,
  Error,
  { id: string; data: Partial<ApplicationFormData> }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useDeleteApplication(): UseMutationResult<
  void,
  Error,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

// ─── Countries ───────────────────────────────────────────────────────────────

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

// ─── Cities ──────────────────────────────────────────────────────────────────

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

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: "student" | "agency",
): Promise<AuthResponse> {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
    role,
  });
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get("/auth/me");
  return response.data;
}

// ─── Agency ──────────────────────────────────────────────────────────────────

export async function getAgencyApplications(): Promise<Application[]> {
  const response = await api.get("/agency/applications");
  return response.data;
}

export async function getAgencyStudents(): Promise<
  { studentName: string; studentEmail: string; count: number }[]
> {
  const response = await api.get("/agency/students");
  return response.data;
}

export function useAgencyApplications(): UseQueryResult<Application[]> {
  return useQuery({
    queryKey: ["agency", "applications"],
    queryFn: getAgencyApplications,
  });
}

export function useAgencyStudents(): UseQueryResult<
  { studentName: string; studentEmail: string; count: number }[]
> {
  return useQuery({
    queryKey: ["agency", "students"],
    queryFn: getAgencyStudents,
  });
}

// ─── Students (agency) ───────────────────────────────────────────────────────

export async function getStudents(): Promise<Student[]> {
  const response = await api.get("/students");
  return response.data;
}

export async function getStudent(id: string): Promise<Student> {
  const response = await api.get(`/students/${id}`);
  return response.data;
}

export async function createStudent(
  data: Omit<Student, "_id" | "createdAt" | "updatedAt" | "agencyId">,
): Promise<Student> {
  const response = await api.post("/students", data);
  return response.data;
}

export async function updateStudent(
  id: string,
  data: Partial<Student>,
): Promise<Student> {
  const response = await api.put(`/students/${id}`, data);
  return response.data;
}

export async function deleteStudent(id: string): Promise<void> {
  await api.delete(`/students/${id}`);
}

export function useStudents(): UseQueryResult<Student[]> {
  return useQuery({ queryKey: ["students"], queryFn: getStudents });
}

export function useStudent(
  id: string,
): UseQueryResult<Student> {
  return useQuery({
    queryKey: ["students", id],
    queryFn: () => getStudent(id),
    enabled: id.length > 0,
  });
}

export function useCreateStudent(): UseMutationResult<
  Student,
  Error,
  Omit<Student, "_id" | "createdAt" | "updatedAt" | "agencyId">
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStudent,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent(): UseMutationResult<
  Student,
  Error,
  { id: string; data: Partial<Student> }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateStudent(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useDeleteStudent(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

// ─── Admin users ─────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const response = await api.get("/admin/users");
  return response.data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

export function useUsers(): UseQueryResult<User[]> {
  return useQuery({ queryKey: ["users"], queryFn: getUsers });
}

export function useDeleteUser(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export interface AdminStats {
  totalUsers: number;
  totalUniversities: number;
  totalPrograms: number;
  totalCountries: number;
  totalCities: number;
  totalAgencies: number;
  totalStudents: number;
  totalStudentsManaged: number;
  byRole: { role: string; count: number }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await api.get("/admin/stats");
  return response.data;
}

export async function createUserByAdmin(data: {
  email: string;
  password: string;
  name: string;
  role: string;
}): Promise<User> {
  const response = await api.post("/admin/users", data);
  return response.data;
}

export async function updateUserByAdmin(
  id: string,
  data: Partial<{ email: string; name: string; role: string }>,
): Promise<User> {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
}

export function useAdminStats(): UseQueryResult<AdminStats> {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: getAdminStats });
}

export function useCreateUserByAdmin(): UseMutationResult<
  User,
  Error,
  { email: string; password: string; name: string; role: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserByAdmin,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUserByAdmin(): UseMutationResult<
  User,
  Error,
  { id: string; data: Partial<{ email: string; name: string; role: string }> }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateUserByAdmin(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
