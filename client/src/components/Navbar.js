import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function Navbar({ setIsOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [time, setTime] = useState(new Date());
  const isDemo = user?.isDemo;

  useEffect(() => {
    fetchNotifications();
    const timerId = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timerId);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/issues");
      const list = res.data || [];
      const notifs = list
        .filter(item => item.status !== "submitted")
        .map(item => {
          let message = "", icon = "";
          if (item.status === "resolved") { message = `Issue resolved: "${item.title}"`; icon = "🎉"; }
          else if (item.status === "in-progress") { message = `In progress: "${item.title}"`; icon = "⚡"; }
          else if (item.status === "assigned") { message = `Assigned: "${item.title}"`; icon = "📌"; }
          else if (item.status === "verified") { message = `Verified: "${item.title}"`; icon = "✅"; }
          return { message, icon, date: new Date(item.updatedAt || item.createdAt).toLocaleDateString() };
        })
        .slice(0, 7);
      setNotifications(notifs);
    } catch (err) {
      // silent fail
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const initials = user.name ? user.name[0].toUpperCase() : "U";
  const roleBadgeColor = {
    admin: "#f59e0b",
    worker: "#10b981",
    citizen: "#3b82f6",
    user: "#3b82f6"
  }[user?.role] || "#3b82f6";

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? "Good morning" : greetingHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <nav style={styles.navbar}>
      {/* LEFT */}
      <div style={styles.left}>
        <button style={styles.menuBtn} onClick={() => setIsOpen(p => !p)} aria-label="Toggle Sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div style={styles.brand} onClick={() => navigate("/dashboard")}>
          <span style={styles.brandIcon}>🌐</span>
          <span style={styles.brandText}>CivicTrack</span>
        </div>
        <div style={styles.greetingBadge}>
          {greeting}, {user.name?.split(" ")[0] || "User"}!
        </div>
      </div>

      {/* RIGHT */}
      <div style={styles.right}>
        {/* Demo Badge */}
        {isDemo && (
          <span className="badge badge-demo" style={{ fontSize: "10px" }}>
            🎭 DEMO MODE
          </span>
        )}

        {/* Time */}
        <div style={styles.timeBadge}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Bell Notifications */}
        <div style={styles.bellWrapper}>
          <button
            style={styles.bellBtn}
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="Notifications"
          >
            🔔
            {notifications.length > 0 && (
              <span style={styles.badge}>{notifications.length}</span>
            )}
          </button>
          {showDropdown && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <h4 style={styles.dropdownTitle}>Notifications</h4>
                <span style={{ fontSize: "11px", color: "#475569" }}>{notifications.length} updates</span>
              </div>
              {notifications.length === 0 ? (
                <p style={styles.noNotifs}>No new updates</p>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} style={styles.notifItem}>
                    <span style={styles.notifIcon}>{n.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={styles.notifText}>{n.message}</p>
                      <span style={styles.notifDate}>{n.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Info */}
        <div style={styles.userBox} onClick={() => navigate("/profile")}>
          <div style={{ ...styles.avatar, borderColor: roleBadgeColor }}>
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : initials
            }
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.name || "User"}</span>
            <span style={{ ...styles.userRole, color: roleBadgeColor }}>
              {user?.role === "citizen" ? "🧑 Citizen" : user?.role === "admin" ? "⚙️ Admin" : user?.role === "worker" ? "👷 Worker" : "User"}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button onClick={logout} style={styles.logout} title="Logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    position: "fixed",
    top: 0, right: 0, left: 0,
    height: "64px",
    background: "rgba(6, 11, 24, 0.97)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    backdropFilter: "blur(20px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px 0 16px",
    zIndex: 999,
    boxShadow: "0 2px 20px rgba(0,0,0,0.6)"
  },
  left: { display: "flex", alignItems: "center", gap: "12px" },
  right: { display: "flex", alignItems: "center", gap: "12px" },
  menuBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "#94a3b8",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer"
  },
  brandIcon: { fontSize: "22px" },
  brandText: {
    fontSize: "18px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.3px"
  },
  greetingBadge: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500",
    display: window.innerWidth < 900 ? "none" : "block"
  },
  timeBadge: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "8px",
    padding: "5px 10px"
  },
  bellWrapper: { position: "relative" },
  bellBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "#94a3b8",
    padding: "8px 10px",
    fontSize: "16px",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  badge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    borderRadius: "50%",
    width: "17px",
    height: "17px",
    fontSize: "10px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "44px",
    width: "300px",
    background: "#0d1526",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
    overflow: "hidden",
    zIndex: 1000
  },
  dropdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.06)"
  },
  dropdownTitle: {
    color: "#f0f6ff",
    fontSize: "14px",
    fontWeight: "600",
    margin: 0
  },
  noNotifs: { color: "#475569", textAlign: "center", padding: "20px", fontSize: "14px" },
  notifItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "10px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    transition: "background 0.2s",
    cursor: "default"
  },
  notifIcon: { fontSize: "16px", marginTop: "2px", flexShrink: 0 },
  notifText: { fontSize: "12px", color: "#cbd5e1", margin: 0, lineHeight: "1.5" },
  notifDate: { fontSize: "10px", color: "#475569", marginTop: "2px", display: "block" },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: "10px",
    border: "1px solid transparent",
    transition: "all 0.2s"
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "2px solid",
    background: "linear-gradient(135deg, #1d4ed8, #0891b2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "15px",
    color: "white",
    flexShrink: 0,
    overflow: "hidden"
  },
  userInfo: { display: "flex", flexDirection: "column", lineHeight: 1.3 },
  userName: { fontSize: "13px", fontWeight: "600", color: "#f0f6ff" },
  userRole: { fontSize: "11px", fontWeight: "500" },
  logout: {
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    borderRadius: "8px",
    color: "#f87171",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s"
  }
};