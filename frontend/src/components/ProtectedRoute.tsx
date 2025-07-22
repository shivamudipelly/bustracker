import type React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import { Loading } from "@/components/Loading"

interface ProtectedRouteProps {
  requiredRole?: "admin" | "driver" | "user"
}

export const ProtectedRoute: React.FC<ProtectedRouteProps & { children?: React.ReactNode }> = ({
  requiredRole,
  children,
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <Loading />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const redirectPath = user.role === "admin" ? "/admin" : user.role === "driver" ? "/driver" : "/track";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children || <Outlet />}</>;
};
