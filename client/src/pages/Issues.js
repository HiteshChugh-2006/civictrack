import { useEffect, useState, useCallback } from "react";
import API from "../api";

export default function Issues() {
  const BASE_URL = process.env.REACT_APP_API_URL || "";
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState("my"); // "my" or "city"
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchIssues = useCallback(async () => {
    try {
      const endpoint = activeTab === "my" ? "/issues" : "/issues/all";
      const res = await API.get(endpoint);
      setIssues(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Fetch when tab changes
  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 5000); // auto-refresh
    return () => clearInterval(interval);
  }, [fetchIssues]);

  // Handle vote toggle
  const handleVote = async (issueId) => {
    try {
      const res = await API.put(`/issues/vote/${issueId}`);
      // Update local issues state immediately
      setIssues(prev =>
        prev.map(item => (item._id === issueId ? res.data : item))
      );
    } catch (err) {
      console.error("Voting failed:", err);
      alert("Error processing vote.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Civic Issues Feed</h2>

      {/* TABS */}
      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tabBtn,
            background: activeTab === "my" ? "#2563eb" : "transparent",
            color: activeTab === "my" ? "white" : "#94a3b8",
            border: activeTab === "my" ? "1px solid #2563eb" : "1px solid #475569"
          }}
          onClick={() => {
            setLoading(true);
            setActiveTab("my");
          }}
        >
          📁 My Issues
        </button>

        <button
          style={{
            ...styles.tabBtn,
            background: activeTab === "city" ? "#2563eb" : "transparent",
            color: activeTab === "city" ? "white" : "#94a3b8",
            border: activeTab === "city" ? "1px solid #2563eb" : "1px solid #475569"
          }}
          onClick={() => {
            setLoading(true);
            setActiveTab("city");
          }}
        >
          🌎 Browse City Issues
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#94a3b8" }}>Loading issues...</p>
      ) : issues.length === 0 ? (
        <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "20px" }}>
          No issues found in this tab.
        </p>
      ) : (
        <div style={styles.issuesList}>
          {issues.map(issue => {
            const hasVoted = Array.isArray(issue.votes) && issue.votes.includes(user._id);
            const voteCount = Array.isArray(issue.votes) ? issue.votes.length : 0;

            return (
              <div key={issue._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{issue.title}</h3>
                  <span style={{
                    ...styles.statusBadge,
                    background: issue.status === "resolved" ? "#22c55e" : issue.status === "in-progress" ? "#3b82f6" : "#f59e0b"
                  }}>
                    {issue.status}
                  </span>
                </div>

                <p style={styles.desc}>{issue.description}</p>
                <p style={styles.meta}>👤 Reported by: <b>{issue.createdBy?.name || "Anonymous"}</b></p>
                
                {issue.assignedTo?.name && (
                  <p style={styles.meta}>👷 Assigned to: <b>{issue.assignedTo.name}</b></p>
                )}

                {/* 🖼 ORIGINAL IMAGE */}
                {issue.image && (
                  <img
                    src={`${BASE_URL}/uploads/${issue.image}`}
                    style={styles.img}
                    alt="Issue Detail"
                  />
                )}

                {/* 📸 COMPLETION IMAGE */}
                {issue.completionImage && (
                  <div style={styles.completionContainer}>
                    <p style={styles.completionText}>📸 Resolution Details:</p>
                    <img
                      src={`${BASE_URL}/uploads/${issue.completionImage}`}
                      style={styles.img}
                      alt="Resolution Progress"
                    />
                    {issue.remarks && (
                      <p style={styles.remarks}><b>Remarks:</b> {issue.remarks}</p>
                    )}
                  </div>
                )}

                {/* VOTING FOOTER */}
                <div style={styles.footer}>
                  <span style={styles.voteCount}>🗳️ {voteCount} upvotes</span>
                  {activeTab === "city" && (
                    <button
                      onClick={() => handleVote(issue._id)}
                      style={{
                        ...styles.voteBtn,
                        background: hasVoted ? "#16a34a" : "#3b82f6",
                        boxShadow: hasVoted ? "0 4px 10px rgba(22, 163, 74, 0.3)" : "0 4px 10px rgba(59, 130, 246, 0.3)"
                      }}
                    >
                      {hasVoted ? "Voted 👍" : "Upvote 🗳️"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    background: "#0f172a",
    minHeight: "100vh",
    color: "#f8fafc"
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "20px",
    textAlign: "center"
  },
  tabContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "30px"
  },
  tabBtn: {
    padding: "12px 24px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.2s ease"
  },
  issuesList: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  card: {
    background: "rgba(30, 41, 59, 0.5)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.25)"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px"
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#ffffff"
  },
  statusBadge: {
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    color: "white",
    textTransform: "uppercase"
  },
  desc: {
    color: "#cbd5e1",
    fontSize: "15px",
    lineHeight: "1.5",
    marginBottom: "16px"
  },
  meta: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "4px 0"
  },
  img: {
    width: "100%",
    maxHeight: "350px",
    objectFit: "cover",
    marginTop: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)"
  },
  completionContainer: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px dashed rgba(255,255,255,0.15)"
  },
  completionText: {
    margin: 0,
    fontSize: "14px",
    color: "#4ade80",
    fontWeight: "600"
  },
  remarks: {
    fontSize: "14px",
    color: "#cbd5e1",
    marginTop: "8px"
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255,255,255,0.08)"
  },
  voteCount: {
    fontSize: "14px",
    color: "#94a3b8",
    fontWeight: "500"
  },
  voteBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s ease"
  }
};
