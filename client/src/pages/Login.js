import { useState, useEffect, useRef, useCallback } from "react";
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

  // Google Client ID setup panel
  const [showClientIdPanel, setShowClientIdPanel] = useState(false);
  const [clientIdInput, setClientIdInput] = useState("");

  const [googleClientId, setGoogleClientId] = useState(
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    localStorage.getItem("civictrack_google_client_id") ||
    ""
  );

  const redirectUser = (role) => {
    if (role === "admin") navigate("/admin");
    else if (role === "worker") navigate("/worker");
    else navigate("/dashboard");
  };

  const handleGoogleCredentialResponse = useCallback(async (response) => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              width: "320",
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
    const t = setTimeout(initGoogle, 600);
    return () => clearTimeout(t);
  }, [showForgot, require2FA, googleClientId, handleGoogleCredentialResponse]);

  const saveClientId = () => {
    const trimmed = clientIdInput.trim();
    if (!trimmed) { setError("Please paste your Google Client ID."); return; }
    if (!trimmed.includes(".apps.googleusercontent.com")) {
      setError("That doesn't look like a valid Client ID. It must end with .apps.googleusercontent.com");
      return;
    }
    localStorage.setItem("civictrack_google_client_id", trimmed);
    setGoogleClientId(trimmed);
    setShowClientIdPanel(false);
    setClientIdInput("");
    setError("");
    setSuccess("✅ Google Client ID saved! Sign-in button is now active.");
    // Force re-render of GSI button
    setTimeout(() => window.location.reload(), 800);
  };

  const clearClientId = () => {
    localStorage.removeItem("civictrack_google_client_id");
    setGoogleClientId("");
    setSuccess("");
    setError("");
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
      setError(err.response?.data || "Email not found in our system.");
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

  const isGoogleReady = !!googleClientId;

  return (
    <div style={s.page}>
      <ThreeBackground opacity={0.55} />

      <div style={s.outerWrap}>

        {/* Brand */}
        <div style={s.brandHeader}>
          <span style={{ fontSize: "36px" }}>🌐</span>
          <div>
            <div style={s.brandName}>CivicTrack</div>
            <div style={s.brandSub}>Smart City Issue Management</div>
          </div>
        </div>

        <div style={s.mainRow}>

          {/* ===== LOGIN CARD ===== */}
          <div style={s.loginCard}>

            {error && <div style={s.errorBox}><span>⚠️</span><span>{error}</span></div>}
            {success && <div style={s.successBox}><span>✅</span><span>{success}</span></div>}

            {/* ---- Google Client ID Setup Panel ---- */}
            {showClientIdPanel && (
              <div style={s.clientIdPanel}>
                <div style={s.clientIdHeader}>
                  <span style={{ fontSize: "20px" }}>🔑</span>
                  <div>
                    <div style={{ fontWeight: "700", color: "#f0f6ff", fontSize: "14px" }}>Setup Google Sign-In</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Paste your OAuth 2.0 Client ID</div>
                  </div>
                  <button style={s.closeBtn} onClick={() => setShowClientIdPanel(false)}>✕</button>
                </div>
                <input
                  className="glass-input"
                  placeholder="Paste Client ID (ends with .apps.googleusercontent.com)"
                  value={clientIdInput}
                  onChange={e => setClientIdInput(e.target.value)}
                  style={{ fontSize: "12px", marginBottom: "8px" }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={s.saveClientBtn} onClick={saveClientId}>
                    ✅ Save & Activate
                  </button>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    style={s.consoleLink}
                  >
                    🌐 Open Google Console
                  </a>
                </div>
                <div style={s.clientIdHint}>
                  <b>How to get it:</b> Google Cloud Console → APIs &amp; Services → Credentials → Create OAuth 2.0 Client ID (Web Application) → Authorized Origins: <code style={{ color: "#06b6d4" }}>http://localhost:3000</code>
                </div>
              </div>
            )}

            {require2FA ? (
              /* 2FA */
              <form onSubmit={handle2FASubmit}>
                <div style={s.sectionHeader}>
                  <div style={{ fontSize: "36px" }}>🔐</div>
                  <h2 style={s.sectionTitle}>Two-Factor Auth</h2>
                  <p style={s.sectionSub}>Enter the 6-digit code from your authenticator app.</p>
                </div>
                <input
                  className="glass-input"
                  placeholder="000000"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  style={{ textAlign: "center", fontSize: "28px", letterSpacing: "10px", fontWeight: "700" }}
                  maxLength={6} autoFocus required
                />
                <button className="premium-btn" type="submit" disabled={otpLoading || otpCode.length !== 6} style={{ marginTop: "12px" }}>
                  {otpLoading ? "Verifying..." : "✅ Verify Code"}
                </button>
                <span className="premium-link" onClick={() => { setRequire2FA(false); setOtpCode(""); }}>← Back</span>
              </form>

            ) : showForgot ? (
              /* Forgot Password */
              <form onSubmit={handleForgotPassword}>
                <div style={s.sectionHeader}>
                  <div style={{ fontSize: "36px" }}>🔑</div>
                  <h2 style={s.sectionTitle}>Reset Password</h2>
                  <p style={s.sectionSub}>Enter your registered email to get a reset link.</p>
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
                  <div style={{ ...s.successBox, marginTop: "8px", fontSize: "12px", wordBreak: "break-all", flexDirection: "column", gap: "4px" }}>
                    <span>✅ Reset link (dev mode):</span>
                    <a href={resetLink} style={{ color: "#3b82f6", textDecoration: "underline" }}>{resetLink}</a>
                  </div>
                )}
                <button className="premium-btn" type="submit" disabled={forgotLoading} style={{ marginTop: "12px" }}>
                  {forgotLoading ? "Sending..." : "📧 Send Reset Link"}
                </button>
                <span className="premium-link" onClick={() => { setShowForgot(false); setResetLink(""); setError(""); }}>← Back to Login</span>
              </form>

            ) : (
              /* Main Login */
              <>
                <div style={s.sectionHeader}>
                  <h2 style={s.sectionTitle}>Welcome Back</h2>
                  <p style={s.sectionSub}>Sign in to your CivicTrack account</p>
                </div>

                {/* Google Sign-In Section */}
                <div style={s.googleSection}>
                  {isGoogleReady ? (
                    <>
                      <div ref={googleBtnRef} style={{ display: "flex", justifyContent: "center", minHeight: "44px" }} />
                      <button style={s.resetGoogleBtn} onClick={clearClientId} title="Remove Client ID">
                        ⚙️ Change Client ID
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        style={s.setupGoogleBtn}
                        onClick={() => setShowClientIdPanel(true)}
                      >
                        <svg style={{ width: "20px", height: "20px", flexShrink: 0 }} viewBox="0 0 24 24">
                          <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.42-4.51 6.76-4.51z"/>
                          <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.88c2.18-2 3.7-4.97 3.7-8.61z"/>
                          <path fill="#FBBC05" d="M5.24 14.55c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.39 6.96C.5 8.74 0 10.74 0 12.8s.5 4.06 1.39 5.84l3.85-4.09z"/>
                          <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.88c-1.04.7-2.38 1.12-3.96 1.12-3.34 0-5.86-1.81-6.76-4.51L1.66 16.9C3.64 20.79 7.62 23 12 23z"/>
                        </svg>
                        <span>Continue with Google</span>
                        <span style={{ marginLeft: "auto", fontSize: "11px", color: "#475569", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", borderRadius: "6px", padding: "2px 6px" }}>Setup Required</span>
                      </button>
                      <button
                        type="button"
                        style={s.getClientIdBtn}
                        onClick={() => setShowClientIdPanel(true)}
                      >
                        🔑 Enter Google Client ID to activate
                      </button>
                    </>
                  )}
                </div>

                <div style={s.divider}>
                  <div style={s.dividerLine} />
                  <span style={s.dividerText}>or sign in with email</span>
                  <div style={s.dividerLine} />
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
                    <button type="button" style={s.eyeBtn} onClick={() => setShowPassword(p => !p)}>
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <span onClick={() => { setShowForgot(true); setError(""); }} style={s.forgotLink}>
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

          {/* ===== DEMO ACCESS PANEL ===== */}
          <div style={s.demoPanel}>
            <div style={{ marginBottom: "4px" }}>
              <span style={s.demoPill}>👀 PREVIEW</span>
              <h3 style={s.demoPanelTitle}>Explore Dashboards</h3>
              <p style={s.demoPanelSub}>Full access — no registration required. Sessions last 2 hours.</p>
            </div>

            {[
              {
                role: "admin", icon: "⚙️", title: "Admin Dashboard",
                desc: "Manage all issues, assign workers, publish announcements, view analytics & export CSV",
                color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)"
              },
              {
                role: "worker", icon: "👷", title: "Worker Dashboard",
                desc: "View assigned tasks, mark in-progress, submit completion with photo/video proof",
                color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)"
              }
            ].map(({ role, icon, title, desc, color, bg, border }) => (
              <button
                key={role}
                style={{ ...s.demoCard, background: bg, borderColor: border }}
                onClick={() => handleDemoLogin(role)}
                disabled={demoLoading !== null}
              >
                {demoLoading === role ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
                    <div style={{ width: "24px", height: "24px", border: `3px solid ${color}30`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "22px" }}>{icon}</span>
                      <span style={{ fontSize: "15px", fontWeight: "700", color }}>{title}</span>
                      <span style={{ marginLeft: "auto", fontSize: "10px", color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: "100px", padding: "2px 7px", fontWeight: "700" }}>INSTANT</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 10px", lineHeight: "1.5" }}>{desc}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color }}>Enter now</span>
                      <span style={{ color }}>→</span>
                    </div>
                  </>
                )}
              </button>
            ))}

            {/* Google OAuth Setup Card */}
            <div style={s.oauthSetupCard}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "20px" }}>🔑</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#f0f6ff", marginBottom: "4px" }}>
                    {isGoogleReady ? "✅ Google Sign-In Active" : "Enable Google Sign-In"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.5" }}>
                    {isGoogleReady
                      ? `Client ID configured: ...${googleClientId.slice(-20)}`
                      : "Create an OAuth 2.0 Client ID on Google Cloud Console, then click below to activate."}
                  </div>
                </div>
              </div>
              {!isGoogleReady && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
                  <a
                    href="https://console.cloud.google.com/apis/credentials/oauthclient"
                    target="_blank"
                    rel="noreferrer"
                    style={s.consoleDeepLink}
                  >
                    🌐 Open Google Cloud Console
                  </a>
                  <button style={s.pasteClientBtn} onClick={() => setShowClientIdPanel(true)}>
                    📋 Paste Client ID Here
                  </button>
                </div>
              )}
            </div>

            {/* Live Stats */}
            <div style={s.statsRow}>
              {[["🌆", "City Issues", "Live"], ["🏆", "Leaderboard", "Active"], ["🤖", "AI Chat", "Online"]].map(([icon, label, status]) => (
                <div key={label} style={s.statChip}>
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

const s = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #060b18 0%, #0d1526 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", overflow: "hidden" },
  outerWrap: { width: "100%", maxWidth: "1000px", position: "relative", zIndex: 1 },
  brandHeader: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "36px", justifyContent: "center" },
  brandName: { fontSize: "28px", fontWeight: "900", background: "linear-gradient(135deg, #3b82f6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-1px" },
  brandSub: { fontSize: "12px", color: "#475569", fontWeight: "500" },
  mainRow: { display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" },
  loginCard: { flex: "1 1 380px", background: "rgba(13, 21, 38, 0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "32px 28px", backdropFilter: "blur(20px)", boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 60px rgba(59,130,246,0.06)", minWidth: "320px" },
  sectionHeader: { textAlign: "center", marginBottom: "22px" },
  sectionTitle: { fontSize: "22px", fontWeight: "800", color: "#f0f6ff", margin: "0 0 6px", letterSpacing: "-0.5px" },
  sectionSub: { fontSize: "13px", color: "#64748b", margin: 0 },
  errorBox: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#fca5a5", marginBottom: "14px", display: "flex", gap: "8px", alignItems: "flex-start" },
  successBox: { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#6ee7b7", marginBottom: "14px", display: "flex", gap: "8px", alignItems: "flex-start" },

  // Google Client ID Panel
  clientIdPanel: { background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "14px", padding: "16px", marginBottom: "16px" },
  clientIdHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  closeBtn: { marginLeft: "auto", background: "none", border: "none", color: "#64748b", fontSize: "16px", cursor: "pointer", padding: "2px 6px" },
  saveClientBtn: { flex: 1, background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "white", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Outfit', sans-serif" },
  consoleLink: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#94a3b8", fontSize: "12px", textDecoration: "none", fontWeight: "600", whiteSpace: "nowrap" },
  clientIdHint: { fontSize: "11px", color: "#475569", marginTop: "10px", lineHeight: "1.6", background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "8px 10px" },

  // Google buttons
  googleSection: { marginBottom: "4px" },
  setupGoogleBtn: { width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f0f6ff", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Outfit', sans-serif", marginBottom: "8px" },
  getClientIdBtn: { width: "100%", padding: "9px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px", color: "#60a5fa", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Outfit', sans-serif", textAlign: "center" },
  resetGoogleBtn: { display: "block", margin: "4px auto 0", fontSize: "11px", color: "#475569", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" },

  divider: { display: "flex", alignItems: "center", gap: "12px", margin: "14px 0" },
  dividerLine: { flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" },
  dividerText: { fontSize: "12px", color: "#475569", whiteSpace: "nowrap", fontWeight: "500" },
  eyeBtn: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: "4px" },
  forgotLink: { fontSize: "12px", color: "#3b82f6", cursor: "pointer", fontWeight: "500" },

  // Demo panel
  demoPanel: { flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "12px" },
  demoPill: { display: "inline-block", background: "rgba(236,72,153,0.15)", color: "#ec4899", border: "1px solid rgba(236,72,153,0.3)", borderRadius: "100px", padding: "3px 10px", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px", marginBottom: "8px" },
  demoPanelTitle: { fontSize: "20px", fontWeight: "800", color: "#f0f6ff", margin: "0 0 6px", letterSpacing: "-0.3px" },
  demoPanelSub: { fontSize: "12px", color: "#64748b", margin: 0 },
  demoCard: { padding: "16px 18px", borderRadius: "14px", border: "1px solid", cursor: "pointer", transition: "all 0.25s", textAlign: "left", width: "100%", fontFamily: "'Outfit', sans-serif" },

  // OAuth setup card
  oauthSetupCard: { background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "14px", padding: "16px" },
  consoleDeepLink: { display: "flex", alignItems: "center", justifyContent: "center", padding: "9px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#3b82f6", textDecoration: "none", fontSize: "12px", fontWeight: "600" },
  pasteClientBtn: { padding: "9px", background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.15))", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "8px", color: "#60a5fa", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'Outfit', sans-serif" },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" },
  statChip: { display: "flex", gap: "8px", alignItems: "center", padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", fontSize: "16px" }
};
