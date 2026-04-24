import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api"; // ✅ FIXED

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchIssues();

    const interval = setInterval(fetchIssues, 5000); // ✅ LIVE UPDATE
    return () => clearInterval(interval);
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await API.get("/api/issues"); // ✅ FIXED
      setIssues(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const myIssues = issues.filter(
    (i) => String(i.createdBy?._id) === String(user?._id)
  );

  const stats = {
    myTotal: myIssues.length,
    total: issues.length,
    resolved: issues.filter(i => i.status === "resolved").length,
    pending: issues.filter(i =>
      ["submitted", "assigned", "in-progress"].includes(i.status)
    ).length
  };

  if (loading) return <h2 style={{ padding: "100px" }}>Loading...</h2>;

  return (
    <div style={{ display: "flex", background: "#f1f5f9", minHeight: "100vh" }}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{ marginLeft: isOpen ? "220px" : "0", padding: "30px", width: "100%" }}>
        <h2>Welcome, {user?.name} 👋</h2>
        <h1>Dashboard</h1>

        {/* STATS */}
        <div style={grid}>
          <Card title="My Issues" value={stats.myTotal} />
          <Card title="Resolved" value={stats.resolved} />
          <Card title="Pending" value={stats.pending} />
          <Card title="Total Issues" value={stats.total} />
        </div>

        {/* ACTIONS */}
        <div style={grid}>
          <Action title="📍 Report Issue" onClick={() => navigate("/create")} />
          <Action title="📊 My Issues" onClick={() => navigate("/issues")} />
          <Action title="🗺️ Map View" onClick={() => navigate("/map")} />
        </div>

        {/* CHART */}
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={[
            { name: "Total", value: stats.total },
            { name: "Resolved", value: stats.resolved },
            { name: "Pending", value: stats.pending }
          ]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>

      </div>

      <Chatbot />
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: "15px",
  marginBottom: "20px"
};

const Card = ({ title, value }) => (
  <div style={{
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
  }}>
    <h4>{title}</h4>
    <h2>{value}</h2>
  </div>
);

const Action = ({ title, onClick }) => (
  <div onClick={onClick} style={{
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    cursor: "pointer"
  }}>
    {title}
  </div>
);