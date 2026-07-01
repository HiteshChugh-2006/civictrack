import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import { useEffect, useState } from "react";
import api from "../api";

export default function WorkerDashboard() {
  const BASE_URL = process.env.REACT_APP_API_URL || (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000" : "");
  const [isOpen, setIsOpen] = useState(true);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState({});
  const [remarks, setRemarks] = useState({});

  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await api.get("/issues/worker");
      setIssues(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ▶ START WORK
  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id);

      await api.put(`/issues/${id}`, { status });

      fetchIssues();
    } catch {
      alert("Update failed ❌");
    } finally {
      setActionLoading(null);
    }
  };

  // 📤 SUBMIT WORK
  const submitWork = async (id) => {
    try {
      if (!selectedImage[id]) {
        alert("Upload image first ❗");
        return;
      }

      setActionLoading(id);

      const formData = new FormData();
      formData.append("image", selectedImage[id]);
      formData.append("remarks", remarks[id] || "");

      await api.put(`/issues/complete/${id}`, formData);

      alert("Work submitted ✅");
      fetchIssues();
    } catch {
      alert("Submission failed ❌");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <h2 style={{ padding: "100px", color: "#ffffff", background: "#0f172a", minHeight: "100vh" }}>Loading tasks...</h2>;
  }

  return (
    <div style={styles.wrapper}>
      <Navbar setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        style={{
          ...styles.main,
          marginLeft: isOpen ? "220px" : "20px",
        }}
      >
        <h1 style={styles.heading}>👷 Worker Dashboard</h1>

        {issues.length === 0 && <p style={styles.noTasks}>No assigned tasks 🚀</p>}

        <div style={styles.issuesList}>
          {issues.map((issue) => (
            <div key={issue._id} style={styles.card}>
              <h3 style={styles.cardTitle}>{issue.title}</h3>
              <p style={styles.desc}>{issue.description}</p>

              <p style={styles.user}>
                👤 Reported by: <b>{issue.createdBy?.name || "Unknown"}</b>
              </p>

              {/* 📸 USER IMAGE */}
              {issue.image && (
                <img
                  src={`${BASE_URL}/uploads/${issue.image}`}
                  alt="issue"
                  style={styles.image}
                  onClick={() =>
                    setPreviewImage(`${BASE_URL}/uploads/${issue.image}`)
                  }
                />
              )}

              {/* 📸 COMPLETION IMAGE */}
              {issue.completionImage && (
                <div style={{ marginTop: "10px" }}>
                  <p style={{ margin: "5px 0", color: "#4ade80", fontSize: "13px", fontWeight: "600" }}>📸 Completed:</p>
                  <img
                    src={`${BASE_URL}/uploads/${issue.completionImage}`}
                    alt="completed"
                    style={styles.image}
                    onClick={() =>
                      setPreviewImage(`${BASE_URL}/uploads/${issue.completionImage}`)
                    }
                  />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                <StatusBadge status={issue.status} />

                {/* ✅ DONE badge or status info */}
                {issue.status === "resolved" && (
                  <span style={styles.doneText}>✔ Completed</span>
                )}
              </div>

              <div style={{ marginTop: "15px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px" }}>

                {/* ▶ START */}
                {(issue.status === "assigned" ||
                  issue.status === "submitted") && (
                  <button
                    style={styles.startBtn}
                    disabled={actionLoading === issue._id}
                    onClick={() =>
                      updateStatus(issue._id, "in-progress")
                    }
                  >
                    {actionLoading === issue._id
                      ? "Starting..."
                      : "▶ Start Work"}
                  </button>
                )}

                {/* 📤 SUBMIT */}
                {issue.status === "in-progress" && (
                  <div>
                    <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#94a3b8" }}>Upload resolution photo:</p>
                    <input
                      type="file"
                      style={styles.fileInput}
                      onChange={(e) =>
                        setSelectedImage({
                          ...selectedImage,
                          [issue._id]: e.target.files[0],
                        })
                      }
                    />

                    <textarea
                      placeholder="Add resolution remarks..."
                      style={styles.textarea}
                      onChange={(e) =>
                        setRemarks({
                          ...remarks,
                          [issue._id]: e.target.value,
                        })
                      }
                    />

                    <button
                      style={styles.doneBtn}
                      disabled={actionLoading === issue._id}
                      onClick={() => submitWork(issue._id)}
                    >
                      {actionLoading === issue._id
                        ? "Submitting..."
                        : "📤 Submit Work"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 🔍 IMAGE PREVIEW */}
        {previewImage && (
          <div
            style={styles.previewOverlay}
            onClick={() => setPreviewImage(null)}
          >
            <img
              src={previewImage}
              style={styles.previewImage}
              alt="preview"
            />
          </div>
        )}
      </div>

      <Chatbot />
    </div>
  );
}

// 🔹 STATUS BADGE
function StatusBadge({ status }) {
  const map = {
    resolved: { bg: "rgba(34, 197, 94, 0.15)", color: "#4ade80" },
    "in-progress": { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" },
    assigned: { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" },
    submitted: { bg: "rgba(148, 163, 184, 0.15)", color: "#cbd5e1" },
  };

  const s = map[status] || map.submitted;

  return (
    <div
      style={{
        padding: "5px 12px",
        borderRadius: "20px",
        background: s.bg,
        color: s.color,
        display: "inline-block",
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase"
      }}
    >
      {status}
    </div>
  );
}

// 🎨 STYLES
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
    marginBottom: "20px",
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700"
  },

  noTasks: {
    color: "#94a3b8",
    fontSize: "16px",
    marginTop: "20px"
  },

  issuesList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    marginTop: "20px",
    maxWidth: "1200px"
  },

  card: {
    background: "rgba(30, 41, 59, 0.45)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    color: "#ffffff"
  },

  desc: {
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "10px 0"
  },

  user: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "5px 0"
  },

  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    marginTop: "10px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    cursor: "pointer"
  },

  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "8px",
    minHeight: "70px",
    background: "rgba(15, 23, 42, 0.6)",
    color: "white",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "13px"
  },

  fileInput: {
    width: "100%",
    padding: "8px",
    background: "rgba(15, 23, 42, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "8px",
    color: "#cbd5e1",
    marginBottom: "10px",
    cursor: "pointer",
    fontSize: "12px",
    boxSizing: "border-box"
  },

  startBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    width: "100%",
    fontSize: "14px",
    transition: "all 0.2s"
  },

  doneBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "10px",
    width: "100%",
    fontSize: "14px",
    transition: "all 0.2s"
  },

  doneText: {
    color: "#22c55e",
    fontWeight: "600",
    fontSize: "13px"
  },

  previewOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },

  previewImage: {
    maxWidth: "90%",
    maxHeight: "90%",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
    border: "1px solid rgba(255, 255, 255, 0.15)"
  }
};
