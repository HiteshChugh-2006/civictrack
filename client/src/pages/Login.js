import { useState } from "react";
import API from "../api"; // ✅ FIXED
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

      const res = await API.post("/auth/login", data); // ✅ FIXED

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") navigate("/admin");
      else if (user.role === "worker") navigate("/worker");
      else navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert(err?.response?.data || "Login Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-card">
        <div style={styles.iconContainer}>🚀</div>
        <h2 style={styles.title}>CivicTrack Login</h2>
        <p style={styles.subtitle}>Welcome back! Access your dashboard.</p>

        <form onSubmit={handleSubmit}>
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

          <button
            type="submit"
            className="premium-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="premium-link" onClick={() => navigate("/register")}>
          New user? Create an account
        </p>

        <p style={styles.forgot}>
          Forgot Password? (Coming soon 🚀)
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
  },
  forgot: {
    color: "#475569",
    fontSize: "12px",
    marginTop: "16px"
  }
};
