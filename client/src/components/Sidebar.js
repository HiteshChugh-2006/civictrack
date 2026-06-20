import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRole = user?.role || "user";
  const role = rawRole === "citizen" ? "user" : rawRole;

  const menus = {
    admin: [
      { label: "Dashboard", path: "/admin" },
      { label: "Manage Issues", path: "/admin/issues" },
      { label: "Map", path: "/map" },
      { label: "Profile", path: "/profile" },
      { label: "Leaderboard", path: "/leaderboard" },
      { label: "Help & FAQ", path: "/faq" }
    ],
    worker: [
      { label: "Dashboard", path: "/worker" },
      { label: "Profile", path: "/profile" },
      { label: "Leaderboard", path: "/leaderboard" },
      { label: "Help & FAQ", path: "/faq" }
    ],
    user: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Report Issue", path: "/create" },
      { label: "My Issues", path: "/issues" },
      { label: "Profile", path: "/profile" },
      { label: "Leaderboard", path: "/leaderboard" },
      { label: "Help & FAQ", path: "/faq" }
    ]
  };

  const activePath = window.location.pathname;

  return (
    <>
      {isOpen && <div style={styles.overlay} onClick={() => setIsOpen(false)} />}

      <div style={{
        ...styles.sidebar,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)"
      }}>
        <h2 style={styles.brandTitle} onClick={() => navigate("/")}>🚀 CivicTrack</h2>

        <div style={styles.menuContainer}>
          {menus[role] && menus[role].map((item, i) => {
            const isActive = activePath === item.path;
            return (
              <div
                key={i}
                style={{
                  ...styles.item,
                  background: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                  borderLeft: isActive ? "4px solid #3b82f6" : "4px solid transparent",
                  paddingLeft: isActive ? "16px" : "12px",
                  color: isActive ? "#ffffff" : "#94a3b8"
                }}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>

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
    background: "#0b0f19",
    color: "white",
    padding: "25px 20px",
    zIndex: 1001,
    transition: "0.3s",
    boxShadow: "4px 0 20px rgba(0,0,0,0.3)",
    borderRight: "1px solid rgba(255, 255, 255, 0.05)",
    display: "flex",
    flexDirection: "column"
  },
  brandTitle: {
    margin: "0 0 30px 0",
    fontSize: "20px",
    fontWeight: "700",
    color: "#ffffff",
    cursor: "pointer",
    textAlign: "center"
  },
  menuContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  item: {
    padding: "12px",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  logout: {
    marginTop: "auto",
    background: "#ef4444",
    color: "white",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s"
  },
  overlay: {
    position: "fixed",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    zIndex: 1000
  }
};