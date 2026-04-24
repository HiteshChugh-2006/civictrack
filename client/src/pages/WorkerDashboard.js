import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import { useEffect, useState } from "react";
import API from "../api"; // ✅ FIXED

export default function WorkerDashboard() {
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
      const res = await API.get("/api/issues/worker"); // ✅ FIXED
      setIssues(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id);

      await API.put(`/api/issues/${id}`, { status }); // ✅ FIXED

      fetchIssues();
    } catch (err) {
      console.error(err);
      alert("Update failed ❌");
    } finally {
      setActionLoading(null);
    }
  };

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

      await API.put(`/api/issues/complete/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Work submitted ✅");
      fetchIssues();

    } catch (err) {
      console.error(err);
      alert("Submission failed ❌");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <h2 style={{ padding: "100px" }}>Loading tasks...</h2>;
  }

  return (
    <div>
      <Navbar setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} role="worker" />

      <div style={{
        marginTop: "60px",
        marginLeft: isOpen ? "220px" : "0",
        padding: "20px",
      }}>
        <h1>👷 Worker Dashboard</h1>

        {issues.length === 0 && <p>No assigned tasks 🚀</p>}

        {issues.map((issue) => (
          <div key={issue._id} style={styles.card}>
            <h3>{issue.title}</h3>
            <p>{issue.description}</p>

            <p style={{ fontSize: "13px", color: "#555" }}>
              👤 Reported by: <b>{issue.createdBy?.name || "Unknown"}</b>
            </p>

            {issue.image && (
              <img
                src={`/uploads/${issue.image}`}
                alt=""
                style={styles.image}
                onClick={() => setPreviewImage(`/uploads/${issue.image}`)}
              />
            )}

            {issue.completionImage && (
              <>
                <p>📸 Completed:</p>
                <img
                  src={`/uploads/${issue.completionImage}`}
                  style={styles.image}
                  onClick={() => setPreviewImage(`/uploads/${issue.completionImage}`)}
                  alt=""
                />
              </>
            )}

            <StatusBadge status={issue.status} />

            <div style={{ marginTop: "10px" }}>

              {/* ▶ START */}
              {issue.status !== "in-progress" && issue.status !== "resolved" && (
                <button
                  style={styles.startBtn}
                  disabled={actionLoading === issue._id}
                  onClick={() => updateStatus(issue._id, "in-progress")}
                >
                  {actionLoading === issue._id ? "Starting..." : "▶ Start Work"}
                </button>
              )}

              {/* 📤 SUBMIT */}
              {issue.status === "in-progress" && (
                <div style={{ marginTop: "10px" }}>
                  <input
                    type="file"
                    onChange={(e) =>
                      setSelectedImage(prev => ({
                        ...prev,
                        [issue._id]: e.target.files[0],
                      }))
                    }
                  />

                  <textarea
                    placeholder="Add remarks..."
                    style={{ width: "100%", marginTop: "5px" }}
                    onChange={(e) =>
                      setRemarks(prev => ({
                        ...prev,
                        [issue._id]: e.target.value,
                      }))
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

              {issue.status === "resolved" && (
                <span style={styles.doneText}>✔ Completed</span>
              )}
            </div>
          </div>
        ))}

        {previewImage && (
          <div style={styles.previewOverlay} onClick={() => setPreviewImage(null)}>
            <img src={previewImage} style={styles.previewImage} alt="" />
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
    resolved: { bg: "#dcfce7", color: "#16a34a" },
    "in-progress": { bg: "#dbeafe", color: "#2563eb" },
    assigned: { bg: "#fef3c7", color: "#d97706" },
    submitted: { bg: "#e5e7eb", color: "#374151" },
  };

  const s = map[status] || map.submitted;

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "5px 10px",
        borderRadius: "20px",
        background: s.bg,
        color: s.color,
        display: "inline-block",
        fontSize: "12px",
      }}
    >
      {status}
    </div>
  );
}


// 🎨 STYLES
const styles = {
  card: {
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(12px)",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
    marginBottom: "20px",
  },

  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "10px",
    marginTop: "10px",
    cursor: "pointer",
  },

  previewOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  previewImage: {
    maxWidth: "90%",
    maxHeight: "90%",
    borderRadius: "10px",
  },

  startBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  doneBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "5px",
  },

  doneText: {
    color: "#16a34a",
    fontWeight: "bold",
  },
};