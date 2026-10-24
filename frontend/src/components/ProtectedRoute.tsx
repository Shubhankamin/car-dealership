import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Blocks anonymous visitors, and optionally non-admins. */
export default function ProtectedRoute({
  adminOnly = false,
}: {
  adminOnly?: boolean;
}) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
