import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import api from "../api";

export default function Leaderboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("citizens"); // "citizens" or "workers"

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await api.get("/issues/all");
      setIssues(res.data || []);
    } catch (err) {
      console.error("Leaderboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 👥 Citizen leaderboard calculations
  const citizenMap = {};
  issues.forEach(issue => {
    if (issue.createdBy && issue.createdBy._id) {
      const cid = issue.createdBy._id;
      if (!citizenMap[cid]) {
        citizenMap[cid] = {
          name: issue.createdBy.name,
          email: issue.createdBy.email,
          reportsCount: 0,
          upvotesCount: 0
        };
      }
      citizenMap[cid].reportsCount += 1;
      if (Array.isArray(issue.votes)) {
        citizenMap[cid].upvotesCount += issue.votes.length;
      }
    }
  });
  const citizenLeaderboard = Object.values(citizenMap)
    .sort((a, b) => b.upvotesCount - a.upvotesCount || b.reportsCount - a.reportsCount);

  // 👷 Worker leaderboard calculations
  const workerMap = {};
  issues.forEach(issue => {
    if (issue.assignedTo && issue.assignedTo._id) {
      const wid = issue.assignedTo._id;
      if (!workerMap[wid]) {
        workerMap[wid] = {
          name: issue.assignedTo.name,
          email: issue.assignedTo.email,
          resolvedCount: 0,
          assignedCount: 0
        };
      }
      workerMap[wid].assignedCount += 1;
      if (issue.status === "resolved") {
        workerMap[wid].resolvedCount += 1;
      }
    }
  });
  const workerLeaderboard = Object.values(workerMap)
    .sort((a, b) => b.resolvedCount - a.resolvedCount);

  return (
    <div style={styles.wrapper}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{
        ...styles.main,
        marginLeft: isOpen ? "220px" : "20px"
      }}>
        <h1 style={styles.heading}>🏆 City Leaderboard</h1>
        <p style={styles.subtitle}>Recognizing citizens reporting issues and workers resolving them.</p>

        {/* SUBTABS */}
        <div style={styles.tabContainer}>
          <button
            style={{
              ...styles.tabBtn,
              background: activeSubTab === "citizens" ? "#3b82f6" : "transparent",
              color: activeSubTab === "citizens" ? "white" : "#94a3b8",
              border: activeSubTab === "citizens" ? "1px solid #3b82f6" : "1px solid #475569"
            }}
            onClick={() => setActiveSubTab("citizens")}
          >
            👥 Top Citizens
          </button>
          <button
            style={{
              ...styles.tabBtn,
              background: activeSubTab === "workers" ? "#3b82f6" : "transparent",
              color: activeSubTab === "workers" ? "white" : "#94a3b8",
              border: activeSubTab === "workers" ? "1px solid #3b82f6" : "1px solid #475569"
            }}
            onClick={() => setActiveSubTab("workers")}
          >
            👷 Top Workers
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#94a3b8" }}>Loading rankings...</p>
        ) : (
          <div style={styles.boardCard}>
            {activeSubTab === "citizens" ? (
              <div>
                <h3 style={styles.boardTitle}>Citizens Standings</h3>
                {citizenLeaderboard.length === 0 ? (
                  <p style={{ color: "#94a3b8" }}>No active citizens recorded yet.</p>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Rank</th>
                          <th style={styles.th}>Name</th>
                          <th style={styles.th}>Reports Filed</th>
                          <th style={styles.th}>Upvotes Gained</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citizenLeaderboard.map((item, index) => (
                          <tr key={index} style={styles.tr}>
                            <td style={styles.tdRank}>{getRankBadge(index + 1)}</td>
                            <td style={styles.tdName}>
                              <div>
                                <b style={{ color: "#ffffff" }}>{item.name}</b>
                                <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>{item.email}</span>
                              </div>
                            </td>
                            <td style={styles.td}>{item.reportsCount}</td>
                            <td style={styles.tdUpvote}>🗳️ {item.upvotesCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 style={styles.boardTitle}>Workers Standings</h3>
                {workerLeaderboard.length === 0 ? (
                  <p style={{ color: "#94a3b8" }}>No worker activity recorded yet.</p>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Rank</th>
                          <th style={styles.th}>Name</th>
                          <th style={styles.th}>Assigned Tasks</th>
                          <th style={styles.th}>Tasks Resolved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workerLeaderboard.map((item, index) => (
                          <tr key={index} style={styles.tr}>
                            <td style={styles.tdRank}>{getRankBadge(index + 1)}</td>
                            <td style={styles.tdName}>
                              <div>
                                <b style={{ color: "#ffffff" }}>{item.name}</b>
                                <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>{item.email}</span>
                              </div>
                            </td>
                            <td style={styles.td}>{item.assignedCount}</td>
                            <td style={styles.tdResolved}>✔️ {item.resolvedCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <Chatbot />
    </div>
  );
}

function getRankBadge(rank) {
  if (rank === 1) return <span style={{ fontSize: "18px" }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: "18px" }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: "18px" }}>🥉</span>;
  return <span style={{ color: "#94a3b8", fontWeight: "bold" }}>#{rank}</span>;
}

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

  heading: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "5px"
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    marginBottom: "25px"
  },

  tabContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "25px"
  },

  tabBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s"
  },

  boardCard: {
    background: "rgba(30, 41, 59, 0.45)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "25px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    maxWidth: "800px"
  },

  boardTitle: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 20px 0"
  },

  tableWrapper: {
    overflowX: "auto"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left"
  },

  th: {
    color: "#94a3b8",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "12px 10px",
    fontSize: "14px",
    fontWeight: "500"
  },

  tr: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
  },

  td: {
    padding: "14px 10px",
    color: "#cbd5e1",
    fontSize: "14px"
  },

  tdRank: {
    padding: "14px 10px",
    textAlign: "center",
    width: "60px"
  },

  tdName: {
    padding: "14px 10px",
    fontSize: "14px"
  },

  tdUpvote: {
    padding: "14px 10px",
    color: "#f59e0b",
    fontWeight: "600",
    fontSize: "14px"
  },

  tdResolved: {
    padding: "14px 10px",
    color: "#22c55e",
    fontWeight: "600",
    fontSize: "14px"
  }
};
