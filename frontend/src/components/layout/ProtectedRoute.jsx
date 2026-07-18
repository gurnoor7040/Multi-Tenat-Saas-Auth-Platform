import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Used as a layout route in AppRoutes.jsx: any route nested under this
// requires a logged-in user. Waits for the initial session check
// (AuthContext's loadSession) to finish before deciding — otherwise a
// logged-in user would flash to /login on every page refresh while the
// /user/me request is still in flight.
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve where the user was headed so login can send them back after
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}