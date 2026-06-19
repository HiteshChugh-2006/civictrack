export default function About() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h1 style={styles.title}>🚀 CivicTrack</h1>

        <p style={styles.subtitle}>
          Smart Civic Issue Management Platform that connects citizens,
          workers, and authorities seamlessly.
        </p>

        <div style={styles.section}>
          <h3 style={styles.sectionHeading}>💡 What it does</h3>
          <ul style={styles.list}>
            <li>📍 Report civic issues with precise location</li>
            <li>🗺️ View and track issues on live map</li>
            <li>👷 Admin assigns tasks to workers</li>
            <li>📊 Real-time issue status updates</li>
            <li>🤖 AI chatbot for guidance</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionHeading}>🎯 Key Features</h3>
          <ul style={styles.list}>
            <li>📸 Image-based issue reporting</li>
            <li>🔐 Role-based dashboards (User / Admin / Worker)</li>
            <li>⚡ Live tracking system</li>
            <li>📦 Efficient issue lifecycle management</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionHeading}>🌍 Vision</h3>
          <p style={styles.text}>
            Our goal is to build smarter cities by enabling faster
            communication between citizens and authorities, ensuring
            transparency, accountability, and efficient issue resolution.
          </p>
        </div>

        <div style={styles.footer}>
          <p style={{ margin: "4px 0" }}>👨‍💻 Developed by <b style={{ color: "#ffffff" }}>Hitesh Chugh</b></p>
          <p style={{ margin: "4px 0" }}>🎓 Chandigarh University</p>
        </div>

      </div>
    </div>
  );
}

// 🎨 PREMIUM DARK GLASSMORPHIC STYLES
const styles = {
  container: {
    padding: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)",
    minHeight: "100vh",
    color: "#f8fafc"
  },

  card: {
    maxWidth: "650px",
    width: "100%",
    background: "rgba(30, 41, 59, 0.45)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "35px",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.35)",
    transition: "0.3s"
  },

  title: {
    fontSize: "28px",
    marginBottom: "10px",
    color: "#ffffff",
    fontWeight: "700"
  },

  subtitle: {
    color: "#94a3b8",
    marginBottom: "25px",
    fontSize: "15px",
    lineHeight: "1.6"
  },

  section: {
    marginTop: "25px"
  },

  sectionHeading: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "10px"
  },

  list: {
    paddingLeft: "20px",
    marginTop: "10px",
    lineHeight: "1.7",
    color: "#cbd5e1"
  },

  text: {
    marginTop: "10px",
    lineHeight: "1.6",
    color: "#cbd5e1"
  },

  footer: {
    marginTop: "30px",
    paddingTop: "15px",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px"
  }
};
