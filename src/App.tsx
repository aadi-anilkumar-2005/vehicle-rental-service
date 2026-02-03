import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// User (Customer) pages
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ShopDetails } from "./pages/ShopDetails";
import { VehicleDetails } from "./pages/VehicleDetails";
import { Booking } from "./pages/Booking";
import { Bookings } from "./pages/Bookings";
import { BookingDetails } from "./pages/BookingDetails";
import { Profile } from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Role-based dashboards
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { OwnerDashboard } from "./pages/owner/OwnerDashboard";
import { StaffDashboard } from "./pages/staff/StaffDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* User (Customer) routes */}
              <Route path="/" element={<Home />} />
              <Route path="/shop/:id" element={<ShopDetails />} />
              <Route path="/vehicle/:id" element={<VehicleDetails />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/booking-details/:id" element={<BookingDetails />} />
              <Route path="/explore" element={<Home />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Owner routes */}
              <Route
                path="/owner"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Staff routes */}
              <Route
                path="/staff"
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
