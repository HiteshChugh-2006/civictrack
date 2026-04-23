import { useEffect, useState } from "react";
import axios from "axios";

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchIssues();
    fetchWorkers();

    const interval = setInterval(fetchIssues, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchIssues = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await axios.get("/api/issues", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    const myIssues = res.data.filter(
      (i) => String(i.createdBy?._id) === String(user._id)
    );

    setIssues(myIssues);
  };

  const fetchWorkers = async () => {
    const res = await axios.get("/api/users/workers", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    setWorkers(res.data);
  };

  const updateStatus = async (id, status) => {
    await axios.put(
      `/api/issues/${id}`,
      { status },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    fetchIssues();
  };

  const assignWorker = async (id, workerId) => {
    if (!workerId) return;

    await axios.put(
      `/api/issues/assign/${id}`,
      { workerId },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );

    alert("Worker Assigned ✅");
    fetchIssues();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Issues</h2>

      {issues.map((issue) => (
        <div key={issue._id} style={card}>
          <h3>{issue.title}</h3>
          <p>{issue.description}</p>

          <p>Status: <b>{issue.status}</b></p>

          {issue.assignedTo && (
            <p>Assigned to: <b>{issue.assignedTo.name}</b></p>
          )}

          {/* 🖼 ORIGINAL IMAGE */}
          {issue.image && (
            <img
              src={`/api/uploads/${issue.image}`}
              style={imageStyle}
            />
          )}

          {/* ✅ COMPLETED WORK (AFTER IMAGE) */}
          {issue.completionImage && (
            <>
              <p style={{ marginTop: "10px" }}>📸 Completed Work:</p>
              <img
                src={`/api/${issue.completionImage}`}
                style={imageStyle}
              />
            </>
          )}

          {/* 📝 REMARKS */}
          {issue.remarks && (
            <p style={{ fontSize: "13px", marginTop: "5px" }}>
              📝 {issue.remarks}
            </p>
          )}

          <br />

          {/* ADMIN CONTROLS */}
          {user?.role === "admin" && (
            <>
              <select
                value={issue.status}
                onChange={(e) =>
                  updateStatus(issue._id, e.target.value)
                }
              >
                <option value="submitted">Submitted</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <br /><br />

              <select
                onChange={(e) =>
                  assignWorker(issue._id, e.target.value)
                }
              >
                <option value="">Select Worker</option>
                {workers.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} ({w.email})
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      ))}
    </div>
  );
}


// 🎨 STYLES
const card = {
  background: "white",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "12px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
  borderLeft: "5px solid #3b82f6"
};

const imageStyle = {
  width: "200px",
  borderRadius: "8px",
  marginTop: "10px"
};