import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import CreateIssue from "./pages/CreateIssue";
import Issues from "./pages/Issues";
import MapView from "./pages/MapView";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateIssue /></ProtectedRoute>} />
        <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />

        {/* ADMIN */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* WORKER */}
        <Route path="/worker" element={<ProtectedRoute role="worker"><WorkerDashboard /></ProtectedRoute>} />

      </Routes>
    </Router>
  );
}

export default App;