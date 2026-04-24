import { useEffect, useState } from "react";
import API from "../api"; // ✅ FIXED

export default function Issues() {
  const [issues, setIssues] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchIssues();

    const interval = setInterval(fetchIssues, 5000); // ✅ AUTO REFRESH
    return () => clearInterval(interval);
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await API.get("/api/issues"); // ✅ FIXED

      const myIssues = res.data.filter(
        i => String(i.createdBy?._id) === String(user._id)
      );

      setIssues(myIssues);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Issues</h2>

      {issues.map(issue => (
        <div key={issue._id} style={card}>
          <h3>{issue.title}</h3>
          <p>{issue.description}</p>

          {/* 🖼 ORIGINAL IMAGE */}
          {issue.image && (
            <img
              src={`/uploads/${issue.image}`}
              style={img}
              alt=""
            />
          )}

          {/* 📸 COMPLETION IMAGE */}
          {issue.completionImage && (
            <>
              <p>Completed:</p>
              <img
                src={`/uploads/${issue.completionImage}`}
                style={img}
                alt=""
              />
            </>
          )}

          <p>Status: <b>{issue.status}</b></p>
        </div>
      ))}
    </div>
  );
}

const card = {
  background: "white",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
};

const img = {
  width: "200px",
  marginTop: "10px",
  borderRadius: "8px"
};