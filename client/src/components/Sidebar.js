import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen, role = "user" }) {
  const navigate = useNavigate();

  return (
    <>
      {/* 🔲 OVERLAY (for mobile) */}
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

        <div style={styles.menu}>

          {/* 🔥 ADMIN MENU */}
          {role === "admin" ? (
            <>
              <MenuItem label="📊 Dashboard" onClick={() => navigate("/admin")} />
              <MenuItem label="📋 Manage Issues" onClick={() => navigate("/admin")} />
              <MenuItem label="🗺️ Map Analytics" onClick={() => navigate("/map")} />
              <MenuItem label="ℹ️ About" onClick={() => navigate("/about")} />
            </>
          ) : (
            <>
              {/* 👤 USER MENU */}
              <MenuItem label="🏠 Dashboard" onClick={() => navigate("/dashboard")} />
              <MenuItem label="📍 Report Issue" onClick={() => navigate("/create")} />
              <MenuItem label="📊 My Issues" onClick={() => navigate("/issues")} />
              <MenuItem label="🗺️ Map" onClick={() => navigate("/map")} />
              <MenuItem label="ℹ️ About" onClick={() => navigate("/about")} />
            </>
          )}

        </div>
      </div>
    </>
  );
}


/* 🔹 MENU ITEM COMPONENT */
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
    width: "220px",
    height: "100%",
    background: "#0f172a",
    color: "white",
    padding: "20px",
    zIndex: 1001,
    transition: "0.3s ease"
  },

  logo: {
    marginBottom: "30px",
    fontWeight: "600"
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  item: {
    cursor: "pointer",
    padding: "10px",
    borderRadius: "6px",
    transition: "0.2s"
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