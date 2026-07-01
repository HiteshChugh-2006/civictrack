import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRole = user?.role || "user";
  const role = rawRole === "citizen" ? "user" : rawRole;
  const isDemo = user?.isDemo;

  const menus = {
    admin: [
      { label: "Dashboard", path: "/admin", icon: "📊", color: "#3b82f6" },
      { label: "Manage Issues", path: "/admin/issues", icon: "⚙️", color: "#8b5cf6" },
      { label: "Live Feed", path: "/livefeed", icon: "📹", color: "#06b6d4" },
      { label: "Map View", path: "/map", icon: "🗺️", color: "#10b981" },
      { label: "Leaderboard", path: "/leaderboard", icon: "🏆", color: "#f59e0b" },
      { label: "My Profile", path: "/profile", icon: "👤", color: "#94a3b8" },
      { label: "Help & FAQ", path: "/faq", icon: "💬", color: "#64748b" }
    ],
    worker: [
      { label: "My Tasks", path: "/worker", icon: "👷", color: "#10b981" },
      { label: "Live Feed", path: "/livefeed", icon: "📹", color: "#06b6d4" },
      { label: "Map View", path: "/map", icon: "🗺️", color: "#3b82f6" },
      { label: "Leaderboard", path: "/leaderboard", icon: "🏆", color: "#f59e0b" },
      { label: "My Profile", path: "/profile", icon: "👤", color: "#94a3b8" },
      { label: "Help & FAQ", path: "/faq", icon: "💬", color: "#64748b" }
    ],
    user: [
      { label: "Dashboard", path: "/dashboard", icon: "📊", color: "#3b82f6" },
      { label: "Report Issue", path: "/create", icon: "📍", color: "#ef4444" },
      { label: "My Issues", path: "/issues", icon: "📋", color: "#8b5cf6" },
      { label: "Live Feed", path: "/livefeed", icon: "📹", color: "#06b6d4" },
      { label: "Map View", path: "/map", icon: "🗺️", color: "#10b981" },
      { label: "Leaderboard", path: "/leaderboard", icon: "🏆", color: "#f59e0b" },
      { label: "My Profile", path: "/profile", icon: "👤", color: "#94a3b8" },
      { label: "Help & FAQ", path: "/faq", icon: "💬", color: "#64748b" }
    ]
  };

  const activePath = window.location.pathname;
  const currentMenus = menus[role] || menus.user;

  const roleBadge = {
    admin: { label: "⚙️ Admin", bg: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" },
    worker: { label: "👷 Worker", bg: "rgba(16,185,129,0.12)", color: "#10b981", border: "rgba(16,185,129,0.3)" },
    user: { label: "🧑 Citizen", bg: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "rgba(59,130,246,0.3)" }
  }[role] || { label: "User", bg: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "rgba(59,130,246,0.3)" };

  const navTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          style={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside style={{ ...styles.sidebar, transform: isOpen ? "translateX(0)" : "translateX(-100%)" }}>

        {/* Brand */}
        <div style={styles.brandRow} onClick={() => navTo("/")}>
          <div style={styles.brandIcon}>🌐</div>
          <div>
            <div style={styles.brandName}>CivicTrack</div>
            <div style={styles.brandTagline}>Smart City Platform</div>
          </div>
        </div>

        {/* Demo Banner */}
        {isDemo && (
          <div style={styles.demoBanner}>
            🎭 Demo Mode — 2hr session
          </div>
        )}

        {/* Role Badge */}
        <div style={{ ...styles.roleBadge, background: roleBadge.bg, color: roleBadge.color, border: `1px solid ${roleBadge.border}` }}>
          {roleBadge.label}
        </div>

        {/* Navigation Menu */}
        <nav style={styles.menuContainer}>
          {currentMenus.map((item, i) => {
            const isActive = activePath === item.path;
            return (
              <div
                key={i}
                className={`sidebar-item${isActive ? " active" : ""}`}
                onClick={() => navTo(item.path)}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span style={{ fontSize: "17px" }} className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <div style={styles.activeIndicator} />}
              </div>
            );
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User Card */}
        {user.name && (
          <div
            className="sidebar-user-card"
            onClick={() => navTo("/profile")}
            style={{ cursor: "pointer" }}
          >
            <div className="sidebar-user-avatar">
              {user.avatar
                ? <img src={user.avatar} alt="av" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                : user.name[0].toUpperCase()
              }
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-user-role">{user.role}</span>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          style={styles.logout}
          onClick={() => { localStorage.clear(); navigate("/"); }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </aside>
    </>
  );
}

const styles = {
  sidebar: {
    position: "fixed",
    width: "240px",
    height: "100vh",
    background: "linear-gradient(180deg, #080f1f 0%, #060b18 100%)",
    color: "white",
    padding: "20px 16px",
    zIndex: 1001,
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "4px 0 30px rgba(0,0,0,0.6), 1px 0 0 rgba(255,255,255,0.04)",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    overflowY: "auto"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    zIndex: 1000
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "10px",
    transition: "background 0.2s"
  },
  brandIcon: {
    fontSize: "28px",
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(59,130,246,0.1)",
    borderRadius: "10px",
    border: "1px solid rgba(59,130,246,0.2)"
  },
  brandName: {
    fontSize: "16px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: 1.2
  },
  brandTagline: {
    fontSize: "10px",
    color: "#475569",
    fontWeight: "500",
    letterSpacing: "0.5px"
  },
  demoBanner: {
    background: "rgba(236, 72, 153, 0.12)",
    border: "1px solid rgba(236, 72, 153, 0.3)",
    borderRadius: "8px",
    padding: "7px 10px",
    fontSize: "11px",
    color: "#f9a8d4",
    textAlign: "center",
    marginBottom: "10px",
    fontWeight: "600"
  },
  roleBadge: {
    borderRadius: "8px",
    padding: "7px 12px",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "16px",
    textAlign: "center",
    letterSpacing: "0.3px"
  },
  menuContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "3px"
  },
  activeIndicator: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#3b82f6",
    marginLeft: "auto",
    boxShadow: "0 0 8px #3b82f6"
  },
  logout: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    borderRadius: "10px",
    color: "#f87171",
    padding: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s",
    marginTop: "4px"
  }
};