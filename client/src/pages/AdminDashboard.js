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

  // Announcement creator state
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", type: "announcement" });
  const [newsLoading, setNewsLoading] = useState(false);

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

  // 📢 PUBLISH ANNOUNCEMENT
  const handlePublishNews = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert("Please fill in both title and content! ❗");
      return;
    }

    try {
      setNewsLoading(true);
      await API.post("/news", newAnnouncement);
      setNewAnnouncement({ title: "", content: "", type: "announcement" });
      alert("Announcement published successfully! 📢");
    } catch (err) {
      alert(err.response?.data || "Failed to publish news");
    } finally {
      setNewsLoading(false);
    }
  };

  // 📥 EXPORT REPORT (CSV)
  const exportToCSV = () => {
    if (issues.length === 0) {
      alert("No issue reports to export!");
      return;
    }

    const headers = ["Issue ID", "Title", "Description", "Created By", "Assigned To", "Status", "Created At"];
    const rows = issues.map(issue => [
      issue._id,
      `"${issue.title.replace(/"/g, '""')}"`,
      `"${issue.description.replace(/"/g, '""')}"`,
      issue.createdBy?.name || "Unknown",
      issue.assignedTo?.name || "Unassigned",
      issue.status,
      new Date(issue.createdAt).toLocaleDateString()
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "CivicTrack_CityIssues_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div style={styles.dashboardHeader}>
          <h1 style={styles.heading}>🧑‍💼 Admin Dashboard</h1>
          <button style={styles.exportBtn} onClick={exportToCSV}>
            📥 Export Report (CSV)
          </button>
        </div>

        <div style={styles.gridContainer}>
          {/* LEFT: ISSUES LIST */}
          <div style={styles.leftCol}>
            {/* 🔍 FILTER & SEARCH */}
            <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
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

            {/* 📋 ISSUES GRID */}
            <div style={styles.issuesList}>
              {filteredIssues.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No matching issues found.</p>
              ) : (
                filteredIssues.map((issue) => (
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
                ))
              )}
            </div>
          </div>

          {/* RIGHT: ANNOUNCEMENT WRITER */}
          <div style={styles.rightCol}>
            <div style={styles.announcementCard}>
              <h3 style={styles.announcementHeading}>📢 Publish Announcement</h3>
              <p style={styles.announcementDesc}>Broadcast notifications or alerts to all citizens' dashboards.</p>

              <form onSubmit={handlePublishNews}>
                <div style={styles.inputGroup}>
                  <input
                    placeholder="Announcement Title"
                    value={newAnnouncement.title}
                    style={styles.input}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <textarea
                    placeholder="Announcement Details..."
                    value={newAnnouncement.content}
                    style={styles.textarea}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <select
                    value={newAnnouncement.type}
                    style={styles.announcementSelect}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                  >
                    <option style={styles.selectOption} value="announcement">Announcement (Blue)</option>
                    <option style={styles.selectOption} value="alert">Critical Alert (Red)</option>
                    <option style={styles.selectOption} value="update">Status Update (Green)</option>
                  </select>
                </div>

                <button type="submit" style={styles.publishBtn} disabled={newsLoading}>
                  {newsLoading ? "Publishing..." : "Publish Bulletin"}
                </button>
              </form>
            </div>
          </div>
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

  dashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "15px"
  },

  heading: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700",
    margin: 0
  },

  exportBtn: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)"
  },

  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1.3fr 0.7fr",
    gap: "25px",
    alignItems: "start"
  },

  leftCol: {
    display: "flex",
    flexDirection: "column"
  },

  rightCol: {
    display: "flex",
    flexDirection: "column"
  },

  issuesList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginTop: "10px"
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

  announcementCard: {
    background: "rgba(30, 41, 59, 0.45)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "25px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
  },

  announcementHeading: {
    margin: "0 0 10px 0",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "600"
  },

  announcementDesc: {
    margin: "0 0 20px 0",
    color: "#94a3b8",
    fontSize: "13px"
  },

  inputGroup: {
    marginBottom: "15px"
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "8px",
    background: "rgba(15, 23, 42, 0.6)",
    color: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "13px"
  },

  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "8px",
    minHeight: "100px",
    background: "rgba(15, 23, 42, 0.6)",
    color: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "13px"
  },

  announcementSelect: {
    width: "100%",
    padding: "12px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "8px",
    background: "rgba(15, 23, 42, 0.6)",
    color: "#ffffff",
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
    fontSize: "13px"
  },

  publishBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
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