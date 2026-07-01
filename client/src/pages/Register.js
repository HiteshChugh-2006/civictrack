import { useState, useEffect, useRef } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import ThreeBackground from "../components/ThreeBackground";

export default function Register() {
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [data, setData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailForOTP, setEmailForOTP] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showClientIdPanel, setShowClientIdPanel] = useState(false);
  const [clientIdInput, setClientIdInput] = useState("");

  const [googleClientId, setGoogleClientId] = useState(
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    localStorage.getItem("civictrack_google_client_id") ||
    ""
  );

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
            cancel_on_tap_outside: true,
          });
          if (googleBtnRef.current) {
            google.accounts.id.renderButton(googleBtnRef.current, {
              theme: "filled_black",
              size: "large",
              width: "100%",
              text: "signup_with",
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
  }, [showOTP, googleClientId]);

  const saveClientId = () => {
    const trimmed = clientIdInput.trim();
    if (!trimmed || !trimmed.includes(".apps.googleusercontent.com")) {
      setError("Invalid Client ID — must end with .apps.googleusercontent.com");
      return;
    }
    localStorage.setItem("civictrack_google_client_id", trimmed);
    setGoogleClientId(trimmed);
    setShowClientIdPanel(false);
    setClientIdInput("");
    setError("");
    setSuccess("✅ Google Client ID saved! Reloading...");
    setTimeout(() => window.location.reload(), 700);
  };

  // Real Google Sign-In callback → send idToken to backend
  const handleGoogleCredentialResponse = async (response) => {
    try {
      setGoogleLoading(true);
      setError("");
      const res = await API.post("/auth/google-login", { idToken: response.credential });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setSuccess("🎉 Signed up with Google successfully!");
      setTimeout(() => redirectUser(user.role), 800);
    } catch (err) {
      setError(err.response?.data || "Google sign-up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const redirectUser = (role) => {
    if (role === "admin") navigate("/admin");
    else if (role === "worker") navigate("/worker");
    else navigate("/dashboard");
  };

  // Email/Password registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (data.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      const res = await API.post("/auth/register", { name: data.name, email: data.email, password: data.password });
      if (res.data.requireOTP) {
        setEmailForOTP(data.email);
        setShowOTP(true);
      }
    } catch (err) {
      setError(err.response?.data || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setOtpLoading(true);
      const res = await API.post("/auth/verify-otp", { email: emailForOTP, code: otpCode });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setSuccess("✅ Account verified! Redirecting...");
      setTimeout(() => redirectUser(user.role), 900);
    } catch (err) {
      setError(err.response?.data || "Invalid OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Demo login for Admin / Worker
  const handleDemoLogin = async (role) => {
    setError("");
    try {
      setDemoLoading(role);
      const res = await API.post("/auth/demo-login", { role });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setSuccess(`🎭 Demo ${role} access granted!`);
      setTimeout(() => redirectUser(user.role), 800);
    } catch (err) {
      setError(err.response?.data || `Demo ${role} login failed.`);
    } finally {
      setDemoLoading(null);
    }
  };

  const passwordStrength = (pw) => {
    if (!pw) return { level: 0, label: "", color: "#475569" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { level: 0, label: "", color: "#475569" },
      { level: 1, label: "Weak", color: "#ef4444" },
      { level: 2, label: "Fair", color: "#f59e0b" },
      { level: 3, label: "Good", color: "#3b82f6" },
      { level: 4, label: "Strong", color: "#10b981" },
    ];
    return levels[score] || levels[0];
  };

  const pwStrength = passwordStrength(data.password);

  return (
    <div style={styles.page}>
      <ThreeBackground opacity={0.6} />

      <div style={styles.container}>

        {/* ===== LEFT PANEL (Demo Access) ===== */}
        <div style={styles.leftPanel}>
          <div style={styles.leftContent}>
            <div style={styles.leftLogo}>🌐</div>
            <h1 style={styles.leftTitle}>CivicTrack</h1>
            <p style={styles.leftSub}>Smart city issue management platform</p>

            <div style={styles.demoSection}>
              <p style={styles.demoHeading}>
                <span style={styles.demoPill}>👀 PREVIEW</span>
                Explore without signing up
              </p>
              <p style={styles.demoDesc}>
                Try the Admin or Worker dashboards instantly — no registration needed.
              </p>

              {/* Admin Demo Button */}
              <button
                style={{ ...styles.demoBtn, ...styles.demoBtnAdmin }}
                onClick={() => handleDemoLogin("admin")}
                disabled={demoLoading !== null}
              >
                {demoLoading === "admin" ? (
                  <span style={styles.spinner} />
                ) : (
                  <>
                    <div style={styles.demoBtnIcon}>⚙️</div>
                    <div style={styles.demoBtnText}>
                      <span style={styles.demoBtnLabel}>Admin Dashboard</span>
                      <span style={styles.demoBtnSub}>Manage issues, assign workers, analytics</span>
                    </div>
                    <span style={styles.demoBtnArrow}>→</span>
                  </>
                )}
              </button>

              {/* Worker Demo Button */}
              <button
                style={{ ...styles.demoBtn, ...styles.demoBtnWorker }}
                onClick={() => handleDemoLogin("worker")}
                disabled={demoLoading !== null}
              >
                {demoLoading === "worker" ? (
                  <span style={styles.spinner} />
                ) : (
                  <>
                    <div style={styles.demoBtnIcon}>👷</div>
                    <div style={styles.demoBtnText}>
                      <span style={styles.demoBtnLabel}>Worker Dashboard</span>
                      <span style={styles.demoBtnSub}>View assignments, submit completions</span>
                    </div>
                    <span style={styles.demoBtnArrow}>→</span>
                  </>
                )}
              </button>
            </div>

            {/* Feature List */}
            <div style={styles.featureList}>
              {[
                ["📍", "Report civic issues with location"],
                ["📹", "AI-powered CCTV surveillance"],
                ["🗺️", "Interactive city map view"],
                ["🏆", "Community leaderboard & badges"],
                ["📊", "Real-time analytics"],
                ["🤖", "AI chatbot assistance"],
              ].map(([icon, label]) => (
                <div key={label} style={styles.featureItem}>
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== RIGHT PANEL (Form) ===== */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>

            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Create Account</h2>
              <p style={styles.formSub}>Join CivicTrack to report & track civic issues</p>
            </div>

            {/* Messages */}
            {error && (
              <div style={styles.errorBox}>
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div style={styles.successBox}>
                <span>✅</span> {success}
              </div>
            )}

            {showOTP ? (
              /* OTP Verification Form */
              <form onSubmit={handleOTPSubmit} style={styles.form}>
                <div style={styles.otpHeader}>
                  <div style={styles.otpIcon}>📧</div>
                  <h3 style={{ color: "#f0f6ff", margin: "12px 0 4px" }}>Verify Your Email</h3>
                  <p style={{ color: "#64748b", fontSize: "13px", textAlign: "center" }}>
                    Check the server console for the OTP code sent to<br />
                    <strong style={{ color: "#3b82f6" }}>{emailForOTP}</strong>
                  </p>
                </div>
                <input
                  className="glass-input"
                  type="text"
                  placeholder="Enter 6-digit OTP code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  style={{ textAlign: "center", fontSize: "22px", letterSpacing: "8px", fontWeight: "700" }}
                  maxLength={6}
                  required
                  autoFocus
                />
                <button className="premium-btn" type="submit" disabled={otpLoading || otpCode.length !== 6}>
                  {otpLoading ? "Verifying..." : "✅ Verify & Create Account"}
                </button>
                <span className="premium-link" onClick={() => { setShowOTP(false); setOtpCode(""); setError(""); }}>
                  ← Back to registration
                </span>
              </form>
            ) : (
              <>
                {/* Google Sign-In */}
                <div style={styles.googleSection}>
                  {/* Client ID Setup Panel */}
                  {showClientIdPanel && (
                    <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "14px", padding: "16px", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "18px" }}>🔑</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "700", color: "#f0f6ff", fontSize: "13px" }}>Activate Google Sign-In</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>Paste your OAuth 2.0 Client ID below</div>
                        </div>
                        <button style={{ background: "none", border: "none", color: "#64748b", fontSize: "16px", cursor: "pointer" }} onClick={() => setShowClientIdPanel(false)}>✕</button>
                      </div>
                      <input
                        className="glass-input"
                        placeholder="xxxxx.apps.googleusercontent.com"
                        value={clientIdInput}
                        onChange={e => setClientIdInput(e.target.value)}
                        style={{ fontSize: "12px", marginBottom: "8px" }}
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          style={{ flex: 1, background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "white", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                          onClick={saveClientId}
                        >
                          ✅ Save & Activate
                        </button>
                        <a href="https://console.cloud.google.com/apis/credentials/oauthclient" target="_blank" rel="noreferrer"
                          style={{ display: "flex", alignItems: "center", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#94a3b8", fontSize: "12px", textDecoration: "none", fontWeight: "600" }}>
                          🌐 Console
                        </a>
                      </div>
                      <div style={{ fontSize: "11px", color: "#475569", marginTop: "8px", lineHeight: "1.5" }}>
                        Google Cloud → Credentials → OAuth 2.0 Client ID (Web App) → Authorized Origins: <code style={{ color: "#06b6d4" }}>http://localhost:3000</code>
                      </div>
                    </div>
                  )}
                  {googleClientId ? (
                    <div className="google-btn-wrapper">
                      <div ref={googleBtnRef} style={{ width: "100%" }} />
                    </div>
                  ) : (
                    <>
                      <button type="button" style={styles.googleFallbackBtn} onClick={() => setShowClientIdPanel(p => !p)}>
                        <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24">
                          <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.42-4.51 6.76-4.51z"/>
                          <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.88c2.18-2 3.7-4.97 3.7-8.61z"/>
                          <path fill="#FBBC05" d="M5.24 14.55c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.39 6.96C.5 8.74 0 10.74 0 12.8s.5 4.06 1.39 5.84l3.85-4.09z"/>
                          <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.88c-1.04.7-2.38 1.12-3.96 1.12-3.34 0-5.86-1.81-6.76-4.51L1.66 16.9C3.64 20.79 7.62 23 12 23z"/>
                        </svg>
                        <span>{googleLoading ? "Signing up..." : "Sign up with Google"}</span>
                        <span style={{ marginLeft: "auto", fontSize: "10px", background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "6px", padding: "2px 6px", fontWeight: "700" }}>SETUP NEEDED</span>
                      </button>
                      <button type="button"
                        style={{ width: "100%", padding: "8px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px", color: "#60a5fa", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Outfit', sans-serif", marginTop: "6px" }}
                        onClick={() => setShowClientIdPanel(true)}>
                        🔑 Paste Client ID to activate Google Sign-Up
                      </button>
                    </>
                  )}
                  <p style={styles.googleHint}>
                    ✨ Recommended — No password needed
                  </p>
                </div>

                {/* Divider */}
                <div style={styles.divider}>
                  <div style={styles.dividerLine} />
                  <span style={styles.dividerText}>or register with email</span>
                  <div style={styles.dividerLine} />
                </div>

                {/* Email Registration Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                  <input
                    className="glass-input"
                    placeholder="Full Name"
                    value={data.name}
                    onChange={e => setData({ ...data, name: e.target.value })}
                    required
                  />
                  <input
                    className="glass-input"
                    type="email"
                    placeholder="Email Address"
                    value={data.email}
                    onChange={e => setData({ ...data, email: e.target.value })}
                    required
                  />

                  {/* Password with toggle */}
                  <div style={{ position: "relative" }}>
                    <input
                      className="glass-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create Password"
                      value={data.password}
                      onChange={e => setData({ ...data, password: e.target.value })}
                      style={{ paddingRight: "44px" }}
                      required
                    />
                    <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(p => !p)}>
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {data.password && (
                    <div style={{ marginTop: "-4px", marginBottom: "4px" }}>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${(pwStrength.level / 4) * 100}%`, background: pwStrength.color }} />
                      </div>
                      <span style={{ fontSize: "11px", color: pwStrength.color, fontWeight: "600" }}>
                        {pwStrength.label}
                      </span>
                    </div>
                  )}

                  <input
                    className="glass-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={data.confirmPassword}
                    onChange={e => setData({ ...data, confirmPassword: e.target.value })}
                    required
                  />

                  <button className="premium-btn" type="submit" disabled={loading}>
                    {loading ? "Creating Account..." : "🚀 Create Account"}
                  </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#64748b" }}>
                  Already have an account?{" "}
                  <span
                    onClick={() => navigate("/")}
                    style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "600" }}
                  >
                    Sign In
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #060b18 0%, #0d1526 50%, #060b18 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden"
  },
  container: {
    display: "flex",
    width: "100%",
    maxWidth: "1100px",
    minHeight: "100vh",
    position: "relative",
    zIndex: 1
  },
  leftPanel: {
    flex: "0 0 50%",
    padding: "60px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(6, 11, 24, 0.5)",
    borderRight: "1px solid rgba(255,255,255,0.06)"
  },
  leftContent: {
    maxWidth: "400px",
    width: "100%"
  },
  leftLogo: {
    fontSize: "48px",
    marginBottom: "12px"
  },
  leftTitle: {
    fontSize: "38px",
    fontWeight: "900",
    background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: "0 0 8px",
    letterSpacing: "-1.5px"
  },
  leftSub: {
    color: "#64748b",
    fontSize: "15px",
    marginBottom: "32px"
  },
  demoSection: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "24px"
  },
  demoHeading: {
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600"
  },
  demoPill: {
    background: "rgba(236, 72, 153, 0.15)",
    color: "#ec4899",
    border: "1px solid rgba(236, 72, 153, 0.3)",
    borderRadius: "100px",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.5px"
  },
  demoDesc: {
    fontSize: "12px",
    color: "#475569",
    marginBottom: "16px",
    lineHeight: "1.5"
  },
  demoBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid",
    cursor: "pointer",
    transition: "all 0.25s",
    marginBottom: "10px",
    background: "transparent",
    textAlign: "left",
    position: "relative",
    overflow: "hidden",
    minHeight: "62px"
  },
  demoBtnAdmin: {
    borderColor: "rgba(245, 158, 11, 0.3)",
    background: "rgba(245, 158, 11, 0.06)"
  },
  demoBtnWorker: {
    borderColor: "rgba(16, 185, 129, 0.3)",
    background: "rgba(16, 185, 129, 0.06)"
  },
  demoBtnIcon: { fontSize: "24px", flexShrink: 0 },
  demoBtnText: { display: "flex", flexDirection: "column", gap: "2px", flex: 1 },
  demoBtnLabel: { fontSize: "14px", fontWeight: "700", color: "#f0f6ff" },
  demoBtnSub: { fontSize: "11px", color: "#64748b" },
  demoBtnArrow: { fontSize: "16px", color: "#475569" },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid rgba(255,255,255,0.2)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block"
  },
  featureList: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#64748b",
    padding: "6px 8px",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.04)"
  },
  rightPanel: {
    flex: "0 0 50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 40px"
  },
  formCard: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(13, 21, 38, 0.92)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "36px 32px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 60px rgba(59,130,246,0.05)"
  },
  formHeader: { marginBottom: "24px", textAlign: "center" },
  formTitle: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#f0f6ff",
    margin: "0 0 6px",
    letterSpacing: "-0.5px"
  },
  formSub: { fontSize: "14px", color: "#64748b", margin: 0 },
  errorBox: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "13px",
    color: "#fca5a5",
    marginBottom: "16px",
    display: "flex",
    gap: "8px",
    alignItems: "flex-start"
  },
  successBox: {
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "13px",
    color: "#6ee7b7",
    marginBottom: "16px",
    display: "flex",
    gap: "8px",
    alignItems: "flex-start"
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  googleSection: { marginBottom: "4px" },
  googleFallbackBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "13px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    color: "#f0f6ff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'Outfit', sans-serif"
  },
  googleHint: {
    textAlign: "center",
    fontSize: "11px",
    color: "#475569",
    margin: "6px 0 0"
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "16px 0"
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.07)"
  },
  dividerText: {
    fontSize: "12px",
    color: "#475569",
    whiteSpace: "nowrap",
    fontWeight: "500"
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px"
  },
  otpHeader: {
    textAlign: "center",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  otpIcon: {
    width: "56px",
    height: "56px",
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px"
  }
};
