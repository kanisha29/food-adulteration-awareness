import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ role = "user" }) {
  const { user, admin } = useAuth();
  const location = useLocation();
  const ok = role === "admin" ? admin : user;
  if (!ok) return <Navigate to={role === "admin" ? "/admin/login" : "/login"} state={{ from: location.pathname }} replace />;
  return <Outlet />;
}
