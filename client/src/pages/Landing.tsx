import { useNavigate } from "react-router-dom";
import { BookOpen, ClipboardList, GitCompare, Compass, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F172A]">
              <img src="/logo.svg" alt="" className="h-6 w-6 invert" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0F172A]">Suhayl</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")} className="text-slate-600 hover:text-[#0F172A]">
              <LogIn className="mr-1.5 h-4 w-4" /> Sign In
            </Button>
            <Button onClick={() => navigate("/register")} className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white">
              <UserPlus className="mr-1.5 h-4 w-4" /> Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-slate-900 to-slate-800 pt-32 pb-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-[#0EA5E9] blur-3xl" />
          <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-[#0EA5E9] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <img src="/logo.svg" alt="Suhayl" className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your Study Abroad
            <span className="block text-[#0EA5E9]">Journey Starts Here</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Discover universities, track applications, and manage your path to studying abroad — all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/register")} className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-8">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="border-white/30 text-white hover:bg-white/10 px-8">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">Everything you need</h2>
            <p className="mt-3 text-slate-500">Tools designed for students and agencies</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="group rounded-2xl bg-white p-6 shadow-sm border-t-4 border-[#0EA5E9] hover:shadow-md transition-all duration-200">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0EA5E9]/10">
                <BookOpen className="h-6 w-6 text-[#0EA5E9]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A]">Discover Programs</h3>
              <p className="mt-2 text-sm text-slate-500">Browse universities and programs across Europe. Filter by country, degree, tuition, and more.</p>
            </div>
            <div className="group rounded-2xl bg-white p-6 shadow-sm border-t-4 border-emerald-500 hover:shadow-md transition-all duration-200">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <ClipboardList className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A]">Track Applications</h3>
              <p className="mt-2 text-sm text-slate-500">Monitor every application from wishlist to enrollment. Stay on top of deadlines and documents.</p>
            </div>
            <div className="group rounded-2xl bg-white p-6 shadow-sm border-t-4 border-amber-500 hover:shadow-md transition-all duration-200">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Compass className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A]">Agency Management</h3>
              <p className="mt-2 text-sm text-slate-500">Agencies can manage multiple students, track their applications, and guide them to success.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A]">How It Works</h2>
            <p className="mt-3 text-slate-500">Three simple steps to get started</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Create Account", desc: "Sign up as a student or agency in seconds." },
              { step: "02", title: "Explore & Apply", desc: "Browse programs and start tracking applications." },
              { step: "03", title: "Stay Organized", desc: "Monitor progress, deadlines, and requirements." },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <span className="text-5xl font-bold text-[#0EA5E9]/20">{item.step}</span>
                <h3 className="mt-4 text-lg font-semibold text-[#0F172A]">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <img src="/logo.svg" alt="" className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-white">Suhayl</span>
          </div>
          <p className="text-sm text-slate-400">Study Abroad Organizer</p>
        </div>
      </footer>
    </div>
  );
}
