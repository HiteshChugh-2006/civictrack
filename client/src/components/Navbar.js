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
    left: 0,
    width: "100%",
    height: "60px",
    background: "rgba(30, 41, 59, 0.65)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    zIndex: 1000,
    boxSizing: "border-box",
    color: "#ffffff"
  },
  menuBtn: {
    fontSize: "18px",
    background: "rgba(255, 255, 255, 0.08)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  title: {
    fontWeight: "600",
    color: "#ffffff",
    margin: 0
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexShrink: 0
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#e2e8f0"
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    border: "1px solid rgba(255, 255, 255, 0.2)"
  },
  logout: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s"
  }
};