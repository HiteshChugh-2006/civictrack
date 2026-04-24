import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
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
        API.get("/api/issues"),
        API.get("/api/users/workers"),
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

      await API.put(`/api/issues/assign/${id}`, { workerId });

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

      await API.put(`/api/issues/${id}`, { status });

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

  if (loading) return <h2 style={{ padding: 100 }}>Loading...</h2>;

  return (
    <div style={{ display: "flex", background: "#f1f5f9" }}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div
        style={{
          marginTop: "60px",
          marginLeft: isOpen ? "220px" : "0",
          padding: "25px",
          width: "100%",
        }}
      >
        <h1>🧑‍💼 Admin Dashboard</h1>

        {/* 🔍 FILTER */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* 📋 ISSUES */}
        {filteredIssues.map((issue) => (
          <div key={issue._id} style={card}>
            <h3>{issue.title}</h3>
            <p>{issue.description}</p>

            <p>👤 {issue.createdBy?.name || "Unknown"}</p>

            {/* 🖼 ISSUE IMAGE */}
            {issue.image && (
              <img
                src={`${BASE_URL}/uploads/${issue.image}`}
                style={img}
                onClick={() =>
                  setPreviewImage(`/uploads/${issue.image}`)
                }
              />
            )}

            {/* 📸 COMPLETION IMAGE */}
            {issue.completionImage && (
              <>
                <p>📸 Completed:</p>
                <img
                  src={`${BASE_URL}/uploads/${issue.completionImage}`}
                  style={img}
                  onClick={() =>
                    setPreviewImage(
                      `/uploads/${issue.completionImage}`
                    )
                  }
                />
              </>
            )}

            {/* 📝 REMARKS */}
            {issue.remarks && <p>📝 {issue.remarks}</p>}

            <p>Status: <b>{issue.status}</b></p>

            {/* ACTIONS */}
            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <select
                value={issue.status}
                disabled={actionLoading === issue._id}
                onChange={(e) =>
                  updateStatus(issue._id, e.target.value)
                }
              >
                <option value="submitted">Submitted</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                disabled={actionLoading === issue._id}
                onChange={(e) =>
                  assignWorker(issue._id, e.target.value)
                }
              >
                <option value="">
                  {issue.assignedTo
                    ? `Assigned: ${issue.assignedTo.name}`
                    : "Assign Worker"}
                </option>

                {workers.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        {/* 🔍 IMAGE PREVIEW */}
        {previewImage && (
          <div style={overlay} onClick={() => setPreviewImage(null)}>
            <img src={previewImage} style={{ maxWidth: "90%" }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* 🎨 STYLES */
const card = {
  background: "white",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "12px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
};

const img = {
  width: "100%",
  height: "150px",
  objectFit: "cover",
  marginTop: "10px",
  borderRadius: "10px",
  cursor: "pointer",
};

const overlay = {
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
};