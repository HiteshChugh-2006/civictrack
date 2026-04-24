import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import API from "../api"; // ✅ FIXED

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

  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await API.get("/api/issues"); // ✅ FIXED
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
    <div style={styles.container}>
      <h2>🗺️ Smart Issue Map</h2>

      {/* FILTER */}
      <div style={styles.filterBar}>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
        <button onClick={() => setFilter("in-progress")}>
          In Progress
        </button>
        <button onClick={() => setFilter("resolved")}>
          Resolved
        </button>
      </div>

      <MapContainer
        center={[30.7333, 76.7794]}
        zoom={13}
        style={styles.map}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {filteredIssues.map((i) =>
          i.location ? (
            <Marker
              key={i._id}
              position={[i.location.lat, i.location.lng]}
              icon={icons[i.status] || icons.pending}
            >
              <Popup>
                <b>{i.title}</b>
                <p>{i.description}</p>

                {i.image && (
                  <img
                    src={`${BASE_URL}/uploads/${issue.image}`}
                    style={styles.image}
                    alt=""
                  />
                )}

                <p>Status: {i.status}</p>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}

// 🎨 STYLES (UNCHANGED)
const styles = {
  container: {
    padding: "20px",
  },

  filterBar: {
    marginBottom: "10px",
    display: "flex",
    gap: "10px",
  },

  map: {
    height: "80vh",
    borderRadius: "12px",
  },

  image: {
    width: "100%",
    borderRadius: "8px",
    marginTop: "5px",
  },
};