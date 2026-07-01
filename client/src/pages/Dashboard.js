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

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#060b18", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "40px", height: "40px", border: "3px solid rgba(59,130,246,0.3)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#475569", fontSize: "14px" }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{ ...styles.main, marginLeft: isOpen ? "240px" : "20px" }}>

        {/* HEADER */}
        <div style={styles.pageHeader}>
          <div>
            <p style={styles.welcome}>👋 Welcome back, <strong style={{ color: "#f0f6ff" }}>{user?.name || "Citizen"}</strong></p>
            <h1 style={styles.heading}>Citizen Dashboard</h1>
          </div>
          <div style={styles.cityHealthBig}>
            <div style={{ fontSize: "11px", color: "#475569", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>City Health Index</div>
            <div style={{ fontSize: "36px", fontWeight: "900", color: cityHealthIndex > 70 ? "#10b981" : cityHealthIndex > 40 ? "#f59e0b" : "#ef4444", fontFamily: "JetBrains Mono, monospace", lineHeight: 1 }}>{cityHealthIndex}%</div>
            <div className="progress-bar-track" style={{ marginTop: "6px", width: "120px" }}>
              <div className="progress-bar-fill" style={{ width: `${cityHealthIndex}%`, background: cityHealthIndex > 70 ? "#10b981" : cityHealthIndex > 40 ? "#f59e0b" : "#ef4444" }} />
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div style={styles.grid}>
          <StatCard title="My Issues" value={stats.myTotal} color="#3b82f6" icon="📁" />
          <StatCard title="Resolved" value={stats.resolved} color="#10b981" icon="✅" />
          <StatCard title="Pending" value={stats.pending} color="#f59e0b" icon="⏳" />
          <StatCard title="City Total" value={stats.total} color="#8b5cf6" icon="🌆" />
        </div>

        {/* QUICK ACTIONS */}
        <div style={styles.actionGrid}>
          <Action title="📍 Report Issue" sub="File a new civic report" onClick={() => navigate("/create")} color="#3b82f6" />
          <Action title="📋 My Issues" sub="View & track your reports" onClick={() => navigate("/issues")} color="#8b5cf6" />
          <Action title="🗺️ City Map" sub="Explore issue heatmap" onClick={() => navigate("/map")} color="#10b981" />
          <Action title="📹 Live Feed" sub="AI CCTV surveillance" onClick={() => navigate("/livefeed")} color="#06b6d4" />
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
const StatCard = ({ title, value, color, icon }) => (
  <div style={{ ...styles.card, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: color }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={styles.cardTitle}>{title}</div>
        <div style={{ ...styles.cardValue, color }}>{value}</div>
      </div>
      <div style={{ fontSize: "24px", opacity: 0.6 }}>{icon}</div>
    </div>
  </div>
);

const Action = ({ title, sub, onClick, color }) => (
  <div onClick={onClick} style={{ ...styles.action, borderTop: `3px solid ${color}20`, position: "relative", overflow: "hidden" }}>
    <div style={{ fontSize: "18px", marginBottom: "4px" }}>{title}</div>
    <div style={{ fontSize: "12px", color: "#475569" }}>{sub}</div>
    <div style={{ position: "absolute", bottom: "12px", right: "14px", fontSize: "18px", color, opacity: 0.5 }}>→</div>
  </div>
);


const styles = {
  wrapper: { display: "flex", background: "#060b18", minHeight: "100vh", color: "#f0f6ff" },
  main: { paddingTop: "84px", padding: "84px 24px 40px", width: "100%", transition: "margin-left 0.3s", boxSizing: "border-box" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "16px" },
  welcome: { color: "#64748b", marginBottom: "4px", fontSize: "15px", margin: "0 0 4px" },
  heading: { fontSize: "30px", fontWeight: "900", color: "#f0f6ff", margin: 0, letterSpacing: "-1px" },
  cityHealthBig: { textAlign: "right" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
  card: {
    background: "rgba(13, 21, 38, 0.9)",
    border: "1px solid rgba(255,255,255,0.07)",
    padding: "22px",
    borderRadius: "14px",
    transition: "all 0.25s",
    backdropFilter: "blur(12px)"
  },
  cardTitle: { color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", margin: 0 },
  cardValue: { fontSize: "30px", fontWeight: "800", fontFamily: "JetBrains Mono, monospace", letterSpacing: "-1px", lineHeight: 1, marginTop: "8px" },
  actionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" },
  action: {
    background: "rgba(13, 21, 38, 0.85)",
    border: "1px solid rgba(255,255,255,0.07)",
    padding: "20px 22px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
    color: "#f0f6ff",
    transition: "all 0.25s",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
  },
  contentSplit: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px", alignItems: "start" },
  chartsContainer: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  chartCard: {
    background: "rgba(13, 21, 38, 0.9)",
    border: "1px solid rgba(255,255,255,0.07)",
    padding: "20px",
    borderRadius: "14px",
    color: "#f0f6ff"
  },
  chartTitle: { fontSize: "14px", margin: "0 0 14px 0", fontWeight: "700", color: "#f0f6ff" },
  newsCard: {
    background: "rgba(13, 21, 38, 0.9)",
    border: "1px solid rgba(255,255,255,0.07)",
    padding: "20px",
    borderRadius: "14px",
    color: "#f0f6ff",
    maxHeight: "350px",
    display: "flex",
    flexDirection: "column"
  },
  newsHeader: { fontSize: "15px", fontWeight: "700", margin: "0 0 14px 0" },
  newsList: { display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", flex: 1 },
  newsItem: { background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "4px" },
  newsMeta: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  newsTitle: { fontWeight: "600", fontSize: "13px", color: "#f0f6ff" },
  newsBadge: { fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "100px", textTransform: "uppercase" },
  newsContent: { fontSize: "12px", color: "#94a3b8", margin: 0, lineHeight: "1.5" },
  newsDate: { fontSize: "10px", color: "#475569", alignSelf: "flex-end" }
};
