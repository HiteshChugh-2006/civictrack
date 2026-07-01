import { useState } from "react";
import api from "../api";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const CATEGORIES = ["pothole", "waterlogging", "garbage", "streetlight", "drainage", "encroachment", "noise", "other"];
const PRIORITIES = [
  { val: "low", label: "🟢 Low", color: "#10b981" },
  { val: "medium", label: "🔵 Medium", color: "#3b82f6" },
  { val: "high", label: "🟠 High", color: "#f59e0b" },
  { val: "critical", label: "🔴 Critical", color: "#ef4444" },
];

export default function CreateIssue() {
  const [isOpen, setIsOpen] = useState(true);
  const [data, setData] = useState({ title: "", description: "", lat: "", lng: "", category: "other", priority: "medium", address: "" });
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: details, 2: location, 3: media

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        if (step === 2) setStep(3);
      },
      () => alert("Location access denied ❌")
    );
  };

  function LocationPicker() {
    useMapEvents({
      click(e) {
        setData(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
      }
    });
    return data.lat ? <Marker position={[data.lat, data.lng]} /> : null;
  }

  const handleImageSelect = (file) => {
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVideoSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) { alert("Please select a video file."); return; }
    if (file.size > 100 * 1024 * 1024) { alert("Video must be under 100MB."); return; }
    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.title || !data.description) { alert("Fill all fields ❗"); return; }
    if (!data.lat || !data.lng) { alert("Select location on map first ❗"); return; }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("priority", data.priority);
    formData.append("address", data.address);
    formData.append("location", JSON.stringify({ lat: data.lat, lng: data.lng }));
    if (image) formData.append("image", image);
    if (video) formData.append("video", video);

    try {
      await api.post("/issues", formData);
      setSuccess(true);
      setData({ title: "", description: "", lat: "", lng: "", category: "other", priority: "medium", address: "" });
      setImage(null); setVideo(null); setImagePreview(null); setVideoPreview(null);
      setStep(1);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert("Error submitting issue ❌");
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [
    { num: 1, label: "Details" },
    { num: 2, label: "Location" },
    { num: 3, label: "Evidence" },
  ];

  return (
    <div style={styles.wrapper}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{ ...styles.main, marginLeft: isOpen ? "240px" : "20px" }}>

        {/* Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>📍 Report Civic Issue</h1>
          <p style={styles.pageSub}>Help improve your city by reporting issues with location and evidence</p>
        </div>

        {/* Success Banner */}
        {success && (
          <div style={styles.successBanner}>
            <span style={{ fontSize: "24px" }}>🎉</span>
            <div>
              <div style={{ fontWeight: "700", fontSize: "16px" }}>Issue submitted successfully!</div>
              <div style={{ fontSize: "13px", opacity: 0.8 }}>Your report has been logged and will be reviewed shortly.</div>
            </div>
          </div>
        )}

        <div style={styles.layout}>
          {/* Form */}
          <div style={styles.formCard}>

            {/* Step Indicator */}
            <div style={styles.steps}>
              {STEPS.map((s) => (
                <div
                  key={s.num}
                  style={{ ...styles.stepItem, cursor: "pointer" }}
                  onClick={() => setStep(s.num)}
                >
                  <div style={{
                    ...styles.stepNum,
                    background: step >= s.num ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "rgba(255,255,255,0.06)",
                    color: step >= s.num ? "white" : "#475569",
                    boxShadow: step === s.num ? "0 0 15px rgba(59,130,246,0.5)" : "none"
                  }}>
                    {step > s.num ? "✓" : s.num}
                  </div>
                  <span style={{ ...styles.stepLabel, color: step >= s.num ? "#f0f6ff" : "#475569" }}>
                    {s.label}
                  </span>
                  {s.num < STEPS.length && (
                    <div style={{ ...styles.stepLine, background: step > s.num ? "#3b82f6" : "rgba(255,255,255,0.08)" }} />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>

              {/* Step 1: Details */}
              {step === 1 && (
                <div style={{ animation: "fadeInUp 0.4s ease" }}>
                  <input
                    className="glass-input"
                    placeholder="Issue Title (e.g., 'Massive pothole on Main St')"
                    value={data.title}
                    onChange={e => setData({ ...data, title: e.target.value })}
                    required
                  />

                  <textarea
                    className="glass-input"
                    placeholder="Describe the issue in detail — severity, duration, affected area..."
                    value={data.description}
                    onChange={e => setData({ ...data, description: e.target.value })}
                    style={{ minHeight: "120px", resize: "vertical" }}
                    required
                  />

                  {/* Category */}
                  <div style={styles.fieldLabel}>Category</div>
                  <div style={styles.chipGrid}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        style={{ ...styles.chip, ...(data.category === cat ? styles.chipActive : {}) }}
                        onClick={() => setData({ ...data, category: cat })}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Priority */}
                  <div style={styles.fieldLabel}>Priority Level</div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {PRIORITIES.map(p => (
                      <button
                        key={p.val}
                        type="button"
                        style={{
                          ...styles.priorityBtn,
                          borderColor: data.priority === p.val ? p.color : "rgba(255,255,255,0.08)",
                          background: data.priority === p.val ? `${p.color}15` : "rgba(255,255,255,0.03)",
                          color: data.priority === p.val ? p.color : "#64748b"
                        }}
                        onClick={() => setData({ ...data, priority: p.val })}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <input
                    className="glass-input"
                    placeholder="Address / Landmark (optional)"
                    value={data.address}
                    onChange={e => setData({ ...data, address: e.target.value })}
                    style={{ marginTop: "12px" }}
                  />

                  <button
                    type="button"
                    className="premium-btn"
                    onClick={() => setStep(2)}
                    disabled={!data.title || !data.description}
                    style={{ marginTop: "20px" }}
                  >
                    Next: Set Location →
                  </button>
                </div>
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <div style={{ animation: "fadeInUp 0.4s ease" }}>
                  <div style={styles.locationRow}>
                    <button type="button" style={styles.locationBtn} onClick={getLocation}>
                      📍 Use My GPS Location
                    </button>
                    <div style={styles.coordsDisplay}>
                      {data.lat ? (
                        <span style={{ color: "#10b981", fontWeight: "600" }}>
                          ✅ {data.lat.toFixed(4)}, {data.lng.toFixed(4)}
                        </span>
                      ) : (
                        <span style={{ color: "#475569" }}>Click map or use GPS</span>
                      )}
                    </div>
                  </div>

                  <div style={styles.map}>
                    <MapContainer key="civictrack-create-map" center={[30.7333, 76.7794]} zoom={13} style={{ height: "100%", borderRadius: "12px" }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© OpenStreetMap'
                      />
                      <LocationPicker />
                    </MapContainer>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                    <button type="button" style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
                    <button
                      type="button"
                      className="premium-btn"
                      onClick={() => setStep(3)}
                      disabled={!data.lat}
                      style={{ flex: 1 }}
                    >
                      Next: Add Evidence →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Evidence Upload */}
              {step === 3 && (
                <div style={{ animation: "fadeInUp 0.4s ease" }}>

                  {/* Image Upload */}
                  <div style={styles.fieldLabel}>📸 Photo Evidence</div>
                  <div
                    style={{ ...styles.dropZone, borderColor: drag ? "#3b82f6" : "rgba(255,255,255,0.1)" }}
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e => { e.preventDefault(); setDrag(false); handleImageSelect(e.dataTransfer.files[0]); }}
                  >
                    {imagePreview ? (
                      <div style={{ position: "relative" }}>
                        <img src={imagePreview} alt="preview" style={styles.preview} />
                        <button type="button" style={styles.removeBtn} onClick={() => { setImage(null); setImagePreview(null); }}>✕</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: "32px", marginBottom: "8px" }}>🖼️</div>
                        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px" }}>Drag & drop or click to upload photo</div>
                        <input type="file" accept="image/*" onChange={e => handleImageSelect(e.target.files[0])} style={{ display: "block", margin: "0 auto", color: "#94a3b8" }} />
                      </>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div style={{ ...styles.fieldLabel, marginTop: "16px" }}>📹 Video Evidence <span style={{ fontSize: "11px", color: "#475569", fontWeight: "400" }}>(max 100MB)</span></div>
                  <div style={{ ...styles.dropZone, borderColor: "rgba(255,255,255,0.1)" }}>
                    {videoPreview ? (
                      <div style={{ position: "relative" }}>
                        <video src={videoPreview} controls className="video-player" style={{ borderRadius: "8px" }} />
                        <button type="button" style={styles.removeBtn} onClick={() => { setVideo(null); setVideoPreview(null); }}>✕</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: "32px", marginBottom: "8px" }}>📹</div>
                        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px" }}>Upload video proof (MP4, MOV, WebM)</div>
                        <input type="file" accept="video/*" onChange={e => handleVideoSelect(e.target.files[0])} style={{ display: "block", margin: "0 auto", color: "#94a3b8" }} />
                      </>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <button type="button" style={styles.backBtn} onClick={() => setStep(2)}>← Back</button>
                    <button type="submit" className="premium-btn" disabled={loading} style={{ flex: 1 }}>
                      {loading ? "Submitting..." : "🚀 Submit Issue Report"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Info Panel */}
          <div style={styles.infoPanel}>
            <div style={styles.infoPanelCard}>
              <h3 style={styles.infoPanelTitle}>📋 Reporting Tips</h3>
              {[
                { icon: "📍", tip: "Use GPS or click the map to pin the exact location." },
                { icon: "📸", tip: "Photos greatly increase the chance of quick resolution." },
                { icon: "📹", tip: "Videos provide the best evidence for complex issues." },
                { icon: "🔴", tip: "Mark issues as Critical for urgent safety hazards." },
                { icon: "🗺️", tip: "Add address/landmark for faster field response." },
              ].map(({ icon, tip }) => (
                <div key={tip} style={styles.tipItem}>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.4" }}>{tip}</span>
                </div>
              ))}
            </div>

            <div style={styles.infoPanelCard}>
              <h3 style={styles.infoPanelTitle}>📊 Issue Categories</h3>
              {CATEGORIES.map(cat => (
                <div key={cat} style={styles.catItem}>
                  <div style={{ ...styles.catDot, background: { pothole: "#ef4444", waterlogging: "#3b82f6", garbage: "#78716c", streetlight: "#fbbf24", drainage: "#06b6d4", encroachment: "#8b5cf6", noise: "#f97316", other: "#94a3b8" }[cat] }} />
                  <span style={{ fontSize: "13px", color: "#64748b", textTransform: "capitalize" }}>{cat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", background: "#060b18", minHeight: "100vh" },
  main: { paddingTop: "84px", padding: "84px 24px 40px", width: "100%", transition: "margin-left 0.3s", boxSizing: "border-box" },
  pageHeader: { marginBottom: "28px" },
  pageTitle: { fontSize: "28px", fontWeight: "900", color: "#f0f6ff", margin: "0 0 6px", letterSpacing: "-0.5px" },
  pageSub: { fontSize: "14px", color: "#64748b", margin: 0 },
  successBanner: { display: "flex", gap: "16px", alignItems: "center", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px", color: "#6ee7b7" },
  layout: { display: "flex", gap: "24px", alignItems: "flex-start" },
  formCard: { flex: 1, background: "rgba(13, 21, 38, 0.9)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px", backdropFilter: "blur(20px)" },
  steps: { display: "flex", alignItems: "center", marginBottom: "28px" },
  stepItem: { display: "flex", alignItems: "center", flex: 1 },
  stepNum: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", flexShrink: 0, transition: "all 0.3s" },
  stepLabel: { fontSize: "12px", fontWeight: "600", marginLeft: "8px", whiteSpace: "nowrap" },
  stepLine: { flex: 1, height: "2px", marginLeft: "8px", transition: "background 0.3s" },
  fieldLabel: { fontSize: "13px", fontWeight: "600", color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" },
  chipGrid: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" },
  chip: { padding: "7px 14px", borderRadius: "100px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Outfit', sans-serif" },
  chipActive: { background: "rgba(59,130,246,0.15)", borderColor: "rgba(59,130,246,0.4)", color: "#60a5fa" },
  priorityBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s", fontFamily: "'Outfit', sans-serif" },
  locationRow: { display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" },
  locationBtn: { background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "10px", color: "#60a5fa", padding: "10px 16px", cursor: "pointer", fontWeight: "600", fontSize: "14px", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" },
  coordsDisplay: { fontSize: "13px", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", flex: 1 },
  map: { height: "320px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" },
  dropZone: { border: "2px dashed", borderRadius: "12px", padding: "24px", textAlign: "center", transition: "all 0.2s" },
  preview: { maxWidth: "100%", maxHeight: "200px", borderRadius: "8px", objectFit: "cover" },
  removeBtn: { position: "absolute", top: "8px", right: "8px", background: "rgba(239,68,68,0.9)", border: "none", borderRadius: "50%", width: "26px", height: "26px", color: "white", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
  backBtn: { padding: "13px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#94a3b8", fontWeight: "600", cursor: "pointer", fontFamily: "'Outfit', sans-serif" },
  infoPanel: { width: "280px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "84px" },
  infoPanelCard: { background: "rgba(13, 21, 38, 0.85)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" },
  infoPanelTitle: { fontSize: "14px", fontWeight: "700", color: "#f0f6ff", marginBottom: "14px", margin: "0 0 14px" },
  tipItem: { display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "12px" },
  catItem: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" },
  catDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
};
