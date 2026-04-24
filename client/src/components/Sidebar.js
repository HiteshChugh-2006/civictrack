import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const role = user?.role || "user";

  // 🔥 ROLE-BASED MENUS
  const menuConfig = {
    admin: [
      { label: "📊 Dashboard", path: "/admin" },
      { label: "📋 Manage Issues", path: "/admin/issues" },
      { label: "🗺️ Map Analytics", path: "/map" },
      { label: "ℹ️ About", path: "/about" }
    ],

    worker: [
      { label: "📊 Dashboard", path: "/worker" },
      { label: "🛠️ My Tasks", path: "/worker" },
      { label: "🗺️ Map View", path: "/map" },
      { label: "ℹ️ About", path: "/about" }
    ],

    user: [
      { label: "🏠 Dashboard", path: "/dashboard" },
      { label: "📍 Report Issue", path: "/create" },
      { label: "📊 My Issues", path: "/issues" },
      { label: "🗺️ Map", path: "/map" },
      { label: "ℹ️ About", path: "/about" }
    ]
  };

  const menuItems = menuConfig[role] || menuConfig.user;

  return (
    <>
      {/* 🔲 OVERLAY */}
      {isOpen && (
        <div
          style={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 📌 SIDEBAR */}
      <div
        style={{
          ...styles.sidebar,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)"
        }}
      >
        <h2 style={styles.logo}>🚀 CivicTrack</h2>

        <p style={styles.role}>
          {role.toUpperCase()} PANEL
        </p>

        <div style={styles.menu}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              label={item.label}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
            />
          ))}
        </div>

        {/* 🔓 LOGOUT */}
        <div
          style={styles.logout}
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          🚪 Logout
        </div>
      </div>
    </>
  );
}


/* 🔹 MENU ITEM */
function MenuItem({ label, onClick }) {
  return (
    <div
      onClick={onClick}
      style={styles.item}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#1e293b";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {label}
    </div>
  );
}


/* 🎨 STYLES */
const styles = {
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "240px",
    height: "100%",
    background: "rgba(15, 23, 42, 0.95)",
    backdropFilter: "blur(10px)",
    color: "white",
    padding: "20px",
    zIndex: 1001,
    transition: "0.3s ease"
  },

  logo: {
    marginBottom: "10px",
    fontWeight: "600",
    fontSize: "20px"
  },

  role: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "20px"
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  item: {
    cursor: "pointer",
    padding: "12px",
    borderRadius: "8px",
    transition: "0.2s",
    fontSize: "14px"
  },

  logout: {
    position: "absolute",
    bottom: "20px",
    left: "20px",
    right: "20px",
    padding: "12px",
    background: "#ef4444",
    textAlign: "center",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500"
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.3)",
    zIndex: 1000
  }
};
