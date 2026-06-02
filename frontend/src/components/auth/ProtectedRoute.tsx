import { type ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

type Props = { 
  children: ReactElement;
  requiredRole?: "admin" | "superadmin";
};

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const token = useAuthStore((s: any) => s.token);
  const user = useAuthStore((s: any) => s.user);
  const location = useLocation();

  if (!token) {
    return <Navigate to={`/auth?mode=login`} replace state={{ from: location }} />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== "superadmin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
