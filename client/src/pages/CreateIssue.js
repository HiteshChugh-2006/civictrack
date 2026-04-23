import { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
        setData({
          ...data,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => alert("Location access denied ❌")
    );
  };

  // 📍 MANUAL MAP PICKER
  function LocationPicker() {
    useMapEvents({
      click(e) {
        setData({
          ...data,
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      }
    });

    return data.lat ? (
      <Marker position={[data.lat, data.lng]} />
    ) : null;
  }

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
      await axios.post("http://localhost:5000/api/issues", formData, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      setSuccess(true);

      // reset
      setData({ title: "", description: "", lat: "", lng: "" });
      setImage(null);

      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      alert("Error submitting ❌");
    }

    setLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    setImage(file);
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

          {/* LOCATION BUTTON */}
          <button
            type="button"
            style={styles.locationBtn}
            onClick={getLocation}
          >
            📍 Use My Location
          </button>

          {/* MAP */}
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
              📍 Selected: {data.lat.toFixed(4)}, {data.lng.toFixed(4)}
            </p>
          )}

          {/* DRAG DROP */}
          <div
            style={{
              ...styles.drop,
              borderColor: drag ? "#3b82f6" : "#ccc",
              background: drag ? "#eff6ff" : "#fafafa"
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
          >
            <p>📂 Drag & Drop Image or Click</p>
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              style={styles.file}
            />
          </div>

          {/* PREVIEW */}
          {image && (
            <img
              src={URL.createObjectURL(image)}
              style={styles.preview}
              alt="preview"
            />
          )}

          {/* SUBMIT */}
          <button
            disabled={loading}
            style={{
              ...styles.submit,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Submitting..." : "Submit Issue"}
          </button>

        </form>
      </div>
    </div>
  );
}
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "40px",
    background: "#f1f5f9",
    minHeight: "100vh"
  },

  card: {
    background: "white",
    padding: "30px",
    borderRadius: "14px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },

  heading: {
    marginBottom: "20px"
  },

  inputGroup: {
    position: "relative",
    marginBottom: "20px"
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px"
  },

  textarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    minHeight: "80px"
  },

  label: {
    position: "absolute",
    top: "-8px",
    left: "10px",
    background: "white",
    padding: "0 5px",
    fontSize: "12px"
  },

  locationBtn: {
    marginBottom: "10px",
    padding: "10px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },

  map: {
    height: "200px",
    marginBottom: "10px"
  },

  successText: {
    color: "green",
    marginBottom: "10px"
  },

  drop: {
    border: "2px dashed #ccc",
    padding: "20px",
    textAlign: "center",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "15px"
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
    cursor: "pointer"
  },

  successBox: {
    background: "#dcfce7",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px"
  }
};

// 🎨 EXTRA STYLE ADD
styles.map = {
  height: "200px",
  marginBottom: "10px"
};