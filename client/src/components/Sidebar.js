import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRole = user?.role || "user";
  const role = rawRole === "citizen" ? "user" : rawRole;

  const menus = {
    admin: [
      { label: "Dashboard", path: "/admin", icon: "📊" },
      { label: "Manage Issues", path: "/admin/issues", icon: "⚙️" },
      { label: "Map View", path: "/map", icon: "🗺️" },
      { label: "My Profile", path: "/profile", icon: "👤" },
      { label: "Leaderboard", path: "/leaderboard", icon: "🏆" },
      { label: "Help & FAQ", path: "/faq", icon: "💬" }
    ],
    worker: [
      { label: "Dashboard", path: "/worker", icon: "👷" },
      { label: "My Profile", path: "/profile", icon: "👤" },
      { label: "Leaderboard", path: "/leaderboard", icon: "🏆" },
      { label: "Help & FAQ", path: "/faq", icon: "💬" }
    ],
    user: [
      { label: "Dashboard", path: "/dashboard", icon: "📊" },
      { label: "Report Issue", path: "/create", icon: "📍" },
      { label: "My Issues", path: "/issues", icon: "📋" },
      { label: "My Profile", path: "/profile", icon: "👤" },
      { label: "Leaderboard", path: "/leaderboard", icon: "🏆" },
      { label: "Help & FAQ", path: "/faq", icon: "💬" }
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
        <h2 className="sidebar-brand" onClick={() => navigate("/")}>🚀 CivicTrack</h2>

        <div style={styles.menuContainer}>
          {menus[role] && menus[role].map((item, i) => {
            const isActive = activePath === item.path;
            return (
              <div
                key={i}
                className={`sidebar-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
              >
                <span style={{ fontSize: "16px" }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* PROFILE CARD */}
        {user.name && (
          <div className="sidebar-user-card" onClick={() => {
            navigate("/profile");
            setIsOpen(false);
          }} style={{ cursor: "pointer" }}>
            <div className="sidebar-user-avatar">
              {user.name[0].toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-user-role">{user.role}</span>
            </div>
          </div>
        )}

        {/* LOGOUT */}
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
    flexDirection: "column",
    boxSizing: "border-box"
  },
  menuContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  logout: {
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