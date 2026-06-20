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
  const [news, setNews] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchIssues();
    fetchNews();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await api.get("/issues/all");
      setIssues(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await api.get("/news");
      setNews(res.data || []);
    } catch (err) {
      console.log("Could not load news:", err);
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

  const cityHealthIndex = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 100;

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

  if (loading) return <h2 style={{ padding: 100, color: "#ffffff", background: "#0f172a", minHeight: "100vh" }}>Loading...</h2>;

  return (
    <div style={styles.wrapper}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{
        ...styles.main,
        marginLeft: isOpen ? "220px" : "20px"
      }}>
        <h2 style={styles.welcome}>
          Welcome, {user?.name || "User"} 👋
        </h2>

        <h1 style={styles.heading}>Citizen Dashboard</h1>

        {/* STATS */}
        <div style={styles.grid}>
          <Card title="My Issues" value={stats.myTotal} color="#3b82f6" />
          <Card title="Resolved" value={stats.resolved} color="#22c55e" />
          <Card title="Pending" value={stats.pending} color="#f59e0b" />
          <Card title="Total Issues" value={stats.total} color="#6366f1" />
          <Card 
            title="City Health Index" 
            value={`${cityHealthIndex}%`} 
            color="#10b981" 
            sub="Resolved ratio"
            glow={true}
          />
        </div>

        {/* ACTIONS */}
        <div style={styles.actionGrid}>
          <Action title="📍 Report Issue" onClick={() => navigate("/create")} />
          <Action title="📊 My Issues" onClick={() => navigate("/issues")} />
          <Action title="🗺️ Map View" onClick={() => navigate("/map")} />
        </div>

        {/* ANNOUNCEMENTS & CHARTS SPLIT */}
        <div style={styles.contentSplit}>
          {/* CHARTS CONTAINER */}
          <div style={styles.chartsContainer}>
            {/* PIE */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Status Distribution</h3>
              {stats.total === 0 ? (
                <p style={{ color: "#94a3b8" }}>No data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" outerRadius={70}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }} />
                    <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* BAR */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Issue Stats</h3>
              {stats.total === 0 ? (
                <p style={{ color: "#94a3b8" }}>No data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* NEWS bulletins */}
          <div style={styles.newsCard}>
            <h3 style={styles.newsHeader}>📢 City Announcements</h3>
            {news.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>No recent official announcements.</p>
            ) : (
              <div style={styles.newsList}>
                {news.map((item, i) => (
                  <div key={i} style={{
                    ...styles.newsItem,
                    borderLeft: item.type === "alert" ? "3px solid #ef4444" : item.type === "update" ? "3px solid #22c55e" : "3px solid #3b82f6"
                  }}>
                    <div style={styles.newsMeta}>
                      <span style={styles.newsTitle}>{item.title}</span>
                      <span style={{
                        ...styles.newsBadge,
                        color: item.type === "alert" ? "#ef4444" : item.type === "update" ? "#22c55e" : "#3b82f6",
                        background: item.type === "alert" ? "rgba(239,68,68,0.1)" : item.type === "update" ? "rgba(34,197,94,0.1)" : "rgba(59,130,246,0.1)"
                      }}>{item.type}</span>
                    </div>
                    <p style={styles.newsContent}>{item.content}</p>
                    <span style={styles.newsDate}>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
}


/* COMPONENTS */
const Card = ({ title, value, color, sub, glow }) => (
  <div style={{ 
    ...styles.card, 
    borderTop: `4px solid ${color}`,
    boxShadow: glow ? `0 0 15px rgba(16, 185, 129, 0.2), 0 8px 32px 0 rgba(0, 0, 0, 0.3)` : styles.card.boxShadow
  }}>
    <h4 style={styles.cardTitle}>{title}</h4>
    <h2 style={{ fontSize: "28px", margin: "5px 0 0 0", color: "#ffffff", fontWeight: "700" }}>{value}</h2>
    {sub && <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginTop: "2px" }}>{sub}</span>}
  </div>
);

const Action = ({ title, onClick }) => (
  <div onClick={onClick} style={styles.action}>
    {title}
  </div>
);


const styles = {
  wrapper: {
    display: "flex",
    background: "#0f172a",
    minHeight: "100vh",
    color: "#f8fafc"
  },

  main: {
    padding: "30px",
    width: "100%",
    marginTop: "60px",
    transition: "0.3s",
    boxSizing: "border-box"
  },

  welcome: {
    color: "#94a3b8",
    marginBottom: "5px",
    fontSize: "16px"
  },

  heading: {
    marginBottom: "20px",
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    marginBottom: "25px"
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px"
  },

  card: {
    background: "rgba(30, 41, 59, 0.45)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)"
  },

  cardTitle: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "500",
    margin: 0
  },

  action: {
    background: "rgba(30, 41, 59, 0.45)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "20px",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "center",
    fontWeight: "600",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
    color: "#ffffff",
    transition: "all 0.2s ease",
    fontSize: "15px"
  },

  contentSplit: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "20px",
    alignItems: "start"
  },

  chartsContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  },

  chartCard: {
    background: "rgba(30, 41, 59, 0.45)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
    color: "#ffffff"
  },

  chartTitle: {
    fontSize: "15px",
    margin: "0 0 15px 0",
    fontWeight: "600",
    color: "#ffffff"
  },

  newsCard: {
    background: "rgba(30, 41, 59, 0.45)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
    color: "#ffffff",
    maxHeight: "330px",
    display: "flex",
    flexDirection: "column"
  },

  newsHeader: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 15px 0"
  },

  newsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflowY: "auto",
    flex: 1,
    paddingRight: "5px"
  },

  newsItem: {
    background: "rgba(15, 23, 42, 0.3)",
    padding: "10px 12px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },

  newsMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  newsTitle: {
    fontWeight: "600",
    fontSize: "13px",
    color: "#ffffff"
  },

  newsBadge: {
    fontSize: "10px",
    fontWeight: "bold",
    padding: "2px 6px",
    borderRadius: "4px",
    textTransform: "uppercase"
  },

  newsContent: {
    fontSize: "12px",
    color: "#cbd5e1",
    margin: 0,
    lineHeight: "1.4"
  },

  newsDate: {
    fontSize: "10px",
    color: "#64748b",
    alignSelf: "flex-end"
  }
};
