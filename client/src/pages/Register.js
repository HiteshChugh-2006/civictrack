import { useState } from "react";
import axios from "axios";
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

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        data
      );

      alert("Registered Successfully ✅");
      navigate("/");

    } catch {
      alert("Error ❌");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>📝 Sign Up</h2>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Name"
            value={data.name}
            style={styles.input}
            onChange={(e) =>
              setData({ ...data, name: e.target.value })
            }
          />

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
            Register
          </button>
        </form>

        <p onClick={() => navigate("/")} style={styles.link}>
          Already have account? Login
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
  card: { background: "white", padding: "25px", borderRadius: "10px", width: "300px", textAlign: "center" },
  input: { width: "100%", margin: "10px 0", padding: "10px" },
  button: { width: "100%", padding: "10px", background: "green", color: "white" },
  link: { color: "blue", cursor: "pointer" }
};