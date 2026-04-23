import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

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

    // 🔄 AUTO REFRESH (REAL-TIME FEEL)
    const interval = setInterval(fetchIssues, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/issues", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setIssues(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const myIssues = issues.filter(i => i.createdBy?._id === user?._id);

  const stats = {
    myTotal: myIssues.length,
    myResolved: myIssues.filter(i => i.status === "resolved").length,
    myPending: myIssues.filter(i => i.status !== "resolved").length,
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

  if (loading) {
    return <h2 style={{ padding: "100px" }}>Loading Dashboard...</h2>;
  }

  return (
    <div style={styles.layout}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} role="user" />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{
        ...styles.content,
        marginLeft: isOpen ? "220px" : "0"
      }}>

        <h2 style={styles.welcome}>Welcome, {user?.name} 👋</h2>
        <h1 style={styles.heading}>Dashboard</h1>

        {/* 🔥 STATS */}
        <div style={styles.statsGrid}>
          <StatCard title="My Issues" value={stats.myTotal} color="#3b82f6" />
          <StatCard title="Resolved" value={stats.resolved} color="#22c55e" />
          <StatCard title="Pending" value={stats.pending} color="#f59e0b" />
          <StatCard title="Total Issues" value={stats.total} color="#6366f1" />
        </div>

        {/* 🔥 ACTION CARDS */}
        <div style={styles.grid}>
          <ActionCard title="📍 Report Issue" onClick={() => navigate("/create")} />
          <ActionCard title="📊 My Issues" onClick={() => navigate("/issues")} />
          <ActionCard title="🗺️ Map View" onClick={() => navigate("/map")} />
        </div>

        {/* 🔥 CHARTS */}
        <div style={styles.charts}>
          <div style={styles.chartBox}>
            <h3>Status Distribution</h3>

            {stats.total === 0 ? (
              <p>No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value">
                    <Cell fill="#22c55e" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={styles.chartBox}>
            <h3>Issue Stats</h3>

            {stats.total === 0 ? (
              <p>No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
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
function StatCard({ title, value, color }) {
  return (
    <div
      style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}
      onMouseEnter={(e) => {
       e.currentTarget.style.transform = "translateY(-6px)";
  e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
       e.currentTarget.style.transform = "translateY(-6px)";
  e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.2)";
      }}
    >
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}

function ActionCard({ title, onClick }) {
  return (
    <div
      style={styles.card}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <h3>{title}</h3>
    </div>
  );
}


// 🎨 STYLES
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "#f1f5f9"
  },

  content: {
    marginTop: "60px",
    padding: "30px",
    width: "100%",
    transition: "0.3s"
  },

  welcome: {
    color: "#64748b"
  },

  heading: {
    marginBottom: "20px"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginBottom: "25px"
  },

  statCard: {
    background: "white",
    padding: "18px",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
    transition: "0.3s"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "25px"
  },

  card: {
  background: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "14px",
  padding: "22px",
  cursor: "pointer",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  transition: "0.3s"
},

  charts: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px"
  },

  chartBox: {
    background: "white",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)"
  }
};