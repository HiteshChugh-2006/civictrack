import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import { useNavigate } from "react-router-dom";

const CAMERAS = [
  { id: 1, name: "Main Intersection A", zone: "Sector 17", status: "live" },
  { id: 2, name: "Market Street Cam", zone: "Sector 22", status: "live" },
  { id: 3, name: "Park Entry Gate", zone: "Sector 9", status: "live" },
  { id: 4, name: "Highway Overpass", zone: "NH-5 Bridge", status: "live" },
  { id: 5, name: "Water Treatment Plant", zone: "Sector 4", status: "live" },
  { id: 6, name: "City Hall Plaza", zone: "Central District", status: "live" },
];

const ANOMALIES = [
  { label: "Pothole Detected", color: "#ef4444", tier: "critical" },
  { label: "Waterlogging", color: "#3b82f6", tier: "high" },
  { label: "Debris on Road", color: "#f59e0b", tier: "medium" },
  { label: "Stray Animals", color: "#f97316", tier: "medium" },
  { label: "Illegal Parking", color: "#8b5cf6", tier: "low" },
  { label: "Garbage Dump", color: "#78716c", tier: "high" },
  { label: "Street Light Out", color: "#fbbf24", tier: "medium" },
  { label: "Clear", color: "#10b981", tier: "clear" },
];

function CameraFeed({ camera }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const boxRef = useRef({ x: 80, y: 60, w: 120, h: 80, vx: 0.6, vy: 0.4, anomaly: ANOMALIES[Math.floor(Math.random() * ANOMALIES.length)], confidence: Math.floor(Math.random() * 15) + 82, timer: 0 });
  const [currentAnomaly, setCurrentAnomaly] = useState(boxRef.current.anomaly);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const box = boxRef.current;

    // Background "scene" colors for each camera
    const bg = [
      ["#1a2235", "#0f1825"],
      ["#1f2030", "#111520"],
      ["#1a2530", "#0d1a22"],
      ["#201a30", "#150f20"],
      ["#1a2520", "#0f1a10"],
      ["#22201a", "#18150e"],
    ][camera.id - 1] || ["#1a2235", "#0f1825"];

    const draw = (ts) => {
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, bg[0]);
      grad.addColorStop(1, bg[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Simulated scene elements (roads, objects)
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fillRect(0, H * 0.55, W, H * 0.45);
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(W * 0.2 * i + W * 0.05, H * 0.6, W * 0.12, H * 0.3);
      }

      // Scanline overlay
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      for (let y = 0; y < H; y += 3) {
        ctx.fillRect(0, y, W, 1);
      }

      // Update box position
      box.timer++;
      box.x += box.vx;
      box.y += box.vy;
      if (box.x < 10 || box.x + box.w > W - 10) { box.vx *= -1; box.x = Math.max(10, Math.min(W - box.w - 10, box.x)); }
      if (box.y < 25 || box.y + box.h > H - 25) { box.vy *= -1; box.y = Math.max(25, Math.min(H - box.h - 25, box.y)); }

      // Periodically change anomaly
      if (box.timer % 200 === 0) {
        box.anomaly = ANOMALIES[Math.floor(Math.random() * ANOMALIES.length)];
        box.confidence = Math.floor(Math.random() * 15) + 82;
        setCurrentAnomaly(box.anomaly);
      }

      const a = box.anomaly;
      const isClear = a.tier === "clear";

      if (!isClear) {
        // Bounding box with glow
        ctx.shadowBlur = 12;
        ctx.shadowColor = a.color;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(box.x, box.y, box.w, box.h);
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // Corner accents
        const cLen = 12;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 3;
        // TL
        ctx.beginPath(); ctx.moveTo(box.x, box.y + cLen); ctx.lineTo(box.x, box.y); ctx.lineTo(box.x + cLen, box.y); ctx.stroke();
        // TR
        ctx.beginPath(); ctx.moveTo(box.x + box.w - cLen, box.y); ctx.lineTo(box.x + box.w, box.y); ctx.lineTo(box.x + box.w, box.y + cLen); ctx.stroke();
        // BL
        ctx.beginPath(); ctx.moveTo(box.x, box.y + box.h - cLen); ctx.lineTo(box.x, box.y + box.h); ctx.lineTo(box.x + cLen, box.y + box.h); ctx.stroke();
        // BR
        ctx.beginPath(); ctx.moveTo(box.x + box.w - cLen, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h - cLen); ctx.stroke();

        // Label pill
        ctx.fillStyle = a.color;
        ctx.fillRect(box.x, box.y - 20, box.w, 20);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px Outfit, sans-serif";
        ctx.fillText(`${a.label} — ${box.confidence}%`, box.x + 4, box.y - 5);
      }

      // HUD overlay
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, W, 24);
      ctx.fillRect(0, H - 24, W, 24);

      // Top HUD: timestamp + REC
      ctx.fillStyle = "#ff4444";
      ctx.beginPath();
      ctx.arc(8, 12, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.fillText(new Date().toLocaleTimeString(), 18, 16);
      ctx.fillText("● REC", W - 42, 16);

      // Bottom HUD: camera info
      ctx.fillStyle = "#06b6d4";
      ctx.font = "9px Outfit, sans-serif";
      ctx.fillText(`CAM-${camera.id.toString().padStart(2, "0")}  ${camera.zone.toUpperCase()}`, 6, H - 8);
      ctx.fillStyle = isClear ? "#10b981" : a.color;
      ctx.fillText(isClear ? "✓ CLEAR" : "⚠ ANOMALY", W - 75, H - 8);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [camera.id, camera.zone]);

  return (
    <div style={styles.feedCard}>
      <canvas
        ref={canvasRef}
        width={320}
        height={200}
        style={{ width: "100%", height: "auto", borderRadius: "10px 10px 0 0", display: "block" }}
      />
      <div style={styles.feedFooter}>
        <div>
          <div style={styles.feedName}>{camera.name}</div>
          <div style={styles.feedZone}>{camera.zone}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <div style={{ ...styles.liveDot, background: "#10b981", boxShadow: "0 0 6px #10b981" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
            LIVE
          </div>
          <div style={{ ...styles.anomalyChip, color: currentAnomaly.color, borderColor: `${currentAnomaly.color}40` }}>
            {currentAnomaly.tier === "clear" ? "✓ Clear" : `⚠ ${currentAnomaly.tier.toUpperCase()}`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveFeed() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const generateAlert = () => {
      const cam = CAMERAS[Math.floor(Math.random() * CAMERAS.length)];
      const anomaly = ANOMALIES.filter(a => a.tier !== "clear")[Math.floor(Math.random() * (ANOMALIES.length - 1))];
      const newAlert = {
        id: Date.now(),
        cam: cam.name,
        zone: cam.zone,
        anomaly: anomaly.label,
        tier: anomaly.tier,
        color: anomaly.color,
        confidence: Math.floor(Math.random() * 15) + 82,
        time: new Date().toLocaleTimeString()
      };
      setAlerts(prev => [newAlert, ...prev].slice(0, 20));
      setAlertCount(prev => prev + 1);
    };

    const interval = setInterval(generateAlert, 4000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.wrapper}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{ ...styles.main, marginLeft: isOpen ? "240px" : "20px" }}>

        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <div style={styles.pageBadge}>📹 AI SURVEILLANCE</div>
            <h1 style={styles.pageTitle}>City Live Feed</h1>
            <p style={styles.pageSub}>Real-time AI anomaly detection across {CAMERAS.length} municipal camera zones</p>
          </div>
          <div style={styles.headerStats}>
            <div style={styles.headerStat}>
              <div style={styles.headerStatVal}>{CAMERAS.length}</div>
              <div style={styles.headerStatLabel}>Cameras Online</div>
            </div>
            <div style={styles.headerStat}>
              <div style={{ ...styles.headerStatVal, color: "#ef4444" }}>{alertCount}</div>
              <div style={styles.headerStatLabel}>Alerts Today</div>
            </div>
          </div>
        </div>

        {/* Live Grid + Alerts */}
        <div style={styles.content}>

          {/* Camera Grid */}
          <div style={styles.cameraGrid}>
            {CAMERAS.map(cam => <CameraFeed key={cam.id} camera={cam} />)}
          </div>

          {/* Alerts Panel */}
          <div style={styles.alertsPanel}>
            <div style={styles.alertsHeader}>
              <span style={styles.alertsTitle}>🔴 Live Alerts</span>
              <span style={{ ...styles.alertsBadge, background: alerts.length > 0 ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", color: alerts.length > 0 ? "#f87171" : "#6ee7b7", borderColor: alerts.length > 0 ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)" }}>
                {alerts.length} events
              </span>
            </div>
            <div style={styles.alertsList}>
              {alerts.length === 0 ? (
                <div style={styles.noAlerts}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
                  <div>All systems clear</div>
                </div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} style={{ ...styles.alertItem, borderLeftColor: alert.color }}>
                    <div style={styles.alertTop}>
                      <span style={{ ...styles.alertBadge, background: `${alert.color}20`, color: alert.color, borderColor: `${alert.color}40` }}>
                        {alert.tier.toUpperCase()}
                      </span>
                      <span style={styles.alertTime}>{alert.time}</span>
                    </div>
                    <div style={styles.alertLabel}>{alert.anomaly}</div>
                    <div style={styles.alertMeta}>📍 {alert.cam} · {alert.zone}</div>
                    <div style={styles.alertConfidence}>Confidence: {alert.confidence}%</div>
                    <button
                      style={styles.alertAction}
                      onClick={() => navigate("/create")}
                    >
                      File Report →
                    </button>
                  </div>
                ))
              )}
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
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "16px" },
  pageBadge: { display: "inline-block", background: "rgba(6,182,212,0.12)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)", borderRadius: "100px", padding: "4px 12px", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", marginBottom: "8px" },
  pageTitle: { fontSize: "30px", fontWeight: "900", color: "#f0f6ff", letterSpacing: "-1px", margin: "0 0 4px" },
  pageSub: { fontSize: "14px", color: "#64748b", margin: 0 },
  headerStats: { display: "flex", gap: "20px" },
  headerStat: { textAlign: "right" },
  headerStatVal: { fontSize: "28px", fontWeight: "800", color: "#10b981", fontFamily: "JetBrains Mono, monospace", lineHeight: 1 },
  headerStatLabel: { fontSize: "11px", color: "#475569", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" },
  content: { display: "flex", gap: "20px", alignItems: "flex-start" },
  cameraGrid: { flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" },
  feedCard: { background: "rgba(13, 21, 38, 0.9)", border: "1px solid rgba(6,182,212,0.12)", borderRadius: "12px", overflow: "hidden", transition: "all 0.25s", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" },
  feedFooter: { padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  feedName: { fontSize: "13px", fontWeight: "700", color: "#f0f6ff" },
  feedZone: { fontSize: "11px", color: "#475569", marginTop: "2px" },
  liveDot: { display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", fontWeight: "700", color: "#10b981", padding: "3px 8px", borderRadius: "100px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" },
  anomalyChip: { fontSize: "10px", fontWeight: "600", padding: "2px 7px", borderRadius: "100px", border: "1px solid" },
  alertsPanel: { width: "280px", flexShrink: 0, background: "rgba(13, 21, 38, 0.9)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden", position: "sticky", top: "84px", maxHeight: "calc(100vh - 120px)", display: "flex", flexDirection: "column" },
  alertsHeader: { padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" },
  alertsTitle: { fontSize: "14px", fontWeight: "700", color: "#f0f6ff" },
  alertsBadge: { fontSize: "11px", fontWeight: "600", padding: "3px 8px", borderRadius: "100px", border: "1px solid" },
  alertsList: { flex: 1, overflowY: "auto", padding: "8px" },
  noAlerts: { textAlign: "center", padding: "40px 20px", color: "#475569", fontSize: "13px" },
  alertItem: { padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderLeft: "3px solid", marginBottom: "8px" },
  alertTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
  alertBadge: { fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "100px", border: "1px solid" },
  alertTime: { fontSize: "10px", color: "#475569" },
  alertLabel: { fontSize: "13px", fontWeight: "700", color: "#f0f6ff", marginBottom: "4px" },
  alertMeta: { fontSize: "11px", color: "#64748b", marginBottom: "4px" },
  alertConfidence: { fontSize: "10px", color: "#475569", marginBottom: "8px" },
  alertAction: { fontSize: "11px", fontWeight: "700", color: "#3b82f6", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "6px", padding: "5px 10px", cursor: "pointer", width: "100%", fontFamily: "'Outfit', sans-serif" }
};
