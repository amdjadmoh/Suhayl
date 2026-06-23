import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
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
