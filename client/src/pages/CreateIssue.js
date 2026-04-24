import { useState } from "react";
import api from "../api"; // ✅ FIXED (lowercase)
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ FIX MARKER ICON
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function CreateIssue() {
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
    <div style={styles.container}>
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
              borderColor: drag ? "#3b82f6" : "#ccc"
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
  );
}

/* STYLES SAME AS YOURS */
