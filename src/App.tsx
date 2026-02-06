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
import { ShopOwnerSignup } from "./pages/ShopOwnerSignup";
import { ShopDetails } from "./pages/ShopDetails";
import { VehicleDetails } from "./pages/VehicleDetails";
import { Booking } from "./pages/Booking";
import { Bookings } from "./pages/Bookings";
import { BookingDetails } from "./pages/BookingDetails";
import { Profile } from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Admin pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProfile } from "./pages/admin/AdminProfile";
import { UserManagement } from "./pages/admin/UserManagement";
import { OwnerManagement } from "./pages/admin/OwnerManagement";
import { ShopMonitoring } from "./pages/admin/ShopMonitoring";

// Owner pages
import { OwnerDashboard } from "./pages/owner/OwnerDashboard";
import { OwnerProfile } from "./pages/owner/OwnerProfile";
import { ShopManagement } from "./pages/owner/ShopManagement";
import { VehicleManagement } from "./pages/owner/VehicleManagement";
import { StaffManagement } from "./pages/owner/StaffManagement";
import { BookingOverview } from "./pages/owner/BookingOverview";

// Staff pages
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { StaffProfile } from "./pages/staff/StaffProfile";
import { AssignedTasks } from "./pages/staff/AssignedTasks";

// User profile sub-pages
import { EditProfile } from "./pages/user/EditProfile";
import { KYCVerification } from "./pages/user/KYCVerification";
import { SavedLocations } from "./pages/user/SavedLocations";
import { PaymentMethods } from "./pages/user/PaymentMethods";
import { Notifications } from "./pages/user/Notifications";
import { Settings } from "./pages/user/Settings";
import { HelpSupport } from "./pages/user/HelpSupport";
import { PrivacySecurity } from "./pages/user/PrivacySecurity";

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
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/shop-signup" element={<ShopOwnerSignup />} />

              {/* User (Customer) routes */}
              <Route path="/home" element={<Home />} />
              <Route path="/shop/:id" element={<ShopDetails />} />
              <Route path="/vehicle/:id" element={<VehicleDetails />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/booking-details/:id" element={<BookingDetails />} />
              <Route path="/explore" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/profile/kyc" element={<KYCVerification />} />
              <Route path="/saved-locations" element={<SavedLocations />} />
              <Route path="/payment-methods" element={<PaymentMethods />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<HelpSupport />} />
              <Route path="/privacy" element={<PrivacySecurity />} />

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/owners" element={<ProtectedRoute allowedRoles={['admin']}><OwnerManagement /></ProtectedRoute>} />
              <Route path="/admin/shops" element={<ProtectedRoute allowedRoles={['admin']}><ShopMonitoring /></ProtectedRoute>} />

              {/* Owner routes */}
              <Route path="/owner" element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
              <Route path="/owner/profile" element={<ProtectedRoute allowedRoles={['owner']}><OwnerProfile /></ProtectedRoute>} />
              <Route path="/owner/shops" element={<ProtectedRoute allowedRoles={['owner']}><ShopManagement /></ProtectedRoute>} />
              <Route path="/owner/vehicles" element={<ProtectedRoute allowedRoles={['owner']}><VehicleManagement /></ProtectedRoute>} />
              <Route path="/owner/staff" element={<ProtectedRoute allowedRoles={['owner']}><StaffManagement /></ProtectedRoute>} />
              <Route path="/owner/bookings" element={<ProtectedRoute allowedRoles={['owner']}><BookingOverview /></ProtectedRoute>} />

              {/* Staff routes */}
              <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
              <Route path="/staff/profile" element={<ProtectedRoute allowedRoles={['staff']}><StaffProfile /></ProtectedRoute>} />
              <Route path="/staff/tasks" element={<ProtectedRoute allowedRoles={['staff']}><AssignedTasks /></ProtectedRoute>} />

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
