import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/" replace />;

  // ✅ Correct role redirect
  if (role && user?.role !== role) {
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return children;
}