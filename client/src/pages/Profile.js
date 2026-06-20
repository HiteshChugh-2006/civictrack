import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import api from "../api";

export default function Profile() {
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2FA state
  const [setup2FA, setSetup2FA] = useState(null); // { secret, qrUrl }
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      const res = await api.get("/users/profile/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load profile stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Google 2FA initialization
  const init2FASetup = async () => {
    try {
      setErrorMessage("");
      const res = await api.post("/auth/2fa/setup");
      setSetup2FA(res.data);
    } catch (err) {
      setErrorMessage("Failed to start 2FA setup");
    }
  };

  // Verify and enable Google 2FA
  const handleVerifyEnable2FA = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit code");
      return;
    }

    try {
      setVerifying(true);
      setErrorMessage("");
      await api.post("/auth/2fa/verify", { code: verificationCode });
      
      // Update local storage user state
      const updatedUser = { ...user, twoFactorEnabled: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSetup2FA(null);
      setVerificationCode("");
      alert("Two-Factor Authentication enabled successfully! 🔐");
    } catch (err) {
      setErrorMessage(err.response?.data || "Verification failed. Check code.");
    } finally {
      setVerifying(false);
    }
  };

  // Disable Google 2FA
  const handleDisable2FA = async () => {
    if (!window.confirm("Are you sure you want to disable 2FA? This decreases account security.")) return;

    try {
      await api.post("/auth/2fa/disable");
      const updatedUser = { ...user, twoFactorEnabled: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert("Two-Factor Authentication disabled.");
    } catch (err) {
      alert("Failed to disable 2FA.");
    }
  };

  // List of all citizen and worker badges for showcase
  const citizenBadgeCatalog = [
    { id: "civic_starter", title: "🥉 Civic Starter", desc: "Reported your first city issue!" },
    { id: "active_observer", title: "🥈 Active Observer", desc: "Reported 5+ city issues." },
    { id: "city_sentinel", title: "🥇 City Sentinel", desc: "Reported 10+ city issues." },
    { id: "community_favorite", title: "🌟 Community Favorite", desc: "Received 5+ upvotes on an issue." },
    { id: "civic_hero", title: "🏆 Civic Hero", desc: "Had 3+ reported issues successfully resolved." }
  ];

  const workerBadgeCatalog = [
    { id: "first_strike", title: "⚡ First Strike", desc: "Resolved your first task!" },
    { id: "swift_resolver", title: "🏃 Swift Resolver", desc: "Successfully resolved 5+ issues." },
    { id: "master_artisan", title: "👑 Master Artisan", desc: "Successfully resolved 10+ issues." }
  ];

  const catalog = user.role === "worker" ? workerBadgeCatalog : citizenBadgeCatalog;
  const unlockedBadgeIds = stats?.badges?.map(b => b.id) || [];

  return (
    <div style={styles.wrapper}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Navbar setIsOpen={setIsOpen} />

      <div style={{
        ...styles.main,
        marginLeft: isOpen ? "220px" : "20px"
      }}>
        <h1 style={styles.heading}>👤 My Profile</h1>
        <p style={styles.subtitle}>Manage your account settings, view achievements, and secure your credentials.</p>

        <div style={styles.grid}>
          {/* USER INFO & STATS */}
          <div style={styles.leftCol}>
            <div style={styles.card}>
              <div style={styles.profileHeader}>
                <div style={styles.avatar}>
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <h2 style={styles.userName}>{user.name}</h2>
                  <span style={styles.userRoleBadge}>{user.role}</span>
                </div>
              </div>

              <div style={styles.infoList}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Email Address</span>
                  <span style={styles.infoValue}>{user.email}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Account Status</span>
                  <span style={{ ...styles.infoValue, color: "#4ade80" }}>Verified ✔️</span>
                </div>
              </div>
            </div>

            {/* PERFORMANCE METRICS */}
            <div style={styles.card}>
              <h3 style={styles.cardHeading}>📊 Performance Statistics</h3>
              {loading ? (
                <p style={{ color: "#94a3b8" }}>Loading statistics...</p>
              ) : stats ? (
                <div style={styles.statsGrid}>
                  {user.role === "worker" ? (
                    <>
                      <div style={styles.statBox}>
                        <span style={styles.statVal}>{stats.totalTasks}</span>
                        <span style={styles.statLabel}>Assigned Tasks</span>
                      </div>
                      <div style={styles.statBox}>
                        <span style={styles.statVal}>{stats.resolvedTasks}</span>
                        <span style={styles.statLabel}>Resolved Tasks</span>
                      </div>
                      <div style={styles.statBox}>
                        <span style={styles.statVal}>{stats.completionRate}%</span>
                        <span style={styles.statLabel}>Completion Rate</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={styles.statBox}>
                        <span style={styles.statVal}>{stats.totalReported}</span>
                        <span style={styles.statLabel}>Issues Reported</span>
                      </div>
                      <div style={styles.statBox}>
                        <span style={styles.statVal}>{stats.resolvedReported}</span>
                        <span style={styles.statLabel}>Issues Resolved</span>
                      </div>
                      <div style={styles.statBox}>
                        <span style={styles.statVal}>🗳️ {stats.totalUpvotes}</span>
                        <span style={styles.statLabel}>Upvotes Received</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p style={{ color: "#ef4444" }}>Could not load stats.</p>
              )}
            </div>
          </div>

          {/* SECURITY & 2FA */}
          <div style={styles.rightCol}>
            <div style={styles.card}>
              <h3 style={styles.cardHeading}>🔐 Two-Factor Authentication (2FA)</h3>
              <p style={styles.cardDesc}>Secure your login with Google Authenticator OTP verification.</p>

              {user.twoFactorEnabled ? (
                <div style={styles.status2FA}>
                  <div style={styles.badge2FAEnabled}>2FA Active 🔐</div>
                  <p style={{ color: "#cbd5e1", fontSize: "13px", marginTop: "10px" }}>
                    Your account is highly secure. You will be prompted to enter a 6-digit verification code from Google Authenticator when logging in.
                  </p>
                  <button style={styles.disableBtn} onClick={handleDisable2FA}>Disable 2FA</button>
                </div>
              ) : (
                <div>
                  <p style={{ color: "#cbd5e1", fontSize: "13px", marginBottom: "15px" }}>
                    Two-Factor Authentication is currently disabled. Enable it to prevent unauthorized login attempts.
                  </p>

                  {!setup2FA ? (
                    <button style={styles.enableBtn} onClick={init2FASetup}>Configure Google OTP 2FA</button>
                  ) : (
                    <div style={styles.setupContainer}>
                      <p style={{ color: "#ffffff", fontWeight: "600", fontSize: "14px", margin: "0 0 10px 0" }}>Google Authenticator Setup</p>
                      
                      <div style={styles.qrBlock}>
                        <img src={setup2FA.qrUrl} alt="2FA QR Code" style={styles.qrImage} />
                        <div style={styles.secretText}>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Manual Setup Key:</span>
                          <code style={{ display: "block", color: "#3b82f6", fontWeight: "bold", fontSize: "14px" }}>{setup2FA.secret}</code>
                        </div>
                      </div>

                      <div style={{ marginTop: "15px" }}>
                        <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#cbd5e1" }}>Confirm setup by entering the 6-digit OTP code:</p>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <input
                            placeholder="e.g. 123456"
                            value={verificationCode}
                            style={styles.otpInput}
                            maxLength={6}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                          />
                          <button style={styles.verifyBtn} disabled={verifying} onClick={handleVerifyEnable2FA}>
                            {verifying ? "Enabling..." : "Verify & Enable"}
                          </button>
                        </div>
                        {errorMessage && <p style={styles.errorMsg}>{errorMessage}</p>}
                        <button style={styles.cancelBtn} onClick={() => setSetup2FA(null)}>Cancel Setup</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* GAMIFIED ACHIEVEMENTS */}
            <div style={styles.card}>
              <h3 style={styles.cardHeading}>🏆 Achievements & Badges</h3>
              <p style={styles.cardDesc}>Earn achievements by participating actively in city restoration efforts.</p>
              
              <div style={styles.badgeList}>
                {catalog.map((badge) => {
                  const isUnlocked = unlockedBadgeIds.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      style={{
                        ...styles.badgeCard,
                        borderColor: isUnlocked ? "rgba(59, 130, 246, 0.4)" : "rgba(255,255,255,0.03)",
                        background: isUnlocked ? "rgba(59, 130, 246, 0.08)" : "rgba(15, 23, 42, 0.25)",
                        opacity: isUnlocked ? "1" : "0.4"
                      }}
                    >
                      <div style={styles.badgeContent}>
                        <span style={styles.badgeTitle}>{badge.title}</span>
                        <span style={styles.badgeDesc}>{badge.desc}</span>
                      </div>
                      <span style={{
                        ...styles.badgeStatus,
                        color: isUnlocked ? "#4ade80" : "#475569"
                      }}>
                        {isUnlocked ? "Unlocked ✔️" : "Locked 🔒"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
    transition: "0.3s",
    boxSizing: "border-box"
  },

  heading: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "5px"
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    marginBottom: "25px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
    alignItems: "start",
    maxWidth: "1200px"
  },

  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "25px"
  },

  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: "25px"
  },

  card: {
    background: "rgba(30, 41, 59, 0.45)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "25px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
  },

  cardHeading: {
    margin: "0 0 10px 0",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "600"
  },

  cardDesc: {
    margin: "0 0 15px 0",
    color: "#94a3b8",
    fontSize: "13px"
  },

  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px"
  },

  avatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    border: "2px solid rgba(255,255,255,0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#ffffff"
  },

  userName: {
    margin: 0,
    fontSize: "22px",
    color: "#ffffff",
    fontWeight: "700"
  },

  userRoleBadge: {
    display: "inline-block",
    marginTop: "5px",
    padding: "4px 10px",
    background: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    fontSize: "11px",
    fontWeight: "bold",
    borderRadius: "20px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },

  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: "15px"
  },

  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: "13px"
  },

  infoValue: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: "14px"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "15px",
    marginTop: "10px"
  },

  statBox: {
    background: "rgba(15, 23, 42, 0.4)",
    border: "1px solid rgba(255,255,255,0.05)",
    padding: "15px 10px",
    borderRadius: "12px",
    textAlign: "center"
  },

  statVal: {
    display: "block",
    fontSize: "22px",
    fontWeight: "700",
    color: "#ffffff"
  },

  statLabel: {
    display: "block",
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "5px"
  },

  status2FA: {
    marginTop: "10px"
  },

  badge2FAEnabled: {
    display: "inline-block",
    padding: "6px 12px",
    background: "rgba(34, 197, 94, 0.15)",
    color: "#4ade80",
    fontSize: "13px",
    fontWeight: "600",
    borderRadius: "20px"
  },

  enableBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s"
  },

  disableBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    marginTop: "15px",
    transition: "all 0.2s"
  },

  setupContainer: {
    background: "rgba(15, 23, 42, 0.4)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "15px",
    borderRadius: "12px",
    marginTop: "15px"
  },

  qrBlock: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginTop: "10px"
  },

  qrImage: {
    width: "120px",
    height: "120px",
    borderRadius: "8px",
    background: "white",
    padding: "5px"
  },

  secretText: {
    flex: 1
  },

  otpInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(15, 23, 42, 0.6)",
    color: "white",
    width: "100px",
    textAlign: "center",
    fontSize: "15px",
    outline: "none"
  },

  verifyBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600"
  },

  cancelBtn: {
    background: "transparent",
    color: "#ef4444",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    marginTop: "10px",
    textDecoration: "underline",
    display: "block",
    padding: 0
  },

  errorMsg: {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "5px",
    margin: "5px 0 0 0"
  },

  badgeList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  badgeCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
  },

  badgeContent: {
    display: "flex",
    flexDirection: "column"
  },

  badgeTitle: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#ffffff"
  },

  badgeDesc: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "2px"
  },

  badgeStatus: {
    fontSize: "12px",
    fontWeight: "600"
  }
};
