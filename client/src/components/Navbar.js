import { useNavigate } from "react-router-dom";

export default function Navbar({ setIsOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={styles.navbar}>
      <button style={styles.menuBtn} onClick={() => setIsOpen(p => !p)}>
        ☰
      </button>

      <h2 style={styles.title}>🚀 CivicTrack</h2>

      <div style={styles.right}>
        <div style={styles.userBox}>
          <div style={styles.avatar}></div>
          <span>{user?.name || "User"}</span>
        </div>

        <button onClick={logout} style={styles.logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left:0,
    width: "100%",
    height: "60px",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    zIndex: 1000,
    boxSizing: "border-box" // ✅ ADD THIS
  },
  menuBtn: {
    fontSize: "20px",
    background: "#0f172a",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  title: { fontWeight: "600" },
  right: {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexShrink: 0 // ✅ ADD THIS
},
  userBox: { display: "flex", alignItems: "center", gap: "6px" },
  avatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "#cbd5f5"
  },
  logout: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};