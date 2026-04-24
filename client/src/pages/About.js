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
          <h3>💡 What it does</h3>
          <ul style={styles.list}>
            <li>📍 Report civic issues with precise location</li>
            <li>🗺️ View and track issues on live map</li>
            <li>👷 Admin assigns tasks to workers</li>
            <li>📊 Real-time issue status updates</li>
            <li>🤖 AI chatbot for guidance</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h3>🎯 Key Features</h3>
          <ul style={styles.list}>
            <li>📸 Image-based issue reporting</li>
            <li>🔐 Role-based dashboards (User / Admin / Worker)</li>
            <li>⚡ Live tracking system</li>
            <li>📦 Efficient issue lifecycle management</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h3>🌍 Vision</h3>
          <p style={styles.text}>
            Our goal is to build smarter cities by enabling faster
            communication between citizens and authorities, ensuring
            transparency, accountability, and efficient issue resolution.
          </p>
        </div>

        <div style={styles.footer}>
          <p>👨‍💻 Developed by <b>Hitesh Chugh</b></p>
          <p>🎓 Chandigarh University</p>
        </div>

      </div>
    </div>
  );
}


// 🎨 IMPROVED STYLES
const styles = {
  container: {
    padding: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
    minHeight: "100vh"
  },

  card: {
    maxWidth: "650px",
    width: "100%",
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(12px)",
    padding: "35px",
    borderRadius: "18px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
    transition: "0.3s"
  },

  title: {
    fontSize: "28px",
    marginBottom: "10px"
  },

  subtitle: {
    color: "#64748b",
    marginBottom: "25px",
    fontSize: "15px",
    lineHeight: "1.6"
  },

  section: {
    marginTop: "25px"
  },

  list: {
    paddingLeft: "20px",
    marginTop: "10px",
    lineHeight: "1.7"
  },

  text: {
    marginTop: "10px",
    lineHeight: "1.6",
    color: "#334155"
  },

  footer: {
    marginTop: "30px",
    paddingTop: "15px",
    borderTop: "1px solid #e2e8f0",
    textAlign: "center",
    color: "#475569",
    fontSize: "14px"
  }
};
