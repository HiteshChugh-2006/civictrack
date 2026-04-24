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

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchIssues();

    // 🔄 Auto refresh
    const interval = setInterval(fetchIssues, 5000);
    return () => clearInterval(interval);
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
    { name: "Resolved", value: stats.resolved || 0 },
    { name: "Pending", value: stats.pending || 0 }
  ];

  const barData = [
    { name: "Total", value: stats.total },
    { name: "Resolved", value: stats.resolved },
    { name: "Pending", value: stats.pending }
  ];

  const COLORS = ["#22c55e", "#f59e0b"];

  if (loading) {
    return <h2 style={{ padding: "100px" }}>Loading Dashboard...</h2>;
  }

  return (
    <div style={styles.wrapper}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div
        style={{
          ...styles.main,
          marginLeft: isOpen ? "220px" : "20px"
        }}
      >
        <h2 style={styles.welcome}>Welcome, {user?.name} 👋</h2>
        <h1 style={styles.heading}>Dashboard</h1>

        {/* STATS */}
        <div style={styles.grid}>
          <Card title="My Issues" value={stats.myTotal} color="#3b82f6" />
          <Card title="Resolved" value={stats.resolved} color="#22c55e" />
          <Card title="Pending" value={stats.pending} color="#f59e0b" />
          <Card title="Total Issues" value={stats.total} color="#6366f1" />
        </div>

        {/* ACTIONS */}
        <div style={styles.grid}>
          <Action title="📍 Report Issue" onClick={() => navigate("/create")} />
          <Action title="📊 My Issues" onClick={() => navigate("/issues")} />
          <Action title="🗺️ Map View" onClick={() => navigate("/map")} />
        </div>

        {/* CHARTS */}
        <div style={styles.chartGrid}>
          {/* PIE */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Status Distribution</h3>

            {stats.total === 0 ? (
              <p>No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    outerRadius={90}
                    innerRadius={40}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* BAR */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Issue Stats</h3>

            {stats.total === 0 ? (
              <p>No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
}


// 🔹 COMPONENTS

const Card = ({ title, value, color }) => (
  <div
    style={{
      ...styles.card,
      borderTop: `5px solid ${color}`
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-6px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    <h4 style={styles.cardTitle}>{title}</h4>
    <h2>{value}</h2>
  </div>
);

const Action = ({ title, onClick }) => (
  <div
    onClick={onClick}
    style={styles.action}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-6px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    {title}
  </div>
);


// 🎨 STYLES

const styles = {
  wrapper: {
    display: "flex",
    background: "#f1f5f9",
    minHeight: "100vh",
    overflowX: "hidden"
  },

  main: {
    padding: "30px",
    width: "100%",
    marginTop: "60px"
  },

  welcome: {
    color: "#64748b",
    marginBottom: "5px"
  },

  heading: {
    marginBottom: "20px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "20px",
    marginBottom: "25px"
  },

  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    transition: "0.3s"
  },

  cardTitle: {
    color: "#6b7280"
  },

  action: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    textAlign: "center",
    fontWeight: "500",
    transition: "0.3s"
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },

  chartCard: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    width: "100%",
    minWidth: 0
  },

  chartTitle: {
    marginBottom: "10px"
  }
};