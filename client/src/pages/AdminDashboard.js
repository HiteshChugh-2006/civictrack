// 🔥 FIXED AdminDashboard.js

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

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const issuesRes = await axios.get("/api/issues", {
        headers: { Authorization: token },
      });

      const workersRes = await axios.get("/api/users/workers", {
        headers: { Authorization: token },
      });

      setIssues(issuesRes.data);
      setWorkers(workersRes.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const assignWorker = async (id, workerId) => {
    if (!workerId) return;

    try {
      await axios.put(
        `/api/issues/assign/${id}`,
        { workerId },
        { headers: { Authorization: token } }
      );

      fetchData();
    } catch (err) {
      console.log(err);
      alert("Worker assign failed ❌");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `/api/issues/${id}`,   // ✅ FIXED
        { status },
        { headers: { Authorization: token } }
      );

      fetchData();
    } catch (err) {
      console.log(err);
      alert("Status update failed ❌");
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

      <div style={{ ...styles.content, marginLeft: isOpen ? "220px" : "0" }}>
        <h1>🧑‍💼 Admin Control Panel</h1>

        <div style={styles.stats}>
          <StatCard title="Total" value={issues.length} color="#6366f1" />
          <StatCard title="Resolved" value={issues.filter(i => i.status === "resolved").length} color="#22c55e" />
          <StatCard title="Pending" value={issues.filter(i => i.status !== "resolved").length} color="#f59e0b" />
        </div>

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

        <div style={styles.grid}>
          {filteredIssues.map(issue => (
            <div key={issue._id} style={styles.card}>

              <h3>{issue.title}</h3>
              <p>{issue.description}</p>

              <p style={{ fontSize: "13px", color: "#555" }}>
                👤 Reported by: <b>{issue.createdBy?.name || "Unknown"}</b>
              </p>

              {issue.image && (
                <img
                  src={`/api/uploads/${issue.image}`}
                  style={styles.image}
                  onClick={() => setPreviewImage(`/api/uploads/${issue.image}`)}
                />
              )}

              {/* ✅ FIXED */}
              {issue.completionImage && (
                <>
                  <p>📸 Completed Work:</p>
                  <img
                    src={`/api/${issue.completionImage}`}
                    style={styles.image}
                  />
                </>
              )}

              <div style={styles.meta}>
                <StatusBadge status={issue.status} />
                <span>👷 {issue.assignedTo?.name || "Not Assigned"}</span>
              </div>

              <div style={styles.actions}>
                <select
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
                  onChange={(e) => assignWorker(issue._id, e.target.value)}
                  style={styles.select}
                >
                  <option value="">Assign Worker</option>
                  {workers.map(w => (
                    <option key={w._id} value={w._id}>{w.name}</option>
                  ))}
                </select>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      {/* ✅ FIXED */}
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}
// 🎨 STYLES

const styles = {
layout: { display: "flex", minHeight: "100vh", background: "#f1f5f9" },

content: { marginTop: "60px", padding: "30px", width: "100%" },

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
zIndex: 9999
},

previewImage: {
maxWidth: "90%",
maxHeight: "90%",
borderRadius: "10px"
},

stats: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
gap: "15px",
marginBottom: "20px"
},

statCard: {
background: "white",
padding: "15px",
borderRadius: "10px",
boxShadow: "0 5px 15px rgba(0,0,0,0.08)"
},

topBar: {
display: "flex",
gap: "10px",
marginBottom: "20px"
},

search: {
padding: "10px",
borderRadius: "8px",
border: "1px solid #ccc",
width: "250px"
},

select: {
padding: "10px",
borderRadius: "8px",
border: "1px solid #ccc"
},

grid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))",
gap: "20px"
},

card: {
background: "rgba(255,255,255,0.75)",
backdropFilter: "blur(12px)",
borderRadius: "16px",
padding: "20px",
boxShadow: "0 10px 25px rgba(0,0,0,0.12)"
},

image: {
width: "100%",
height: "150px",
objectFit: "cover",
borderRadius: "10px",
marginTop: "10px",
cursor: "pointer"
},

meta: {
display: "flex",
justifyContent: "space-between",
marginTop: "10px"
},

actions: {
display: "flex",
gap: "10px",
marginTop: "15px"
}
};      
