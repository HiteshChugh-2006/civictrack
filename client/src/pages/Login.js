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
      alert("Fill all fields ❗");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        data
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") navigate("/admin");
      else if (res.data.user.role === "worker") navigate("/worker");
      else navigate("/dashboard");

    } catch (err) {
      alert("Login Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>🔐 CivicTrack Login</h2>

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
          New user? Sign up
        </p>

        <p style={styles.forgot} onClick={() => alert("Coming soon 🚀")}>
          Forgot Password?
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
    background: "#f4f6f9"
  },
  card: {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    width: "320px",
    textAlign: "center",
    position: "relative",
    zIndex: 10
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#e53935",
    color: "white",
    border: "none",
    borderRadius: "5px"
  },
  link: { color: "blue", cursor: "pointer" },
  forgot: { color: "red", cursor: "pointer", fontSize: "12px" }
};