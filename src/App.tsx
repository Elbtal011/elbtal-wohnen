import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Mietangebote from "./pages/Mietangebote";
import PropertyDetails from "./pages/PropertyDetails";
import Vermietungsablauf from "./pages/Vermietungsablauf";
import Leistungsübersicht from "./pages/Leistungsübersicht";
import Contact from "./pages/Contact";
import Unternehmen from "./pages/Unternehmen";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mietangebote" element={<Mietangebote />} />
          <Route path="/immobilie/:id" element={<PropertyDetails />} />
          <Route path="/vermietungsablauf" element={<Vermietungsablauf />} />
          <Route path="/leistungsübersicht" element={<Leistungsübersicht />} />
          <Route path="/kontakt" element={<Contact />} />
          <Route path="/unternehmen" element={<Unternehmen />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/agb" element={<AGB />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
