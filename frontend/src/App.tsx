import type React from "react"
import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore, initAuth } from "@/stores/authStore"
import { Layout } from "@/components/Layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Loading } from "@/components/Loading"



import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


// Auth Pages
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { RegisterPage } from "@/features/auth/pages/RegisterPage"
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage"
import { ResetPasswordPage } from "./features/auth/pages/ResetPassowrd"
import { VerifyEmail } from "@/features/auth/pages/VerifyEmail"
import { ProfilePage } from "@/features/auth/pages/ProfilePage"

// Public Pages
import { LandingPage } from "@/features/public/pages/LandingPage"
import { BusTrackingPage } from "@/features/public/pages/BusTrackingPage"
import { RoutesPage } from "@/features/public/pages/RoutesPage"

// Admin Pages
import { AdminDashboard } from "@/features/admin/pages/AdminDashboard"
import { UserManagement } from "@/features/admin/pages/UserManagement"
import { BusManagement } from "@/features/admin/pages/BusManagement"
import { MapView } from "@/features/admin/pages/MapView"
import { Reports } from "@/features/admin/pages/Reports"

// Driver Pages
import { DriverDashboard } from "@/features/driver/pages/DriverDashboard"
import { DriverTracker } from "@/features/driver/pages/DriverTracker"

// 404 Page
import NotFound from "./pages/NotFound"

function App() {
  const queryClient = new QueryClient();
  const { isAuthenticated, isLoading, initAuth } = useAuthStore()

  useEffect(() => {
    (async () => {
      await initAuth();
    })();
  }, []);



  if (isLoading) {
    return <Loading />
  }

  return (
    <QueryClientProvider client={new QueryClient()}>
      <TooltipProvider>
        <Sonner position="top-right" richColors closeButton />

        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route element={<Layout />}>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/track/:busId" element={<BusTrackingPage />} />
                <Route path="/routes" element={<RoutesPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardRedirect />} />
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute requiredRole="admin" />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/buses" element={<BusManagement />} />
                    <Route path="/admin/map" element={<MapView />} />
                    <Route path="/admin/reports" element={<Reports />} />
                  </Route>
                  {/* Driver Routes */}
                  <Route element={<ProtectedRoute requiredRole="driver" />}>
                    <Route path="/driver" element={<DriverDashboard />} />
                    <Route path="/driver/tracker" element={<DriverTracker />} />
                  </Route>
                </Route>
              </Route>

              {/* Auth Routes */}
              <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmail />} />


              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </TooltipProvider>
    </QueryClientProvider >
  )
}

// Component to redirect to appropriate dashboard based on user role
const DashboardRedirect: React.FC = () => {
  const { user } = useAuthStore()

  if (!user) return <Navigate to="/login" replace />

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" replace />
    case "driver":
      return <Navigate to="/driver" replace />
    default:
      return <Navigate to="/routes" replace />
  }
}

export default App
