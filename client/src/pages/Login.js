import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.email || !data.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("/api/auth/login", data);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") navigate("/admin");
      else if (user.role === "worker") navigate("/worker");
      else navigate("/dashboard");

    } catch (err) {
      alert("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* 🌌 BACKGROUND BLOBS */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      {/* ⭐ STARS */}
      <div style={styles.stars}></div>

      {/* 🔐 LOGIN CARD */}
      <div style={styles.card}>

        <h1 style={styles.title}>CivicTrack</h1>
        <p style={styles.subtitle}>Manage civic issues smarter</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={data.email}
            style={styles.input}
            onChange={(e) =>
              setData({ ...data, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={data.password}
            style={styles.input}
            onChange={(e) =>
              setData({ ...data, password: e.target.value })
            }
          />

          <button type="submit" style={styles.button}>
            {loading ? "Logging..." : "Login"}
          </button>
        </form>

        <p style={styles.link} onClick={() => navigate("/register")}>
          Create new account
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
    overflow: "hidden",
    background: "#0f172a",
    position: "relative"
  },

  /* 🔵 FLOATING BLOBS */
  blob1: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "linear-gradient(135deg, #3b82f6, #9333ea)",
    borderRadius: "50%",
    top: "-80px",
    left: "-80px",
    filter: "blur(100px)",
    animation: "float 10s infinite alternate"
  },

  blob2: {
    position: "absolute",
    width: "250px",
    height: "250px",
    background: "linear-gradient(135deg, #22c55e, #06b6d4)",
    borderRadius: "50%",
    bottom: "-80px",
    right: "-80px",
    filter: "blur(100px)",
    animation: "float 12s infinite alternate"
  },

  /* ⭐ STARS */
  stars: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundImage:
      "radial-gradient(white 1px, transparent 1px)",
    backgroundSize: "20px 20px",
    opacity: 0.15
  },

  /* 🔐 CARD */
  card: {
    width: "340px",
    padding: "30px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    textAlign: "center",
    color: "white",
    transform: "perspective(1000px) rotateX(2deg)"
  },

  title: {
    marginBottom: "5px"
  },

  subtitle: {
    fontSize: "13px",
    color: "#cbd5f5",
    marginBottom: "20px"
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "none",
    outline: "none"
  },

  button: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    cursor: "pointer"
  },

  link: {
    marginTop: "15px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#93c5fd"
  }
};
