import { useState } from "react";
import API from "../api"; // ✅ FIXED
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.name || !data.email || !data.password) {
      alert("⚠️ Fill all fields");
      return;
    }

    try {
      await API.post("/auth/register", data); // ✅ FIXED

      alert("Registered Successfully ✅");
      navigate("/");

    } catch (err) {
      console.error(err);
      alert(err?.response?.data || "Error ❌");
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-card">
        <div style={styles.iconContainer}>📝</div>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join CivicTrack to report & track issues.</p>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Full Name"
            value={data.name}
            className="glass-input"
            onChange={(e) =>
              setData({ ...data, name: e.target.value })
            }
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={data.email}
            className="glass-input"
            onChange={(e) =>
              setData({ ...data, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={data.password}
            className="glass-input"
            onChange={(e) =>
              setData({ ...data, password: e.target.value })
            }
            required
          />

          <button type="submit" className="premium-btn">
            Register
          </button>
        </form>

        <p onClick={() => navigate("/")} className="premium-link">
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)",
    padding: "20px",
    boxSizing: "border-box"
  },
  iconContainer: {
    fontSize: "36px",
    marginBottom: "12px",
    display: "inline-block"
  },
  title: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "24px",
    margin: "0 0 4px 0"
  },
  subtitle: {
    color: "#64748b",
    fontSize: "14px",
    margin: "0 0 24px 0"
  }
};
