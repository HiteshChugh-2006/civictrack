import { useState } from "react";
import api from "../api"; // ✅ FIXED (lowercase)
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";

// ✅ FIX MARKER ICON
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function CreateIssue() {
  const [isOpen, setIsOpen] = useState(true);
  const [data, setData] = useState({
    title: "",
    description: "",
    lat: "",
    lng: ""
  });

  const [image, setImage] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 📍 AUTO LOCATION
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setData(prev => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }));
      },
      () => alert("Location access denied ❌")
    );
  };

  // 📍 MAP PICKER
  function LocationPicker() {
    useMapEvents({
      click(e) {
        setData(prev => ({
          ...prev,
          lat: e.latlng.lat,
          lng: e.latlng.lng
        }));
      }
    });

    return data.lat ? (
      <Marker position={[data.lat, data.lng]} />
    ) : null;
  }

  // 🚀 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.title || !data.description) {
      alert("Fill all fields ❗");
      return;
    }

    if (!data.lat || !data.lng) {
      alert("Select location ❗");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append(
      "location",
      JSON.stringify({ lat: data.lat, lng: data.lng })
    );

    if (image) formData.append("image", image);

    try {
      await api.post("/issues", formData); // ✅ FIXED

      setSuccess(true);
      setData({ title: "", description: "", lat: "", lng: "" });
      setImage(null);

      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      console.error(err);
      alert("Error submitting ❌");
    } finally {
      setLoading(false);
    }
  };

  // 📂 DRAG DROP
  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    setImage(e.dataTransfer.files[0]);
  };

  return (
    <div style={styles.wrapper}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{
        ...styles.main,
        marginLeft: isOpen ? "220px" : "20px"
      }}>
        <div style={styles.card}>

          <h2 style={styles.heading}>📍 Report Issue</h2>

          {success && (
            <div style={styles.successBox}>
              ✅ Issue submitted successfully!
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* TITLE */}
            <div style={styles.inputGroup}>
              <input
                value={data.title}
                placeholder=" "
                style={styles.input}
                onChange={(e) =>
                  setData({ ...data, title: e.target.value })
                }
              />
              <label style={styles.label}>Title</label>
            </div>

            {/* DESCRIPTION */}
            <div style={styles.inputGroup}>
              <textarea
                value={data.description}
                placeholder=" "
                style={styles.textarea}
                onChange={(e) =>
                  setData({ ...data, description: e.target.value })
                }
              />
              <label style={styles.label}>Description</label>
            </div>

            {/* LOCATION */}
            <button type="button" style={styles.locationBtn} onClick={getLocation}>
              📍 Use My Location
            </button>

            <div style={styles.map}>
              <MapContainer
                center={[30.7333, 76.7794]}
                zoom={13}
                style={{ height: "100%", borderRadius: "10px" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker />
              </MapContainer>
            </div>

            {data.lat && (
              <p style={styles.successText}>
                📍 {data.lat.toFixed(4)}, {data.lng.toFixed(4)}
              </p>
            )}

            {/* IMAGE */}
            <div
              style={{
                ...styles.drop,
                borderColor: drag ? "#3b82f6" : "rgba(255, 255, 255, 0.2)"
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
            >
              <p>📂 Drag & Drop Image</p>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>

            {image && (
              <img
                src={URL.createObjectURL(image)}
                style={styles.preview}
                alt="preview"
              />
            )}

            <button
              disabled={loading}
              style={styles.submit}
            >
              {loading ? "Submitting..." : "Submit Issue"}
            </button>

          </form>
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

  card: {
    background: "rgba(30, 41, 59, 0.45)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "30px",
    borderRadius: "18px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    margin: "0 auto",
    color: "#f8fafc"
  },

  heading: {
    marginBottom: "20px",
    fontWeight: "600",
    color: "#ffffff"
  },

  inputGroup: {
    position: "relative",
    marginBottom: "20px"
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "8px",
    background: "rgba(15, 23, 42, 0.6)",
    color: "#ffffff",
    outline: "none",
    boxSizing: "border-box"
  },

  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "8px",
    minHeight: "80px",
    background: "rgba(15, 23, 42, 0.6)",
    color: "#ffffff",
    outline: "none",
    boxSizing: "border-box"
  },

  label: {
    position: "absolute",
    top: "-8px",
    left: "10px",
    background: "#1e293b",
    padding: "0 5px",
    fontSize: "12px",
    color: "#94a3b8"
  },

  locationBtn: {
    marginBottom: "10px",
    padding: "10px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    width: "100%"
  },

  map: {
    height: "200px",
    marginBottom: "10px",
    borderRadius: "10px",
    overflow: "hidden"
  },

  successText: {
    color: "#4ade80",
    marginBottom: "10px",
    fontSize: "14px",
    fontWeight: "500"
  },

  drop: {
    border: "2px dashed rgba(255, 255, 255, 0.2)",
    padding: "20px",
    textAlign: "center",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "15px",
    background: "rgba(15, 23, 42, 0.4)",
    color: "#cbd5e1"
  },

  file: {
    marginTop: "10px"
  },

  preview: {
    width: "100%",
    marginBottom: "15px",
    borderRadius: "10px"
  },

  submit: {
    width: "100%",
    padding: "12px",
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600"
  },

  successBox: {
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
    color: "#4ade80"
  }
};
