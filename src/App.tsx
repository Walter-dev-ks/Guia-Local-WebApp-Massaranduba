import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/AdminLayout";
import Index from "./pages/Index";
import BusinessPage from "./pages/BusinessPage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import FavoritesPage from "./pages/FavoritesPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBusinesses from "./pages/admin/AdminBusinesses";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminFeed from "./pages/admin/AdminFeed";
import AdminCRM from "./pages/admin/AdminCRM";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminUsers from "./pages/admin/AdminUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/empresa/:businessId" element={<BusinessPage />} />
            <Route path="/categoria/:categoryId" element={<CategoryPage />} />
            <Route path="/categoria/:categoryId/:subcategoryId" element={<CategoryPage />} />
            <Route path="/busca" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/favoritos" element={<FavoritesPage />} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="empresas" element={<AdminBusinesses />} />
              <Route path="categorias" element={<AdminCategories />} />
              <Route path="feed" element={<AdminFeed />} />
              <Route path="crm" element={<AdminCRM />} />
              <Route path="moderacao" element={<AdminModeration />} />
              <Route path="usuarios" element={<AdminUsers />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
