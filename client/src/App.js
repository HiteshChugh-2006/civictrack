import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import CreateIssue from "./pages/CreateIssue";
import Issues from "./pages/Issues";
import MapView from "./pages/MapView";
import About from "./pages/About";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {user?.role === "admin" ? (
              <Navigate to="/admin" />
            ) : user?.role === "worker" ? (
              <Navigate to="/worker" />
            ) : (
              <Dashboard />
            )}
          </ProtectedRoute>
        } />

        <Route path="/create" element={<ProtectedRoute><CreateIssue /></ProtectedRoute>} />
        <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />

        {/* ADMIN */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* WORKER */}
        <Route path="/worker" element={
          <ProtectedRoute role="worker">
            <WorkerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/about" element={<About />} />

      </Routes>
    </Router>
  );
}

export default App;