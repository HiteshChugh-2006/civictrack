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
      alert("⚠️ Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("/api/auth/login", data);

      const { token, user } = res.data;

      // ✅ Save securely
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ ROLE BASED REDIRECT (FINAL FIX)
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "worker") {
        navigate("/worker");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);
      alert(err?.response?.data || "Login Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 CivicTrack Login</h2>

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

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.link} onClick={() => navigate("/register")}>
          New user? Sign up
        </p>

        <p style={styles.forgot}>
          Forgot Password? (Coming soon 🚀)
        </p>
      </div>
    </div>
  );
}
