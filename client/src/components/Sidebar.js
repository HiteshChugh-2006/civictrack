import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const role = user?.role || "user";

  const menus = {
    admin: [
      { label: "Dashboard", path: "/admin" },
      { label: "Manage Issues", path: "/admin/issues" },
      { label: "Map", path: "/map" }
    ],
    worker: [
      { label: "Dashboard", path: "/worker" },
      { label: "Tasks", path: "/worker" }
    ],
    user: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Report Issue", path: "/create" },
      { label: "My Issues", path: "/issues" },
      { label: "Map", path: "/map" }
    ]
  };

  const menuItems = menus[role] || menus.user; // ✅ SAFE FIX

  return (
    <>
      {/* OVERLAY */}
      {isOpen && (
        <div style={styles.overlay} onClick={() => setIsOpen(false)} />
      )}

      {/* SIDEBAR */}
      <div
        style={{
          ...styles.sidebar,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)"
        }}
      >
        <h2>CivicTrack</h2>

        {menuItems.map((item, i) => (
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

        {/* LOGOUT */}
        <div
          style={styles.logout}
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </div>
      </div>
    </>
  );
}

const styles = {
  sidebar: {
    position: "fixed",
    top: "60px", // ✅ FIX (don’t overlap navbar)
    left: 0,
    width: "220px",
    height: "calc(100% - 60px)", // ✅ FIX
    background: "#0f172a",
    color: "white",
    padding: "20px",
    zIndex: 1001,
    transition: "0.3s"
  },

  item: {
    padding: "10px",
    marginTop: "10px",
    cursor: "pointer"
  },

  logout: {
  position: "absolute",
  bottom: "60px", // 👈 move it up (you can tweak: 50–80px)
  left: "20px",
  right: "20px",
  background: "red",
  padding: "10px",
  textAlign: "center",
  cursor: "pointer",
  borderRadius: "6px"
},

  overlay: {
    position: "fixed",
    top: "60px", // ✅ FIX
    left: 0,
    width: "100%",
    height: "calc(100% - 60px)",
    background: "rgba(0,0,0,0.3)",
    zIndex: 1000
  }
};