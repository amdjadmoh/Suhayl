import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/authContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Countries from "@/pages/Countries";
import CountryDetail from "@/pages/CountryDetail";
import AddEditCountry from "@/pages/AddEditCountry";
import Cities from "@/pages/Cities";
import CityDetail from "@/pages/CityDetail";
import AddEditCity from "@/pages/AddEditCity";
import Universities from "@/pages/Universities";
import AddEditUniversity from "@/pages/AddEditUniversity";
import UniversityDetail from "@/pages/UniversityDetail";
import ApplicationsTracker from "@/pages/ApplicationsTracker";
import ApplicationDetail from "@/pages/ApplicationDetail";
import AddEditApplication from "@/pages/AddEditApplication";
import Programs from "@/pages/Programs";
import ProgramDetail from "@/pages/ProgramDetail";
import AddEditProgram from "@/pages/AddEditProgram";
import Compare from "@/pages/Compare";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AgencyDashboard from "@/pages/AgencyDashboard";
import AgencyStudents from "@/pages/AgencyStudents";
import AgencyStudentDetail from "@/pages/AgencyStudentDetail";
import Users from "@/pages/Users";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Authenticated routes wrapped in Layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="countries" element={<Countries />} />
                  <Route path="countries/new" element={<AddEditCountry />} />
                  <Route path="countries/:id" element={<CountryDetail />} />
                  <Route
                    path="countries/:id/edit"
                    element={<AddEditCountry />}
                  />
                  <Route path="cities" element={<Cities />} />
                  <Route path="cities/new" element={<AddEditCity />} />
                  <Route path="cities/:id" element={<CityDetail />} />
                  <Route path="cities/:id/edit" element={<AddEditCity />} />

                  {/* University routes — admin write, all read */}
                  <Route path="universities" element={<Universities />} />
                  <Route
                    path="universities/new"
                    element={<ProtectedRoute role="admin"><AddEditUniversity /></ProtectedRoute>}
                  />
                  <Route
                    path="universities/:id"
                    element={<UniversityDetail />}
                  />
                  <Route
                    path="universities/:id/edit"
                    element={<ProtectedRoute role="admin"><AddEditUniversity /></ProtectedRoute>}
                  />

                  {/* Program routes — admin write, all read */}
                  <Route path="programs" element={<Programs />} />
                  <Route path="programs/new" element={<ProtectedRoute role="admin"><AddEditProgram /></ProtectedRoute>} />
                  <Route path="programs/:id" element={<ProgramDetail />} />
                  <Route path="programs/:id/edit" element={<ProtectedRoute role="admin"><AddEditProgram /></ProtectedRoute>} />

                  {/* Application routes */}
                  <Route path="applications" element={<ApplicationsTracker />} />
                  <Route path="applications/new" element={<AddEditApplication />} />
                  <Route path="applications/:id" element={<ApplicationDetail />} />
                  <Route path="applications/:id/edit" element={<AddEditApplication />} />

                  {/* Other routes */}
                  <Route path="users" element={<ProtectedRoute role="admin"><Users /></ProtectedRoute>} />
                  <Route path="compare" element={<ProtectedRoute role="student"><Compare /></ProtectedRoute>} />
                  <Route path="agency" element={<ProtectedRoute role="agency"><AgencyDashboard /></ProtectedRoute>} />
                  <Route path="agency/students" element={<ProtectedRoute role="agency"><AgencyStudents /></ProtectedRoute>} />
                  <Route path="agency/students/:id" element={<ProtectedRoute role="agency"><AgencyStudentDetail /></ProtectedRoute>} />
                </Route>
              </Route>
            </Routes>
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
