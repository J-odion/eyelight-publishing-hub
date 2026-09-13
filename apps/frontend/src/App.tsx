import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Popups from "./components/Popups.tsx";

// Public Pages
import Index from "./pages/Index.tsx";
import Book from "./pages/Book.tsx";
import NotFound from "./pages/NotFound.tsx";
import SubmitManuscript from "./pages/SubmitManuscript.tsx";
import BookCatalogue from "./pages/BookCatalogue.tsx";
import EventsPage from "./pages/EventsPage.tsx";
import PressRoom from "./pages/PressRoom.tsx";
import HelpDocumentation from "./pages/HelpDocumentation.tsx";

// Author Portal
import AuthorPortal from "./pages/AuthorPortal.tsx";

// Admin
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminCRM from "./pages/AdminCRM.tsx";
import AuthorProfile from "./pages/AuthorProfile.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Popups />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/book" element={<Book />} />
          <Route path="/submit-manuscript" element={<SubmitManuscript />} />
          <Route path="/catalogue" element={<BookCatalogue />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/press" element={<PressRoom />} />
          <Route path="/help" element={<HelpDocumentation />} />

          {/* Author Portal */}
          <Route path="/portal" element={<AuthorPortal />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/crm" element={<AdminCRM />} />
          <Route path="/admin/authors/:id" element={<AuthorProfile />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
