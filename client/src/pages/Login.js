import { useState, useEffect, useRef } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import ThreeBackground from "../components/ThreeBackground";

export default function Login() {
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 2FA state
  const [require2FA, setRequire2FA] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [tempUserId, setTempUserId] = useState("");

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || localStorage.getItem("civictrack_google_client_id") || "";

  const redirectUser = (role) => {
    if (role === "admin") navigate("/admin");
    else if (role === "worker") navigate("/worker");
    else navigate("/dashboard");
  };

  // Initialize Google Identity Services
  useEffect(() => {
    if (!googleClientId) return;
    const initGoogle = () => {
      /* global google */
      if (typeof google !== "undefined") {
        try {
          google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
          });
          if (googleBtnRef.current) {
            google.accounts.id.renderButton(googleBtnRef.current, {
              theme: "filled_black",
              size: "large",
              width: "100%",
              text: "signin_with",
              shape: "rectangular",
              logo_alignment: "left",
            });
          }
        } catch (err) {
          console.error("Google SDK init failed:", err.message);
        }
      }
    };
    const t = setTimeout(initGoogle, 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForgot, require2FA, googleClientId]);

  const handleGoogleCredentialResponse = async (response) => {
    try {
      setGoogleLoading(true);
      setError("");
      const res = await API.post("/auth/google-login", { idToken: response.credential });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setSuccess("🎉 Signed in with Google!");
      setTimeout(() => redirectUser(user.role), 700);
    } catch (err) {
      setError(err.response?.data || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const res = await API.post("/auth/login", data);
      if (res.data.require2FA) {
        setTempUserId(res.data.userId);
        setRequire2FA(true);
        return;
      }
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setSuccess("Welcome back!");
      setTimeout(() => redirectUser(user.role), 600);
    } catch (err) {
      setError(err.response?.data || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setOtpLoading(true);
      const res = await API.post("/auth/login/2fa-verify", { userId: tempUserId, code: otpCode });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setSuccess("✅ 2FA verified!");
      setTimeout(() => redirectUser(user.role), 600);
    } catch (err) {
      setError(err.response?.data || "Invalid 2FA code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setForgotLoading(true);
      const res = await API.post("/auth/forgot-password", { email: forgotEmail });
      setResetLink(res.data.resetLink || "");
      setSuccess("Reset link generated! Check the server console.");
    } catch (err) {
      setError(err.response?.data || "Email not found.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setError("");
    try {
      setDemoLoading(role);
      const res = await API.post("/auth/demo-login", { role });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setSuccess(`🎭 Demo ${role} access!`);
      setTimeout(() => redirectUser(user.role), 700);
    } catch (err) {
      setError(err.response?.data || `Demo ${role} login failed.`);
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div style={styles.page}>
      <ThreeBackground opacity={0.55} />

      <div style={styles.outerWrap}>

        {/* Brand Header */}
        <div style={styles.brandHeader}>
          <span style={{ fontSize: "32px" }}>🌐</span>
          <div>
            <div style={styles.brandName}>CivicTrack</div>
            <div style={styles.brandSub}>Smart City Issue Management</div>
          </div>
        </div>

        <div style={styles.mainRow}>
          {/* ===== LEFT: Login Card ===== */}
          <div style={styles.loginCard}>

            {error && <div style={styles.errorBox}><span>⚠️</span> {error}</div>}
            {success && <div style={styles.successBox}><span>✅</span> {success}</div>}

            {require2FA ? (
              <form onSubmit={handle2FASubmit}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionIcon}>🔐</div>
                  <h2 style={styles.sectionTitle}>Two-Factor Verification</h2>
                  <p style={styles.sectionSub}>Enter the 6-digit code from your authenticator app.</p>
                </div>
                <input
                  className="glass-input"
                  placeholder="000000"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px", fontWeight: "700" }}
                  maxLength={6}
                  autoFocus
                  required
                />
                <button className="premium-btn" type="submit" disabled={otpLoading || otpCode.length !== 6} style={{ marginTop: "12px" }}>
                  {otpLoading ? "Verifying..." : "✅ Verify Code"}
                </button>
                <span className="premium-link" onClick={() => { setRequire2FA(false); setOtpCode(""); }}>← Back to login</span>
              </form>

            ) : showForgot ? (
              <form onSubmit={handleForgotPassword}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionIcon}>🔑</div>
                  <h2 style={styles.sectionTitle}>Reset Password</h2>
                  <p style={styles.sectionSub}>Enter your email to receive a reset link.</p>
                </div>
                <input
                  className="glass-input"
                  type="email"
                  placeholder="Your email address"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                />
                {resetLink && (
                  <div style={{ ...styles.successBox, marginTop: "8px", fontSize: "12px", wordBreak: "break-all" }}>
                    Reset link (dev): <a href={resetLink} style={{ color: "#3b82f6" }}>{resetLink}</a>
                  </div>
                )}
                <button className="premium-btn" type="submit" disabled={forgotLoading} style={{ marginTop: "12px" }}>
                  {forgotLoading ? "Sending..." : "📧 Send Reset Link"}
                </button>
                <span className="premium-link" onClick={() => { setShowForgot(false); setResetLink(""); setError(""); }}>← Back to login</span>
              </form>

            ) : (
              <>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Welcome Back</h2>
                  <p style={styles.sectionSub}>Sign in to your CivicTrack account</p>
                </div>

                <div className="google-btn-wrapper" style={{ marginBottom: "8px" }}>
                  {googleClientId ? (
                    <div ref={googleBtnRef} style={{ width: "100%" }} />
                  ) : (
                    <button
                      type="button"
                      style={styles.googleFallbackBtn}
                      onClick={() => {
                        const id = prompt("Enter your Google Client ID:\n(console.cloud.google.com → Credentials → OAuth 2.0 Client IDs)");
                        if (id && id.includes(".apps.googleusercontent.com")) {
                          localStorage.setItem("civictrack_google_client_id", id);
                          window.location.reload();
                        } else if (id) {
                          alert("Invalid Client ID format. Must end with .apps.googleusercontent.com");
                        }
                      }}
                    >
                      <svg style={{ width: "20px", flexShrink: 0 }} viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.42-4.51 6.76-4.51z"/>
                        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.88c2.18-2 3.7-4.97 3.7-8.61z"/>
                        <path fill="#FBBC05" d="M5.24 14.55c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.39 6.96C.5 8.74 0 10.74 0 12.8s.5 4.06 1.39 5.84l3.85-4.09z"/>
                        <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.88c-1.04.7-2.38 1.12-3.96 1.12-3.34 0-5.86-1.81-6.76-4.51L1.66 16.9C3.64 20.79 7.62 23 12 23z"/>
                      </svg>
                      <span>{googleLoading ? "Signing in..." : "Sign in with Google"}</span>
                    </button>
                  )}
                </div>
                <p style={{ textAlign: "center", fontSize: "11px", color: "#475569", marginBottom: "16px" }}>
                  ✨ Recommended for citizens
                </p>

                <div style={styles.divider}>
                  <div style={styles.dividerLine} />
                  <span style={styles.dividerText}>or sign in with email</span>
                  <div style={styles.dividerLine} />
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input
                    className="glass-input"
                    type="email"
                    placeholder="Email Address"
                    value={data.email}
                    onChange={e => setData({ ...data, email: e.target.value })}
                    required
                  />
                  <div style={{ position: "relative" }}>
                    <input
                      className="glass-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={data.password}
                      onChange={e => setData({ ...data, password: e.target.value })}
                      style={{ paddingRight: "44px" }}
                      required
                    />
                    <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(p => !p)}>
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span onClick={() => { setShowForgot(true); setError(""); }} style={styles.forgotLink}>
                      Forgot password?
                    </span>
                  </div>
                  <button className="premium-btn" type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In →"}
                  </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#64748b" }}>
                  Don't have an account?{" "}
                  <span onClick={() => navigate("/register")} style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "600" }}>
                    Sign Up Free
                  </span>
                </p>
              </>
            )}
          </div>

          {/* ===== RIGHT: Demo Panel ===== */}
          <div style={styles.demoPanel}>
            <div style={styles.demoPanelHeader}>
              <span style={styles.demoPill}>👀 DEMO</span>
              <h3 style={styles.demoPanelTitle}>Explore Dashboards</h3>
              <p style={styles.demoPanelSub}>Try admin or worker views instantly — no signup required.</p>
            </div>

            {[
              { role: "admin", icon: "⚙️", title: "Admin Dashboard", desc: "Manage all issues, assign workers, publish announcements, view analytics", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.08)", borderColor: "rgba(245, 158, 11, 0.25)" },
              { role: "worker", icon: "👷", title: "Worker Dashboard", desc: "View assigned tasks, mark in-progress, submit completion with photos", color: "#10b981", bgColor: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.25)" }
            ].map(({ role, icon, title, desc, color, bgColor, borderColor }) => (
              <button
                key={role}
                style={{ ...styles.demoCard, background: bgColor, borderColor }}
                onClick={() => handleDemoLogin(role)}
                disabled={demoLoading !== null}
              >
                {demoLoading === role ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
                    <div style={{ width: "24px", height: "24px", border: `3px solid ${color}40`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "22px" }}>{icon}</span>
                      <span style={{ fontSize: "15px", fontWeight: "700", color }}>{title}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>{desc}</p>
                    <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color }}>Try it now</span>
                      <span style={{ color }}>→</span>
                    </div>
                  </>
                )}
              </button>
            ))}

            <div style={styles.demoNote}>
              <span>⏱️</span>
              <span>Demo sessions last 2 hours. All features are fully functional.</span>
            </div>

            <div style={styles.statsRow}>
              {[["🌆", "City Issues", "Live"], ["🏆", "Leaderboard", "Active"], ["🤖", "AI Chat", "Online"]].map(([icon, label, status]) => (
                <div key={label} style={styles.statChip}>
                  <span>{icon}</span>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8" }}>{label}</div>
                    <div style={{ fontSize: "10px", color: "#10b981" }}>● {status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #060b18 0%, #0d1526 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", overflow: "hidden" },
  outerWrap: { width: "100%", maxWidth: "1000px", position: "relative", zIndex: 1 },
  brandHeader: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "40px", justifyContent: "center" },
  brandName: { fontSize: "28px", fontWeight: "900", background: "linear-gradient(135deg, #3b82f6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-1px" },
  brandSub: { fontSize: "12px", color: "#475569", fontWeight: "500" },
  mainRow: { display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" },
  loginCard: { flex: "1 1 380px", background: "rgba(13, 21, 38, 0.92)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "36px 32px", backdropFilter: "blur(20px)", boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 60px rgba(59,130,246,0.06)" },
  sectionHeader: { textAlign: "center", marginBottom: "24px" },
  sectionIcon: { fontSize: "36px", marginBottom: "12px" },
  sectionTitle: { fontSize: "24px", fontWeight: "800", color: "#f0f6ff", margin: "0 0 6px", letterSpacing: "-0.5px" },
  sectionSub: { fontSize: "14px", color: "#64748b", margin: 0 },
  errorBox: { background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#fca5a5", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "flex-start" },
  successBox: { background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#6ee7b7", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "flex-start" },
  googleFallbackBtn: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "13px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", color: "#f0f6ff", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "'Outfit', sans-serif" },
  divider: { display: "flex", alignItems: "center", gap: "12px", margin: "4px 0 16px" },
  dividerLine: { flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" },
  dividerText: { fontSize: "12px", color: "#475569", whiteSpace: "nowrap", fontWeight: "500" },
  eyeBtn: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: "4px" },
  forgotLink: { fontSize: "12px", color: "#3b82f6", cursor: "pointer", fontWeight: "500" },
  demoPanel: { flex: "1 1 280px", display: "flex", flexDirection: "column", gap: "12px" },
  demoPanelHeader: { marginBottom: "4px" },
  demoPill: { display: "inline-block", background: "rgba(236, 72, 153, 0.15)", color: "#ec4899", border: "1px solid rgba(236, 72, 153, 0.3)", borderRadius: "100px", padding: "3px 10px", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px", marginBottom: "8px" },
  demoPanelTitle: { fontSize: "20px", fontWeight: "800", color: "#f0f6ff", margin: "0 0 6px", letterSpacing: "-0.3px" },
  demoPanelSub: { fontSize: "13px", color: "#64748b", margin: 0 },
  demoCard: { padding: "18px 20px", borderRadius: "16px", border: "1px solid", cursor: "pointer", transition: "all 0.25s", textAlign: "left", width: "100%" },
  demoNote: { display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "12px", color: "#475569", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" },
  statChip: { display: "flex", gap: "8px", alignItems: "center", padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", fontSize: "16px" }
};
