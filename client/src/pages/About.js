export default function About() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h1>🚀 CivicTrack</h1>
        <p style={styles.subtitle}>
          Smart Civic Issue Management Platform
        </p>

        <div style={styles.section}>
          <h3>💡 What it does</h3>
          <ul>
            <li>📍 Report civic issues with location</li>
            <li>🗺️ Track issues on live map</li>
            <li>👷 Assign workers (Admin)</li>
            <li>📊 Real-time status updates</li>
            <li>🤖 AI Chatbot support</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h3>🎯 Features</h3>
          <ul>
            <li>Image-based reporting</li>
            <li>Role-based dashboards</li>
            <li>Live tracking system</li>
            <li>Smart issue management</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h3>🌍 Vision</h3>
          <p>
            To create smarter cities by connecting citizens,
            workers, and authorities into one seamless system.
          </p>
        </div>

      </div>
    </div>
  );
}


// ✅ REQUIRED STYLES (THIS WAS MISSING)
const styles = {
  container: {
    padding: "40px",
    display: "flex",
    justifyContent: "center",
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
    minHeight: "100vh"
  },

  card: {
    maxWidth: "600px",
    width: "100%",
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(12px)",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },

  subtitle: {
    color: "#64748b",
    marginBottom: "20px"
  },

  section: {
    marginTop: "20px"
  }
};
