import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import { useEffect, useState } from "react";
import axios from "axios";

export default function WorkerDashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState({});
  const [remarks, setRemarks] = useState({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get("/api/issues/worker", {
        headers: { Authorization: token },
      });
      setIssues(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  // ✅ UPDATE STATUS (FIXED BACKTICKS)
  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `/api/issues/${id}`,
        { status },
        { headers: { Authorization: token } }
      );
      fetchIssues();
    } catch (err) {
      console.log(err);
      alert("Update failed ❌");
    }
  };

  // ✅ SUBMIT WORK (FIXED + REFRESH)
  const submitWork = async (id) => {
    try {
      const formData = new FormData();
      formData.append("image", selectedImage[id]);
      formData.append("remarks", remarks[id] || "");

      await axios.put(
        `/api/issues/complete/${id}`,
        formData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Work submitted ✅");
      fetchIssues(); // 🔥 refresh UI
    } catch (err) {
      console.log(err);
      alert("Submission failed ❌");
    }
  };

  if (loading) {
    return <h2 style={{ padding: "100px" }}>Loading tasks...</h2>;
  }

  return (
    <div>
      <Navbar setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} role="worker" />

      <div
        style={{
          marginTop: "60px",
          marginLeft: isOpen ? "220px" : "0",
          padding: "20px",
        }}
      >
        <h1>👷 Worker Dashboard</h1>

        {issues.length === 0 && <p>No assigned tasks 🚀</p>}

        {issues.map((issue) => (
          <div key={issue._id} style={styles.card}>
            <h3>{issue.title}</h3>
            <p>{issue.description}</p>

            <p style={{ fontSize: "13px", color: "#555" }}>
              👤 Reported by:{" "}
              <b>{issue.createdBy?.name || "Unknown"}</b>
            </p>

            {/* 🖼 USER IMAGE (FIXED) */}
            {issue.image && (
              <img
                src={`/${issue.image}`}
                alt="issue"
                style={styles.image}
                onClick={() =>
                  setPreviewImage(`/${issue.image}`)
                }
              />
            )}

            <StatusBadge status={issue.status} />

            <div style={{ marginTop: "10px" }}>
              {(issue.status === "assigned" ||
                issue.status === "pending") && (
                <button
                  style={styles.startBtn}
                  onClick={() =>
                    updateStatus(issue._id, "in-progress")
                  }
                >
                  ▶ Start Work
                </button>
              )}

              {issue.status === "in-progress" && (
                <div style={{ marginTop: "10px" }}>
                  <input
                    type="file"
                    onChange={(e) =>
                      setSelectedImage({
                        ...selectedImage,
                        [issue._id]: e.target.files[0],
                      })
                    }
                  />

                  <textarea
                    placeholder="Add remarks..."
                    style={{
                      width: "100%",
                      marginTop: "5px",
                    }}
                    onChange={(e) =>
                      setRemarks({
                        ...remarks,
                        [issue._id]: e.target.value,
                      })
                    }
                  />

                  <button
                    style={styles.doneBtn}
                    onClick={() => submitWork(issue._id)}
                  >
                    📤 Submit Work
                  </button>
                </div>
              )}

              {issue.status === "resolved" && (
                <span style={styles.doneText}>
                  ✔ Completed
                </span>
              )}
            </div>
          </div>
        ))}

        {/* 🔍 PREVIEW */}
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
