import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData(); // ❌ removed interval → smoother UX
  }, []);

  const fetchData = async () => {
    try {
      const issuesRes = await axios.get("/api/issues", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const workersRes = await axios.get("/api/users/workers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIssues(issuesRes.data);
      setWorkers(workersRes.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  // ✅ ASSIGN WORKER
  const assignWorker = async (id, workerId) => {
    if (!workerId) return;

    try {
      setActionLoading(id);

      await axios.put(
        `/api/issues/assign/${id}`,
        { workerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchData();
    } catch (err) {
      alert("Worker assign failed ❌");
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ UPDATE STATUS
  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id);

      await axios.put(
        `/api/issues/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchData();
    } catch (err) {
      alert("Status update failed ❌");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredIssues = issues
    .filter(i => filter === "all" || i.status === filter)
    .filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <h2 style={{ padding: "100px" }}>Loading Admin Panel...</h2>;
  }

  return (
    <div style={styles.layout}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} role="admin" />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{
        ...styles.content,
        marginLeft: isOpen ? "220px" : "0"
      }}>

        <h1>🧑‍💼 Admin Control Panel</h1>

        {/* 📊 STATS */}
        <div style={styles.stats}>
          <StatCard title="Total" value={issues.length} color="#6366f1" />
          <StatCard title="Resolved" value={issues.filter(i => i.status === "resolved").length} color="#22c55e" />
          <StatCard title="Pending" value={issues.filter(i => i.status !== "resolved").length} color="#f59e0b" />
        </div>

        {/* 🔍 FILTER */}
        <div style={styles.topBar}>
          <input
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />

          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.select}>
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* 📋 ISSUES */}
        <div style={styles.grid}>
          {filteredIssues.map(issue => (
            <div key={issue._id} style={styles.card}>

              <h3>{issue.title}</h3>
              <p>{issue.description}</p>

              <p style={{ fontSize: "13px", color: "#555" }}>
                👤 Reported by: <b>{issue.createdBy?.name || "Unknown"}</b>
              </p>

              {/* 🖼 USER IMAGE */}
              {issue.image && (
                <img
                  src={`/${issue.image}`}
                  alt="issue"
                  style={styles.image}
                  onClick={() => setPreviewImage(`/${issue.image}`)}
                />
              )}

              {/* 📸 COMPLETED IMAGE */}
              {issue.completionImage && (
                <>
                  <p style={{ marginTop: "10px" }}>📸 Completed Work:</p>
                  <img
                    src={`/${issue.completionImage}`}
                    alt="completed"
                    style={styles.image}
                    onClick={() => setPreviewImage(`/${issue.completionImage}`)}
                  />
                </>
              )}

              {issue.remarks && (
                <p style={{ fontSize: "13px", marginTop: "5px" }}>
                  📝 {issue.remarks}
                </p>
              )}

              <div style={styles.meta}>
                <StatusBadge status={issue.status} />
                <span>👷 {issue.assignedTo?.name || "Not Assigned"}</span>
              </div>

              {/* ⚙ ACTIONS */}
              <div style={styles.actions}>
                <select
                  disabled={actionLoading === issue._id}
                  value={issue.status}
                  onChange={(e) => updateStatus(issue._id, e.target.value)}
                  style={styles.select}
                >
                  <option value="submitted">Submitted</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <select
                  disabled={actionLoading === issue._id}
                  onChange={(e) => assignWorker(issue._id, e.target.value)}
                  style={styles.select}
                >
                  <option value="">Assign Worker</option>
                  {workers.map(w => (
                    <option key={w._id} value={w._id}>
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
          <div style={styles.previewOverlay} onClick={() => setPreviewImage(null)}>
            <img src={previewImage} style={styles.previewImage} />
          </div>
        )}

      </div>
    </div>
  );
}
// 🔹 STAT CARD
function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        ...styles.statCard,
        borderTop: `4px solid ${color}`,
      }}
    >
      <h4>{title}</h4>
      <h2>{value}</h2>
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
    <span
      style={{
        padding: "5px 10px",
        borderRadius: "20px",
        background: s.bg,
        color: s.color,
        fontSize: "12px",
      }}
    >
      {status}
    </span>
  );
}
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)"
  },

  content: {
    marginTop: "60px",
    padding: "30px",
    width: "100%"
  },

  /* 📊 STATS */
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
    gap: "20px",
    marginBottom: "25px"
  },

  statCard: {
    background: "white",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    transition: "0.3s",
    cursor: "pointer"
  },

  /* 🔍 FILTER BAR */
  topBar: {
    display: "flex",
    gap: "15px",
    marginBottom: "25px",
    flexWrap: "wrap"
  },

  search: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    width: "260px",
    outline: "none",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
  },

  select: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    background: "white"
  },

  /* 📋 GRID */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))",
    gap: "25px"
  },

  /* 🧾 CARD */
  card: {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
    transition: "0.3s",
    border: "1px solid rgba(255,255,255,0.3)"
  },

  /* 🖼 IMAGE */
  image: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "12px",
    marginTop: "10px",
    cursor: "pointer",
    transition: "0.3s"
  },

  /* META */
  meta: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "12px",
    fontSize: "14px"
  },

  /* ACTIONS */
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "15px"
  },

  /* PREVIEW */
  previewOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },

  previewImage: {
    maxWidth: "90%",
    maxHeight: "90%",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
  }
};