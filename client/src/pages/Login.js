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
