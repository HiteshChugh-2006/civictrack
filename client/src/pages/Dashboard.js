import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await api.get("/issues");
      setIssues(res.data || []);
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
    pending: issues.filter(i => i.status !== "resolved").length
  };

  const pieData = [
    { name: "Resolved", value: stats.resolved },
    { name: "Pending", value: stats.pending }
  ];

  const COLORS = ["#22c55e", "#f59e0b"];

  if (loading) return <h2 style={{ padding: 100 }}>Loading...</h2>;

  return (
    <div style={styles.wrapper}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{
        ...styles.main,
        marginLeft: isOpen ? "220px" : "20px"
      }}>
        <h2 style={styles.welcome}>Welcome, {user?.name}</h2>
        <h1>Dashboard</h1>

        {/* STATS */}
        <div style={styles.grid}>
          <Card title="My Issues" value={stats.myTotal} color="#3b82f6" />
          <Card title="Resolved" value={stats.resolved} color="#22c55e" />
          <Card title="Pending" value={stats.pending} color="#f59e0b" />
          <Card title="Total" value={stats.total} color="#6366f1" />
        </div>

        {/* ACTIONS */}
        <div style={styles.grid}>
          <Action title="📍 Report Issue" onClick={() => navigate("/create")} />
          <Action title="📊 My Issues" onClick={() => navigate("/issues")} />
          <Action title="🗺️ Map" onClick={() => navigate("/map")} />
        </div>

        {/* CHARTS */}
        <div style={styles.chartGrid}>
          <div style={styles.chartCard}>
            <h3>Status</h3>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.chartCard}>
            <h3>Stats</h3>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: "Total", value: stats.total },
                { name: "Resolved", value: stats.resolved },
                { name: "Pending", value: stats.pending }
              ]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
}

/* COMPONENTS */
const Card = ({ title, value, color }) => (
  <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
    <h4>{title}</h4>
    <h2>{value}</h2>
  </div>
);

const Action = ({ title, onClick }) => (
  <div onClick={onClick} style={styles.action}>{title}</div>
);

/* STYLES */
const styles = {
  wrapper: { display: "flex", background: "#f1f5f9", minHeight: "100vh" },

  main: { padding: "30px", width: "100%", marginTop: "60px" },

  welcome: { color: "#64748b" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginBottom: "20px"
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
  },

  action: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "center"
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  },

  chartCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px"
  }
};