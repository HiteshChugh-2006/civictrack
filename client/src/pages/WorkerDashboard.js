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
const res = await axios.get(
"/api/issues/worker",
{
headers: { Authorization: token },
}
);
setIssues(res.data);
setLoading(false);
} catch (err) {
console.log(err);
setLoading(false);
}
};

// ✅ UPDATE STATUS
const updateStatus = async (id, status) => {
try {
await axios.put(
/api/issues/${id},
{ status },
{
headers: { Authorization: token },
}
);
fetchIssues();
} catch (err) {
console.log(err);
alert("Update failed ❌");
}
};

if (loading) {
return <h2 style={{ padding: "100px" }}>Loading tasks...</h2>;
}
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
      Authorization: `Bearer ${localStorage.getItem("token")}`, // 🔥 FIX  
      "Content-Type": "multipart/form-data"  
    }  
  }  
);  

alert("Work submitted ✅");

} catch (err) {
console.log("ERROR:", err.response?.data || err);
alert("Submission failed ❌");
}
};
return (
<div>
<Navbar setIsOpen={setIsOpen} />
<Sidebar isOpen={isOpen} setIsOpen={setIsOpen} role="worker" />

<div style={{  
    marginTop: "60px",  
    marginLeft: isOpen ? "220px" : "0",  
    padding: "20px"  
  }}>  
    <h1>👷 Worker Dashboard</h1>  

    {issues.length === 0 && (  
      <p>No assigned tasks 🚀</p>  
    )}  

    {issues.map(issue => (  
      <div key={issue._id} style={styles.card}>  

        <h3>{issue.title}</h3>  
        <p>{issue.description}</p>  

        {/* 👤 REPORTED BY */}  
        <p style={{ fontSize: "13px", color: "#555" }}>  
          👤 Reported by: <b>{issue.createdBy?.name || "Unknown"}</b>  
        </p>  

        {/* 🖼 IMAGE */}  
        {issue.image && (  
          <img  
            src={`/api/uploads/${issue.image}`}  
            alt="issue"  
            style={styles.image}  
            onClick={() =>  
              setPreviewImage(`/api/uploads/${issue.image}`)  
            }  
          />  
        )}  

        <StatusBadge status={issue.status} />  

        {/* ⚙ ACTIONS */}  
        <div style={{ marginTop: "10px" }}>  

          {(issue.status === "assigned" || issue.status === "pending") && (  
            <button  
              style={styles.startBtn}  
              onClick={() => updateStatus(issue._id, "in-progress")}  
            >  
              ▶ Start Work  
            </button>  
          )}  

          {issue.status === "in-progress" && (

  <div style={{ marginTop: "10px" }}>  <input  
  type="file"  
  onChange={(e) =>  
    setSelectedImage({  
      ...selectedImage,  
      [issue._id]: e.target.files[0]  
    })  
  }  
/>  

<textarea  
  placeholder="Add remarks..."  
  style={{ width: "100%", marginTop: "5px" }}  
  onChange={(e) =>  
    setRemarks({  
      ...remarks,  
      [issue._id]: e.target.value  
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
)}  {issue.status === "resolved" && (  
            <span style={styles.doneText}>  
              ✔ Completed  
            </span>  
          )}  
        </div>  

      </div>  
    ))}  

    {/* 🔍 IMAGE PREVIEW */}  
    {previewImage && (  
      <div style={styles.previewOverlay} onClick={() => setPreviewImage(null)}>  
        <img src={previewImage} style={styles.previewImage} />  
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
pending: { bg: "#fef3c7", color: "#d97706" }
};

const s = map[status] || map.pending;

return (
<div style={{
marginTop: "10px",
padding: "5px 10px",
borderRadius: "20px",
background: s.bg,
color: s.color,
display: "inline-block",
fontSize: "12px"
}}>
{status}
</div>
);
}

// 🎨 STYLES
const styles = {
card: {
background: "rgba(255,255,255,0.75)",
backdropFilter: "blur(12px)",
borderRadius: "16px",
padding: "20px",
boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
transition: "0.3s",
border: "1px solid rgba(255,255,255,0.2)",
marginBottom: "20px"
},

image: {
width: "100%",
height: "150px",
objectFit: "cover",
borderRadius: "10px",
marginTop: "10px",
cursor: "pointer"
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
zIndex: 9999
},

previewImage: {
maxWidth: "90%",
maxHeight: "90%",
borderRadius: "10px"
},

startBtn: {
background: "#3b82f6",
color: "white",
border: "none",
padding: "6px 12px",
borderRadius: "6px",
cursor: "pointer"
},

doneBtn: {
background: "#22c55e",
color: "white",
border: "none",
padding: "6px 12px",
borderRadius: "6px",
cursor: "pointer"
},

doneText: {
color: "#16a34a",
fontWeight: "bold"
}
};
