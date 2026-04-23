import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import axios from "axios";

// 🔥 FIX ICON ISSUE
delete L.Icon.Default.prototype._getIconUrl;

const createIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

const icons = {
  pending: createIcon("orange"),
  "in-progress": createIcon("blue"),
  resolved: createIcon("green"),
};

export default function MapView() {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchIssues();

    const interval = setInterval(fetchIssues, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchIssues = async () => {
    const res = await axios.get("/api/issues", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    setIssues(res.data);
  };

  // 🔍 FILTER
  const filteredIssues = issues.filter(
    (i) => filter === "all" || i.status === filter
  );

  return (
    <div style={styles.container}>
      <h2>🗺️ Smart Issue Map</h2>

      {/* 🔍 FILTER BAR */}
      <div style={styles.filterBar}>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
        <button onClick={() => setFilter("in-progress")}>In Progress</button>
        <button onClick={() => setFilter("resolved")}>Resolved</button>
      </div>

      <MapContainer
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
              eventHandlers={{
                click: () => setSelected(i),
              }}
            >
              <Popup>
                <div style={{ width: "200px" }}>
                  <b>{i.title}</b>
                  <p style={{ fontSize: "12px" }}>{i.description}</p>

                  {i.image && (
                    <img
                      src={`/api/${i.image}`}
                      alt="issue"
                      style={styles.image}
                    />
                  )}

                  <p style={{ fontSize: "11px" }}>
                    Status: {i.status}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {/* 📌 SIDE PANEL */}
      {selected && (
        <div style={styles.panel}>
          <h3>{selected.title}</h3>
          <p>{selected.description}</p>

          {selected.image && (
            <img
              src={`/api/uploads/${selected.image}`}
              alt=""
              style={{ width: "100%", borderRadius: "10px" }}
            />
          )}

          <p>Status: {selected.status}</p>

          <button onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
}


// 🎨 STYLES
const styles = {
  container: {
    padding: "20px",
    position: "relative"
  },

  filterBar: {
    marginBottom: "10px",
    display: "flex",
    gap: "10px"
  },

  map: {
    height: "80vh",
    borderRadius: "12px"
  },

  panel: {
    position: "absolute",
    right: "20px",
    top: "80px",
    width: "250px",
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  },

  image: {
    width: "100%",
    borderRadius: "8px",
    marginTop: "5px"
  }
};