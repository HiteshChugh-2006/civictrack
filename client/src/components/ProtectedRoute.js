import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) return <Navigate to="/" replace />;

  // ✅ FIXED ROLE REDIRECT
  if (role && user?.role !== role) {
    if (user?.role === "admin") return <Navigate to="/admin" replace />;
    if (user?.role === "worker") return <Navigate to="/worker" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}