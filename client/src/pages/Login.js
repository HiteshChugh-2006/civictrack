import { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  // Basic login state
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [require2FA, setRequire2FA] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [tempUserId, setTempUserId] = useState("");

  // Forgot / Reset password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Interactive Social OAuth Modal States
  const [activeSocial, setActiveSocial] = useState(null); // 'google' | 'facebook' | 'twitter' | null
  const [socialForm, setSocialForm] = useState({ name: "", email: "", password: "" });
  const [socialLoading, setSocialLoading] = useState(false);

  // Canvas particle background effect
  useEffect(() => {
    const canvas = document.getElementById("login-particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = (canvas.width = window.innerWidth);
      height = (canvas.height = window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    const particles = [];
    const count = 55;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1
      });
    }

    let mouse = { x: null, y: null };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    let frameId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(59, 130, 246, 0.35)";
      ctx.strokeStyle = "rgba(59, 130, 246, 0.08)";

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 100) {
            ctx.lineWidth = 1 - dist / 100;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        if (mouse.x && mouse.y) {
          const mDist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (mDist < 120) {
            const angle = Math.atan2(p.y - mouse.y, p.x - mouse.x);
            p.x += Math.cos(angle) * 1.5;
            p.y += Math.sin(angle) * 1.5;
          }
        }
      });

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Standard Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.email || !data.password) {
      alert("⚠️ Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/login", data);
      
      if (res.data.require2FA) {
        setRequire2FA(true);
        setTempUserId(res.data.userId);
        setLoading(false);
      } else {
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        redirectUser(user.role);
      }
    } catch (err) {
      alert(err.response?.data || "Login Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // Google 2FA Code Submit
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      alert("Please enter a valid 6-digit OTP code");
      return;
    }

    try {
      setOtpLoading(true);
      const res = await API.post("/auth/login/2fa-verify", {
        userId: tempUserId,
        code: otpCode
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      redirectUser(user.role);
    } catch (err) {
      alert(err.response?.data || "2FA verification failed! Check code.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Trigger Social Modal Popup
  const handleOpenSocialModal = (provider) => {
    setActiveSocial(provider);
    setSocialForm({ name: "", email: "", password: "" });
  };

  // Submit Social Credentials (capturing custom typed Gmail/FB/Twitter info)
  const submitSocialLogin = async (e) => {
    e.preventDefault();
    if (!socialForm.email || !socialForm.name) {
      alert("Please provide both full name and account email/ID.");
      return;
    }

    try {
      setSocialLoading(true);
      const res = await API.post("/auth/social-login", {
        email: socialForm.email,
        name: socialForm.name,
        provider: activeSocial
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      setActiveSocial(null);
      alert(`Successfully signed in with ${activeSocial[0].toUpperCase() + activeSocial.slice(1)} account! 🎉`);
      redirectUser(user.role);
    } catch (err) {
      alert(`Social sign-in with ${activeSocial} failed.`);
    } finally {
      setSocialLoading(false);
    }
  };

  // Forgot Password Trigger
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      alert("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/forgot-password", { email: forgotEmail });
      setForgotSuccess(res.data.resetLink);
      setResetToken(res.data.token); // Store token directly to easily test resetting
    } catch (err) {
      alert(err.response?.data || "Password recovery request failed.");
    } finally {
      setLoading(false);
    }
  };

  // Reset Password Action
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/reset-password", {
        token: resetToken,
        password: newPassword
      });
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgot(false);
        setForgotEmail("");
        setForgotSuccess("");
        setResetToken("");
        setNewPassword("");
        setResetSuccess(false);
      }, 2000);
    } catch (err) {
      alert(err.response?.data || "Reset password failed.");
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (role) => {
    if (role === "admin") navigate("/admin");
    else if (role === "worker") navigate("/worker");
    else navigate("/dashboard");
  };

  return (
    <div style={styles.container}>
      <canvas id="login-particles" className="particle-canvas" />

      <div className="glass-card" style={{ zIndex: 2 }}>
        {/* FORGOT PASSWORD SECTION */}
        {showForgot ? (
          <div>
            <h2 style={styles.title}>Password Recovery</h2>
            {!forgotSuccess ? (
              <form onSubmit={handleForgotPassword} style={{ marginTop: "15px" }}>
                <p style={styles.subtitle}>Enter email to receive password reset details.</p>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={forgotEmail}
                  className="glass-input"
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <button type="submit" className="premium-btn" disabled={loading}>
                  {loading ? "Sending..." : "Request Reset Link"}
                </button>
              </form>
            ) : (
              <div>
                {!resetSuccess ? (
                  <form onSubmit={handleResetPassword} style={{ marginTop: "15px" }}>
                    <div style={styles.alertBox}>
                      <span style={{ fontSize: "12px", display: "block" }}>✔️ Recovery key generated! Enter your new password below:</span>
                    </div>
                    <input
                      type="password"
                      placeholder="New Password (min 6 chars)"
                      value={newPassword}
                      className="glass-input"
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button type="submit" className="premium-btn" disabled={loading}>
                      {loading ? "Resetting..." : "Update Password"}
                    </button>
                  </form>
                ) : (
                  <div style={styles.alertBoxSuccess}>
                    <span>Password updated! Redirecting to login...</span>
                  </div>
                )}
              </div>
            )}
            <p className="premium-link" onClick={() => {
              setShowForgot(false);
              setForgotSuccess("");
              setForgotEmail("");
            }}>
              Back to Login
            </p>
          </div>
        ) : (
          /* LOGIN OR 2FA SCREEN */
          <div>
            {require2FA ? (
              /* GOOGLE 2FA OTP VALIDATION FORM */
              <form onSubmit={handleVerify2FA}>
                <div style={styles.iconContainer}>🔐</div>
                <h2 style={styles.title}>2FA Verification</h2>
                <p style={styles.subtitle}>Enter the 6-digit Google Authenticator OTP code to verify your identity.</p>

                <input
                  placeholder="e.g. 123456"
                  value={otpCode}
                  className="glass-input"
                  style={{ textAlign: "center", fontSize: "18px", letterSpacing: "5px" }}
                  maxLength={6}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  required
                />

                <button type="submit" className="premium-btn" disabled={otpLoading}>
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <p className="premium-link" onClick={() => setRequire2FA(false)}>
                  Cancel Verification
                </p>
              </form>
            ) : (
              /* STANDARD LOGIN + SOCIAL LOGINS FORM */
              <div>
                <div style={styles.iconContainer}>🚀</div>
                <h2 style={styles.title}>CivicTrack Login</h2>
                <p style={styles.subtitle}>Welcome back! Access your dashboard.</p>

                <form onSubmit={handleSubmit}>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={data.email}
                    className="glass-input"
                    onChange={(e) =>
                      setData({ ...data, email: e.target.value })
                    }
                    required
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={data.password}
                    className="glass-input"
                    onChange={(e) =>
                      setData({ ...data, password: e.target.value })
                    }
                    required
                  />

                  <div style={styles.forgotContainer}>
                    <span style={styles.forgotLink} onClick={() => setShowForgot(true)}>
                      Forgot Password?
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="premium-btn"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                {/* SOCIAL AUTH BUTTONS */}
                <div style={styles.socialDivider}>
                  <span style={styles.dividerLine}></span>
                  <span style={styles.dividerText}>or sign in with</span>
                  <span style={styles.dividerLine}></span>
                </div>

                <div style={styles.socialGrid}>
                  <button onClick={() => handleOpenSocialModal("google")} style={styles.socialBtn}>
                    Google
                  </button>
                  <button onClick={() => handleOpenSocialModal("facebook")} style={styles.socialBtn}>
                    Facebook
                  </button>
                  <button onClick={() => handleOpenSocialModal("twitter")} style={styles.socialBtn}>
                    Twitter
                  </button>
                </div>

                <p className="premium-link" onClick={() => navigate("/register")}>
                  New user? Create an account
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* INTERACTIVE SOCIAL OAUTH POPUP WINDOW OVERLAY */}
      {activeSocial && (
        <div style={styles.socialOverlay}>
          <div style={styles.oauthWindow}>
            {/* Mock browser titlebar chrome */}
            <div style={styles.browserHeader}>
              <div style={styles.browserDots}>
                <span style={{ ...styles.dot, backgroundColor: "#ef4444" }}></span>
                <span style={{ ...styles.dot, backgroundColor: "#eab308" }}></span>
                <span style={{ ...styles.dot, backgroundColor: "#22c55e" }}></span>
              </div>
              <div style={styles.browserAddressBar}>
                {activeSocial === "google" && "🔒 accounts.google.com/o/oauth2/v2/auth?client_id=civictrack&response_type=code"}
                {activeSocial === "facebook" && "🔒 facebook.com/v12.0/dialog/oauth?client_id=civictrack&redirect_uri=..."}
                {activeSocial === "twitter" && "🔒 api.twitter.com/oauth/authenticate?oauth_token=civictrack_token"}
              </div>
              <button style={styles.browserClose} onClick={() => setActiveSocial(null)}>×</button>
            </div>

            {/* Provider Form Content Area */}
            <div style={{
              ...styles.oauthContent,
              backgroundColor: activeSocial === "google" ? "#ffffff" : activeSocial === "facebook" ? "#ffffff" : "#000000",
              color: activeSocial === "google" ? "#1f1f1f" : activeSocial === "facebook" ? "#1c1e21" : "#e7e9ea"
            }}>
              {activeSocial === "google" && (
                <div style={styles.googleContainer}>
                  <div style={styles.googleLogo}>
                    <span style={{ color: "#4285F4" }}>G</span>
                    <span style={{ color: "#EA4335" }}>o</span>
                    <span style={{ color: "#FBBC05" }}>o</span>
                    <span style={{ color: "#4285F4" }}>g</span>
                    <span style={{ color: "#34A853" }}>l</span>
                    <span style={{ color: "#EA4335" }}>e</span>
                  </div>
                  <h3 style={styles.googleTitle}>Sign in</h3>
                  <p style={styles.googleSub}>to continue to <b>CivicTrack</b></p>

                  <form onSubmit={submitSocialLogin}>
                    <input
                      placeholder="Full Name"
                      value={socialForm.name}
                      style={styles.googleInput}
                      onChange={(e) => setSocialForm({ ...socialForm, name: e.target.value })}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address (e.g. gmail)"
                      value={socialForm.email}
                      style={styles.googleInput}
                      onChange={(e) => setSocialForm({ ...socialForm, email: e.target.value })}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      style={styles.googleInput}
                      value={socialForm.password}
                      onChange={(e) => setSocialForm({ ...socialForm, password: e.target.value })}
                      required
                    />
                    
                    <div style={styles.googleFooter}>
                      <span style={styles.googleCreateLink}>Create account</span>
                      <button type="submit" style={styles.googleBtn} disabled={socialLoading}>
                        {socialLoading ? "Signing in..." : "Next"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeSocial === "facebook" && (
                <div style={styles.fbContainer}>
                  <div style={styles.fbLogo}>facebook</div>
                  <div style={styles.fbCard}>
                    <p style={styles.fbCardText}>Log in to use your Facebook account with <b>CivicTrack</b>.</p>
                    <form onSubmit={submitSocialLogin}>
                      <input
                        placeholder="Full Name"
                        value={socialForm.name}
                        style={styles.fbInput}
                        onChange={(e) => setSocialForm({ ...socialForm, name: e.target.value })}
                        required
                      />
                      <input
                        type="email"
                        placeholder="Mobile number or email address"
                        value={socialForm.email}
                        style={styles.fbInput}
                        onChange={(e) => setSocialForm({ ...socialForm, email: e.target.value })}
                        required
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        style={styles.fbInput}
                        value={socialForm.password}
                        onChange={(e) => setSocialForm({ ...socialForm, password: e.target.value })}
                        required
                      />
                      <button type="submit" style={styles.fbBtn} disabled={socialLoading}>
                        {socialLoading ? "Logging In..." : "Log In"}
                      </button>
                    </form>
                    <div style={styles.fbCardFooter}>
                      <span>Forgot account?</span> · <span>Sign up for Facebook</span>
                    </div>
                  </div>
                </div>
              )}

              {activeSocial === "twitter" && (
                <div style={styles.xContainer}>
                  <div style={styles.xLogo}>𝕏</div>
                  <h3 style={styles.xTitle}>Sign in to Twitter</h3>
                  
                  <form onSubmit={submitSocialLogin} style={{ width: "100%", maxWidth: "300px" }}>
                    <input
                      placeholder="Full Name"
                      value={socialForm.name}
                      style={styles.xInput}
                      onChange={(e) => setSocialForm({ ...socialForm, name: e.target.value })}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Phone, email, or username"
                      value={socialForm.email}
                      style={styles.xInput}
                      onChange={(e) => setSocialForm({ ...socialForm, email: e.target.value })}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      style={styles.xInput}
                      value={socialForm.password}
                      onChange={(e) => setSocialForm({ ...socialForm, password: e.target.value })}
                      required
                    />
                    
                    <button type="submit" style={styles.xBtn} disabled={socialLoading}>
                      {socialLoading ? "Signing in..." : "Log in"}
                    </button>
                  </form>
                  <div style={styles.xFooter}>
                    <span>Forgot password?</span> · <span>Sign up for X</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)",
    padding: "20px",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden"
  },
  iconContainer: {
    fontSize: "36px",
    marginBottom: "12px",
    display: "inline-block"
  },
  title: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "24px",
    margin: "0 0 4px 0"
  },
  subtitle: {
    color: "#64748b",
    fontSize: "14px",
    margin: "0 0 20px 0"
  },
  forgotContainer: {
    textAlign: "right",
    marginTop: "2px",
    marginBottom: "10px"
  },
  forgotLink: {
    color: "#60a5fa",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "500",
    textDecoration: "none"
  },
  socialDivider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "20px 0 15px 0",
    gap: "10px"
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255, 255, 255, 0.08)"
  },
  dividerText: {
    fontSize: "11px",
    color: "#475569",
    textTransform: "uppercase"
  },
  socialGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginBottom: "15px"
  },
  socialBtn: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "10px 5px",
    borderRadius: "8px",
    color: "#cbd5e1",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease"
  },
  alertBox: {
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    padding: "10px",
    borderRadius: "8px",
    color: "#60a5fa",
    textAlign: "left",
    marginBottom: "10px",
    lineHeight: "1.4"
  },
  alertBoxSuccess: {
    background: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.25)",
    padding: "10px",
    borderRadius: "8px",
    color: "#4ade80",
    textAlign: "center",
    marginBottom: "15px"
  },

  // Mock Browser OAuth Styling
  socialOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(2, 6, 23, 0.8)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    boxSizing: "border-box"
  },
  oauthWindow: {
    width: "480px",
    height: "550px",
    borderRadius: "12px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex",
    flexDirection: "column"
  },
  browserHeader: {
    height: "40px",
    background: "#1e293b",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    padding: "0 15px",
    gap: "15px"
  },
  browserDots: {
    display: "flex",
    gap: "6px"
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%"
  },
  browserAddressBar: {
    flex: 1,
    background: "#0f172a",
    borderRadius: "6px",
    fontSize: "11px",
    color: "#94a3b8",
    padding: "5px 10px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    border: "1px solid rgba(255,255,255,0.05)"
  },
  browserClose: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "18px",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1
  },
  oauthContent: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "30px",
    boxSizing: "border-box"
  },

  // Google OAuth Modal Content
  googleContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Roboto, sans-serif"
  },
  googleLogo: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "15px",
    letterSpacing: "-0.5px"
  },
  googleTitle: {
    fontSize: "22px",
    margin: "0 0 5px 0",
    fontWeight: "400",
    color: "#202124"
  },
  googleSub: {
    fontSize: "14px",
    margin: "0 0 30px 0",
    color: "#5f6368"
  },
  googleInput: {
    width: "100%",
    padding: "14px",
    margin: "8px 0",
    borderRadius: "4px",
    border: "1px solid #dadce0",
    background: "white",
    color: "#202124",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none"
  },
  googleFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: "25px"
  },
  googleCreateLink: {
    color: "#1a73e8",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer"
  },
  googleBtn: {
    background: "#1a73e8",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s"
  },

  // Facebook OAuth Modal Content
  fbContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Helvetica, Arial, sans-serif"
  },
  fbLogo: {
    color: "#1877f2",
    fontSize: "36px",
    fontWeight: "bold",
    marginBottom: "20px",
    letterSpacing: "-1px"
  },
  fbCard: {
    background: "#ffffff",
    border: "1px solid #dddfe2",
    borderRadius: "8px",
    padding: "20px",
    width: "100%",
    maxWidth: "360px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, .1)",
    boxSizing: "border-box"
  },
  fbCardText: {
    fontSize: "14px",
    color: "#606770",
    textAlign: "center",
    margin: "0 0 15px 0",
    lineHeight: "1.4"
  },
  fbInput: {
    width: "100%",
    padding: "14px 12px",
    margin: "6px 0",
    borderRadius: "6px",
    border: "1px solid #dddfe2",
    background: "#ffffff",
    color: "#1c1e21",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none"
  },
  fbBtn: {
    background: "#1877f2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
  },
  fbCardFooter: {
    textAlign: "center",
    fontSize: "12px",
    color: "#1877f2",
    marginTop: "15px",
    cursor: "pointer"
  },

  // Twitter/X OAuth Modal Content
  xContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Segoe UI, Arial, sans-serif"
  },
  xLogo: {
    fontSize: "44px",
    fontWeight: "bold",
    marginBottom: "25px",
    color: "#ffffff"
  },
  xTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "25px",
    color: "#ffffff"
  },
  xInput: {
    width: "100%",
    padding: "16px 12px",
    margin: "8px 0",
    borderRadius: "4px",
    border: "1px solid #333333",
    background: "#000000",
    color: "#e7e9ea",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none"
  },
  xBtn: {
    background: "#ffffff",
    color: "#0f1419",
    border: "none",
    borderRadius: "20px",
    width: "100%",
    padding: "12px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px"
  },
  xFooter: {
    fontSize: "13px",
    color: "#1d9bf0",
    marginTop: "25px",
    cursor: "pointer"
  }
};
