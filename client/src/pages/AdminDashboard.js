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

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    fetchData();
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
      setActionLoading(id);

      await axios.put(
        `/api/issues/assign/${id}`,
        { workerId },
        { headers: { Authorization: token } }
      );

      fetchData();
    } catch {
      alert("Assign failed ❌");
    } finally {
      setActionLoading(null);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id);

      await axios.put(
        `/api/issues/${id}`,
        { status },
        { headers: { Authorization: token } }
      );

      fetchData();
    } catch {
      alert("Update failed ❌");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredIssues = issues
    .filter(i => filter === "all" || i.status === filter)
    .filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <h2 style={{ padding: "100px" }}>Loading...</h2>;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} role="admin" />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{ marginTop: "60px", marginLeft: isOpen ? "220px" : "0", padding: "20px", width: "100%" }}>

        <h1>🧑‍💼 Admin Dashboard</h1>

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="submitted">Submitted</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        {filteredIssues.map(issue => (
          <div key={issue._id} style={card}>

            <h3>{issue.title}</h3>
            <p>{issue.description}</p>

            <p>👤 {issue.createdBy?.name}</p>

            {issue.image && (
              <img
                src={`/uploads/${issue.image}`}
                style={img}
                onClick={() => setPreviewImage(`/uploads/${issue.image}`)}
              />
            )}

            {issue.completionImage && (
              <img
                src={`/${issue.completionImage}`}
                style={img}
              />
            )}

            <p>Status: {issue.status}</p>

            <select
              value={issue.status}
              onChange={(e) => updateStatus(issue._id, e.target.value)}
            >
              <option value="submitted">Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select onChange={(e) => assignWorker(issue._id, e.target.value)}>
              <option>Assign Worker</option>
              {workers.map(w => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>

          </div>
        ))}

        {previewImage && (
          <div style={overlay} onClick={() => setPreviewImage(null)}>
            <img src={previewImage} style={{ maxWidth: "90%" }} />
          </div>
        )}

      </div>
    </div>
  );
}

const card = { background: "white", padding: 15, marginBottom: 15 };
const img = { width: "100%", height: 150, objectFit: "cover" };
const overlay = {
  position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
  background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center"
};