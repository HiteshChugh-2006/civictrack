import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function Navbar({ setIsOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/issues");
      const list = res.data || [];
      
      const notifs = list
        .filter(item => item.status !== "submitted") // only display updates
        .map(item => {
          let message = "";
          if (item.status === "resolved") {
            message = `🎉 Issue resolved: "${item.title}"`;
          } else if (item.status === "in-progress") {
            message = `⚡ In Progress: "${item.title}"`;
          } else if (item.status === "assigned") {
            message = `📌 Assigned to worker: "${item.title}"`;
          }
          return {
            message,
            date: new Date(item.updatedAt || item.createdAt).toLocaleDateString()
          };
        })
        .slice(0, 5); // Show latest 5

      setNotifications(notifs);
    } catch (err) {
      console.log("Could not load notifications:", err.message);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={styles.navbar}>
      <button style={styles.menuBtn} onClick={() => setIsOpen(p => !p)}>
        ☰
      </button>

      <h2 style={styles.title} onClick={() => navigate("/dashboard")}>
        🚀 CivicTrack
      </h2>

      <div style={styles.right}>
        {/* BELL NOTIFICATIONS */}
        <div style={styles.bellWrapper}>
          <button style={styles.bellBtn} onClick={() => setShowDropdown(!showDropdown)}>
            🔔 
            {notifications.length > 0 && (
              <span style={styles.bellBadge}>{notifications.length}</span>
            )}
          </button>

          {showDropdown && (
            <div style={styles.dropdown}>
              <h4 style={styles.dropdownTitle}>Notifications</h4>
              {notifications.length === 0 ? (
                <p style={styles.noNotifs}>No new updates</p>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} style={styles.notifItem}>
                    <p style={styles.notifText}>{n.message}</p>
                    <span style={styles.notifDate}>{n.date}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={styles.userBox} onClick={() => navigate("/profile")}>
          <div style={styles.avatar}>
            {user.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <span style={styles.userName}>{user?.name || "User"}</span>
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
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
    cursor: "pointer",
    fontSize: "20px"
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexShrink: 0
  },
  bellWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  bellBtn: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    color: "#e2e8f0",
    cursor: "pointer",
    position: "relative",
    padding: "5px",
    display: "flex",
    alignItems: "center"
  },
  bellBadge: {
    position: "absolute",
    top: "-3px",
    right: "-3px",
    background: "#ef4444",
    color: "white",
    borderRadius: "50%",
    padding: "2px 6px",
    fontSize: "9px",
    fontWeight: "bold",
    boxShadow: "0 0 5px rgba(239, 68, 68, 0.5)"
  },
  dropdown: {
    position: "absolute",
    top: "45px",
    right: "0",
    background: "#151c2c",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    width: "260px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
    padding: "12px",
    zIndex: 1002
  },
  dropdownTitle: {
    margin: "0 0 10px 0",
    fontSize: "13px",
    fontWeight: "600",
    color: "#ffffff",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "5px"
  },
  notifItem: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    padding: "8px 0",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  notifText: {
    margin: 0,
    fontSize: "12px",
    color: "#cbd5e1",
    lineHeight: "1.4"
  },
  notifDate: {
    fontSize: "10px",
    color: "#64748b",
    alignSelf: "flex-end"
  },
  noNotifs: {
    margin: 0,
    padding: "15px 0",
    fontSize: "12px",
    color: "#94a3b8",
    textAlign: "center"
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#e2e8f0",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "background 0.2s"
  },
  userName: {
    fontSize: "14px",
    fontWeight: "500"
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    color: "#ffffff",
    fontSize: "13px"
  },
  logout: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    transition: "all 0.2s"
  }
};