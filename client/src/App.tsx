import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
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
import Compare from "@/pages/Compare";
import ApplicationsTracker from "@/pages/ApplicationsTracker";

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
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="countries" element={<Countries />} />
              <Route path="countries/new" element={<AddEditCountry />} />
              <Route path="countries/:id" element={<CountryDetail />} />
              <Route path="countries/:id/edit" element={<AddEditCountry />} />
              <Route path="cities" element={<Cities />} />
              <Route path="cities/new" element={<AddEditCity />} />
              <Route path="cities/:id" element={<CityDetail />} />
              <Route path="cities/:id/edit" element={<AddEditCity />} />
              <Route path="universities" element={<Universities />} />
              <Route path="universities/new" element={<AddEditUniversity />} />
              <Route path="universities/:id" element={<UniversityDetail />} />
              <Route
                path="universities/:id/edit"
                element={<AddEditUniversity />}
              />
              <Route path="compare" element={<Compare />} />
              <Route path="applications" element={<ApplicationsTracker />} />
            </Route>
          </Routes>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
