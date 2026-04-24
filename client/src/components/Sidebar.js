import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "user";

  const menus = {
    admin: [
      { label: "Dashboard", path: "/admin" },
      { label: "Manage Issues", path: "/admin/issues" },
      { label: "Map", path: "/map" }
    ],
    worker: [
      { label: "Dashboard", path: "/worker" }
    ],
    user: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Report Issue", path: "/create" },
      { label: "My Issues", path: "/issues" }
    ]
  };

  return (
    <>
      {isOpen && <div style={styles.overlay} onClick={() => setIsOpen(false)} />}

      <div style={{
        ...styles.sidebar,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)"
      }}>
        <h2 style={{ marginBottom: "20px" }}>CivicTrack</h2>

        {menus[role].map((item, i) => (
          <div
            key={i}
            style={styles.item}
            onClick={() => {
              navigate(item.path);
              setIsOpen(false);
            }}
          >
            {item.label}
          </div>
        ))}

        {/* ✅ LOGOUT FIXED POSITION */}
        <div style={styles.logout} onClick={() => {
          localStorage.clear();
          navigate("/");
        }}>
          Logout
        </div>
      </div>
    </>
  );
}

const styles = {
  sidebar: {
    position: "fixed",
    width: "220px",
    height: "100%",
    background: "#0f172a",
    color: "white",
    padding: "20px",
    zIndex: 1001,
    transition: "0.3s"
  },
  item: {
    padding: "10px",
    marginBottom: "10px",
    cursor: "pointer"
  },
  logout: {
    marginTop: "30px", // ✅ moved up (not bottom)
    background: "#ef4444",
    padding: "10px",
    borderRadius: "6px",
    textAlign: "center",
    cursor: "pointer"
  },
  overlay: {
    position: "fixed",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.3)",
    zIndex: 1000
  }
};