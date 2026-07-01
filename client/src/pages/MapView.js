import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import API from "../api"; // ✅ FIXED
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";

// 🎯 ICON CREATOR
const createIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

const icons = {
  pending: createIcon("orange"),
  "in-progress": createIcon("blue"),
  resolved: createIcon("green"),
};

export default function MapView() {
  const BASE_URL = process.env.REACT_APP_API_URL || "";
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await API.get("/issues/all"); // ✅ FIXED
      setIssues(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔍 FILTER
  const filteredIssues = issues.filter(
    (i) => filter === "all" || i.status === filter
  );

  return (
    <div style={styles.wrapper}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{
        ...styles.main,
        marginLeft: isOpen ? "220px" : "20px"
      }}>
        <h2 style={styles.title}>🗺️ Smart Issue Map</h2>

        {/* FILTER */}
        <div style={styles.filterBar}>
          <button
            style={{
              ...styles.filterBtn,
              background: filter === "all" ? "#3b82f6" : "rgba(30, 41, 59, 0.45)",
              border: filter === "all" ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.08)"
            }}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            style={{
              ...styles.filterBtn,
              background: filter === "pending" ? "#f59e0b" : "rgba(30, 41, 59, 0.45)",
              border: filter === "pending" ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.08)"
            }}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            style={{
              ...styles.filterBtn,
              background: filter === "in-progress" ? "#2563eb" : "rgba(30, 41, 59, 0.45)",
              border: filter === "in-progress" ? "1px solid #2563eb" : "1px solid rgba(255,255,255,0.08)"
            }}
            onClick={() => setFilter("in-progress")}
          >
            In Progress
          </button>
          <button
            style={{
              ...styles.filterBtn,
              background: filter === "resolved" ? "#22c55e" : "rgba(30, 41, 59, 0.45)",
              border: filter === "resolved" ? "1px solid #22c55e" : "1px solid rgba(255,255,255,0.08)"
            }}
            onClick={() => setFilter("resolved")}
          >
            Resolved
          </button>
        </div>

        <div style={styles.mapContainer}>
          <MapContainer
            key="civictrack-main-map"
            center={[30.7333, 76.7794]}
            zoom={13}
            style={styles.map}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {filteredIssues.map((i) => (
              i.location && (
                <Marker
                  key={i._id}
                  position={[i.location.lat, i.location.lng]}
                  icon={icons[i.status] || icons.pending}
                >
                  <Popup>
                    <div style={styles.popupContent}>
                      <b style={styles.popupTitle}>{i.title}</b>
                      <p style={styles.popupDesc}>{i.description}</p>

                      {i.image && (
                        <img
                          src={`${BASE_URL}/uploads/${i.image}`}
                          style={styles.image}
                          alt=""
                        />
                      )}

                      <p style={styles.popupStatus}>
                        Status: <span style={{ textTransform: "capitalize", fontWeight: "bold" }}>{i.status}</span>
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    background: "#0f172a",
    minHeight: "100vh",
    color: "#f8fafc"
  },

  main: {
    padding: "30px",
    width: "100%",
    marginTop: "60px",
    transition: "0.3s"
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#ffffff"
  },

  filterBar: {
    marginBottom: "20px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  filterBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s ease"
  },

  mapContainer: {
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255, 255, 255, 0.08)"
  },

  map: {
    height: "75vh",
    width: "100%"
  },

  image: {
    width: "100%",
    borderRadius: "8px",
    marginTop: "8px",
    maxHeight: "120px",
    objectFit: "cover"
  },

  popupContent: {
    width: "200px",
    color: "#1e293b",
    fontSize: "13px"
  },

  popupTitle: {
    fontSize: "15px",
    color: "#0f172a"
  },

  popupDesc: {
    margin: "6px 0",
    color: "#475569"
  },

  popupStatus: {
    margin: "6px 0 0 0",
    color: "#0f172a"
  }
};