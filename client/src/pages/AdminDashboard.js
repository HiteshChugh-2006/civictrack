import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import { useEffect, useState } from "react";
import API from "../api"; // ✅ FIXED

export default function AdminDashboard() {
  const BASE_URL = process.env.REACT_APP_API_URL || "";
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [issuesRes, workersRes] = await Promise.all([
        API.get("/issues"),
        API.get("/users/workers"),
      ]);

      setIssues(issuesRes.data || []);
      setWorkers(workersRes.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load data ❌");
    } finally {
      setLoading(false);
    }
  };

  // 👷 ASSIGN WORKER
  const assignWorker = async (id, workerId) => {
    if (!workerId) return;

    try {
      setActionLoading(id);

      await API.put(`/issues/assign/${id}`, { workerId });

      fetchData();
    } catch {
      alert("Assign failed ❌");
    } finally {
      setActionLoading(null);
    }
  };

  // 🔄 UPDATE STATUS
  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id);

      await API.put(`/issues/${id}`, { status });

      fetchData();
    } catch {
      alert("Update failed ❌");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredIssues = issues
    .filter((i) => filter === "all" || i.status === filter)
    .filter((i) =>
      (i.title || "").toLowerCase().includes(search.toLowerCase())
    );

  if (loading) return <h2 style={{ padding: 100, color: "#ffffff", background: "#0f172a", minHeight: "100vh" }}>Loading...</h2>;

  return (
    <div style={styles.wrapper}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div
        style={{
          ...styles.main,
          marginLeft: isOpen ? "220px" : "20px",
        }}
      >
        <h1 style={styles.heading}>🧑‍💼 Admin Dashboard</h1>

        {/* 🔍 FILTER */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "25px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            placeholder="Search issues..."
            value={search}
            className="glass-input"
            style={{ maxWidth: "300px", margin: 0 }}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filter}
            className="glass-input"
            style={{ maxWidth: "200px", margin: 0, cursor: "pointer" }}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option style={styles.selectOption} value="all">All Statuses</option>
            <option style={styles.selectOption} value="submitted">Submitted</option>
            <option style={styles.selectOption} value="assigned">Assigned</option>
            <option style={styles.selectOption} value="in-progress">In Progress</option>
            <option style={styles.selectOption} value="resolved">Resolved</option>
          </select>
        </div>

        {/* 📋 ISSUES */}
        <div style={styles.issuesList}>
          {filteredIssues.map((issue) => (
            <div key={issue._id} style={styles.card}>
              <div>
                <h3 style={styles.cardTitle}>{issue.title}</h3>
                <p style={styles.desc}>{issue.description}</p>

                <p style={styles.meta}>👤 Reported by: <b>{issue.createdBy?.name || "Unknown"}</b></p>

                {/* 🖼 ISSUE IMAGE */}
                {issue.image && (
                  <img
                    src={`${BASE_URL}/uploads/${issue.image}`}
                    style={styles.img}
                    alt="Issue"
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
                      style={styles.img}
                      alt="Completion"
                      onClick={() =>
                        setPreviewImage(
                          `${BASE_URL}/uploads/${issue.completionImage}`
                        )
                      }
                    />
                  </div>
                )}

                {/* 📝 REMARKS */}
                {issue.remarks && (
                  <p style={{ ...styles.meta, marginTop: "8px" }}>
                    <b>📝 Remarks:</b> {issue.remarks}
                  </p>
                )}

                <p style={{ ...styles.meta, marginTop: "8px" }}>
                  Status: <b style={{ textTransform: "capitalize", color: "#ffffff" }}>{issue.status}</b>
                </p>
              </div>

              {/* ACTIONS */}
              <div style={{ marginTop: "15px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px", display: "flex", gap: "10px" }}>
                <select
                  value={issue.status}
                  style={styles.select}
                  disabled={actionLoading === issue._id}
                  onChange={(e) =>
                    updateStatus(issue._id, e.target.value)
                  }
                >
                  <option style={styles.selectOption} value="submitted">Submitted</option>
                  <option style={styles.selectOption} value="assigned">Assigned</option>
                  <option style={styles.selectOption} value="in-progress">In Progress</option>
                  <option style={styles.selectOption} value="resolved">Resolved</option>
                </select>

                <select
                  style={styles.select}
                  disabled={actionLoading === issue._id}
                  onChange={(e) =>
                    assignWorker(issue._id, e.target.value)
                  }
                >
                  <option style={styles.selectOption} value="">
                    {issue.assignedTo
                      ? `Assigned: ${issue.assignedTo.name}`
                      : "Assign Worker"}
                  </option>

                  {workers.map((w) => (
                    <option key={w._id} style={styles.selectOption} value={w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* 🔍 IMAGE PREVIEW */}
        {previewImage && (
          <div style={styles.overlay} onClick={() => setPreviewImage(null)}>
            <img src={previewImage} style={styles.previewImage} alt="Preview" />
          </div>
        )}
      </div>

      <Chatbot />
    </div>
  );
}

/* 🎨 STYLES */
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
    marginBottom: "20px"
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
    color: "#f8fafc",
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

  meta: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "4px 0"
  },

  img: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    marginTop: "10px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    cursor: "pointer"
  },

  select: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    background: "rgba(15, 23, 42, 0.6)",
    color: "#ffffff",
    outline: "none",
    cursor: "pointer",
    fontSize: "13px",
    flex: 1,
    boxSizing: "border-box"
  },

  selectOption: {
    background: "#1e293b",
    color: "#ffffff"
  },

  overlay: {
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