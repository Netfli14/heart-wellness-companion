import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Analysis from "./pages/Analysis";
import Hospitals from "./pages/Hospitals";
import Auth from "./pages/Auth";
import HealthChart from "./pages/HealthChart";
import MentalChart from "./pages/MentalChart";
import Chat from "./pages/Chat";
import Diary from "./pages/Diary";
import About from "./pages/About";
import Medicine from "./pages/Medicine";
import Feedback from "./pages/Feedback";
import AiDoctor from "./pages/AiDoctor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/hospitals" element={<Hospitals />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/chart" element={<HealthChart />} />
                <Route path="/mental-chart" element={<MentalChart />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/about" element={<About />} />
                <Route path="/medicine" element={<Medicine />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/ai-doctor" element={<AiDoctor />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
