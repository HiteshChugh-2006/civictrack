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

  // Google Client ID states
  const [googleClientId, setGoogleClientId] = useState(
    localStorage.getItem("google_client_id") || process.env.REACT_APP_GOOGLE_CLIENT_ID || "2754246588-a400n83jgh1j4c86gq9a1b945d8b8jgh.apps.googleusercontent.com"
  );
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Interactive Social OAuth Modal States
  const [activeSocial, setActiveSocial] = useState(null); // 'google' | 'facebook' | 'twitter' | null
  const [socialForm, setSocialForm] = useState({ name: "", email: "", password: "" });
  const [socialLoading, setSocialLoading] = useState(false);
  const [googleStep, setGoogleStep] = useState(1); // 1: Email, 2: Name/Password, 3: 2-Step Verification
  const [simulatedOTP, setSimulatedOTP] = useState("");
  const [userOTPInput, setUserOTPInput] = useState("");

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

  // Real Google Sign-in Callback
  const handleGoogleCredentialResponse = async (response) => {
    try {
      setLoading(true);
      const res = await API.post("/auth/google-login", { idToken: response.credential });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      alert("Successfully signed in with Google! 🎉");
      redirectUser(user.role);
    } catch (err) {
      alert(err.response?.data || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // Initialize official Google Sign-In SDK
  useEffect(() => {
    if (googleClientId && googleClientId !== "2754246588-a400n83jgh1j4c86gq9a1b945d8b8jgh.apps.googleusercontent.com") {
      const initGoogle = () => {
        /* global google */
        if (typeof google !== "undefined") {
          try {
            google.accounts.id.initialize({
              client_id: googleClientId,
              callback: handleGoogleCredentialResponse,
            });

            const btnElement = document.getElementById("google-signin-btn");
            if (btnElement) {
              google.accounts.id.renderButton(btnElement, {
                theme: "outline",
                size: "large",
                width: "320",
                text: "signin_with",
                shape: "rectangular"
              });
            }
          } catch (err) {
            console.error("Google SDK Initialization failed:", err.message);
          }
        }
      };

      const timer = setTimeout(initGoogle, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForgot, require2FA, googleClientId]);

  // Trigger Secondary Social Modal Popup
  const handleOpenSocialModal = (provider) => {
    setActiveSocial(provider);
    setSocialForm({ name: "", email: "", password: "" });
  };

  // Submit Simulated Social Credentials (capturing custom typed Google/FB/Twitter info)
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

                {/* GOOGLE SIGN-IN BUTTON CONTAINER */}
                <div style={styles.googleBtnContainer}>
                  {googleClientId === "2754246588-a400n83jgh1j4c86gq9a1b945d8b8jgh.apps.googleusercontent.com" ? (
                    <button 
                      type="button"
                      onClick={() => {
                        setGoogleStep(1);
                        setSimulatedOTP("");
                        setUserOTPInput("");
                        handleOpenSocialModal("google");
                      }} 
                      style={styles.mockGoogleBtn}
                    >
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                        alt="Google logo" 
                        style={styles.mockGoogleIcon} 
                      />
                      <span>Sign in with Google</span>
                    </button>
                  ) : (
                    <div id="google-signin-btn"></div>
                  )}
                </div>

                {/* DYNAMIC CONFIGURATION HELPER FOR GOOGLE OAUTH */}
                <div style={{ textAlign: "center", marginBottom: "15px" }}>
                  <span 
                    onClick={() => setShowConfigModal(true)} 
                    style={{ fontSize: "11px", color: "#60a5fa", cursor: "pointer", textDecoration: "underline" }}
                  >
                    ⚙️ Configure Google Client ID / Launch Simulator
                  </span>
                </div>

                <div style={styles.socialDivider}>
                  <span style={styles.dividerLine}></span>
                  <span style={styles.dividerText}>or sign in with email</span>
                  <span style={styles.dividerLine}></span>
                </div>

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

                {/* SECONDARY SOCIAL AUTH BUTTONS */}
                <div style={styles.socialDivider}>
                  <span style={styles.dividerLine}></span>
                  <span style={styles.dividerText}>or other platforms</span>
                  <span style={styles.dividerLine}></span>
                </div>

                <div style={styles.socialGrid}>
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

      {/* GOOGLE CLIENT ID CONFIGURATION MODAL */}
      {showConfigModal && (
        <div style={styles.socialOverlay}>
          <div style={{ ...styles.oauthWindow, height: "420px", backgroundColor: "#0b0f19", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
            <div style={styles.browserHeader}>
              <div style={styles.browserDots}>
                <span style={{ ...styles.dot, backgroundColor: "#ef4444" }}></span>
                <span style={{ ...styles.dot, backgroundColor: "#eab308" }}></span>
                <span style={{ ...styles.dot, backgroundColor: "#22c55e" }}></span>
              </div>
              <div style={styles.browserAddressBar}>🔒 civictrack.config/google-oauth</div>
              <button style={styles.browserClose} onClick={() => setShowConfigModal(false)}>×</button>
            </div>
            
            <div style={{ ...styles.oauthContent, padding: "25px", color: "#f8fafc", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#ffffff", fontWeight: "600", fontSize: "18px", textAlign: "center" }}>⚙️ Google OAuth Settings</h3>
              <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.4", margin: "0 0 20px 0", textAlign: "center" }}>
                Real Google Sign-In requires a client ID registered for your local origin (e.g. <code>{window.location.origin}</code>).
              </p>

              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Google Client ID:</label>
                  <input
                    value={googleClientId}
                    className="glass-input"
                    style={{ margin: 0, fontSize: "12px", padding: "10px" }}
                    placeholder="Enter Google Client ID"
                    onChange={(e) => setGoogleClientId(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button 
                    type="button"
                    onClick={() => {
                      localStorage.setItem("google_client_id", googleClientId);
                      setShowConfigModal(false);
                      alert("Google OAuth Client ID Saved! Re-initializing...");
                    }} 
                    style={{ ...styles.socialBtn, flex: 1, backgroundColor: "#2563eb", color: "#ffffff" }}
                  >
                    Save & Initialize
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowConfigModal(false);
                      setGoogleStep(1);
                      setSimulatedOTP("");
                      setUserOTPInput("");
                      handleOpenSocialModal("google");
                    }} 
                    style={{ ...styles.socialBtn, flex: 1, backgroundColor: "rgba(255, 255, 255, 0.08)", color: "#ffffff" }}
                  >
                    Launch Simulator
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              backgroundColor: activeSocial === "google" ? "#ffffff" : "#ffffff",
              color: "#1c1e21"
            }}>
              {activeSocial === "google" && (
                <div style={styles.googleContainer}>
                  {/* Google Logo */}
                  <div style={styles.googleLogo}>
                    <span style={{ color: "#4285F4" }}>G</span>
                    <span style={{ color: "#EA4335" }}>o</span>
                    <span style={{ color: "#FBBC05" }}>o</span>
                    <span style={{ color: "#4285F4" }}>g</span>
                    <span style={{ color: "#34A853" }}>l</span>
                    <span style={{ color: "#EA4335" }}>e</span>
                  </div>

                  {googleStep === 1 && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!socialForm.email) {
                          alert("Please enter your email address.");
                          return;
                        }
                        setGoogleStep(2);
                      }}
                      style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
                    >
                      <h3 style={styles.googleTitle}>Sign in</h3>
                      <p style={styles.googleSub}>to continue to <b>CivicTrack</b></p>

                      <input
                        type="email"
                        placeholder="Email or phone"
                        value={socialForm.email}
                        style={styles.googleInput}
                        onChange={(e) => setSocialForm({ ...socialForm, email: e.target.value })}
                        required
                        autoFocus
                      />
                      
                      <div style={{ width: "100%", textAlign: "left", margin: "10px 0" }}>
                        <span style={styles.googleCreateLink}>Forgot email?</span>
                      </div>

                      <p style={{ fontSize: "12px", color: "#5f6368", margin: "20px 0 10px 0", textAlign: "left", width: "100%", lineHeight: "1.4" }}>
                        Not your computer? Use Guest mode to sign in privately.
                        <span style={{ color: "#1a73e8", cursor: "pointer", marginLeft: "4px" }}>Learn more</span>
                      </p>

                      <div style={styles.googleFooter}>
                        <span style={styles.googleCreateLink} onClick={() => setGoogleStep(2)}>Create account</span>
                        <button type="submit" style={styles.googleBtn}>
                          Next
                        </button>
                      </div>
                    </form>
                  )}

                  {googleStep === 2 && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!socialForm.name) {
                          alert("Please enter your full name.");
                          return;
                        }
                        if (!socialForm.password) {
                          alert("Please enter your password.");
                          return;
                        }
                        const code = Math.floor(100000 + Math.random() * 900000).toString();
                        setSimulatedOTP(code);
                        setGoogleStep(3);
                      }}
                      style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
                    >
                      <h3 style={styles.googleTitle}>Welcome</h3>
                      
                      <div style={styles.googleUserPill}>
                        <span style={styles.googleUserIcon}>👤</span>
                        <span style={styles.googleUserEmail}>{socialForm.email}</span>
                      </div>

                      <input
                        type="text"
                        placeholder="Full Name"
                        value={socialForm.name}
                        style={styles.googleInput}
                        onChange={(e) => setSocialForm({ ...socialForm, name: e.target.value })}
                        required
                        autoFocus
                      />

                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={socialForm.password || ""}
                        style={styles.googleInput}
                        onChange={(e) => setSocialForm({ ...socialForm, password: e.target.value })}
                        required
                      />

                      <div style={{ width: "100%", textAlign: "left", margin: "10px 0" }}>
                        <span style={styles.googleCreateLink}>Forgot password?</span>
                      </div>

                      <div style={styles.googleFooter}>
                        <span 
                          style={styles.googleCreateLink} 
                          onClick={() => setGoogleStep(1)}
                        >
                          Back
                        </span>
                        <button type="submit" style={styles.googleBtn}>
                          Next
                        </button>
                      </div>
                    </form>
                  )}

                  {googleStep === 3 && (
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (userOTPInput !== simulatedOTP) {
                          alert("❌ Invalid verification code. Please check the simulation code.");
                          return;
                        }
                        await submitSocialLogin(e);
                      }}
                      style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
                    >
                      <h3 style={styles.googleTitle}>2-Step Verification</h3>
                      
                      <div style={styles.googleUserPill}>
                        <span style={styles.googleUserIcon}>👤</span>
                        <span style={styles.googleUserEmail}>{socialForm.email}</span>
                      </div>

                      <p style={{ fontSize: "14px", color: "#3c4043", margin: "15px 0", textAlign: "center", lineHeight: "1.5" }}>
                        A verification code was sent to your backup device. Enter the 6-digit code below to finish signing in.
                      </p>

                      <input
                        placeholder="Enter 6-digit code"
                        value={userOTPInput}
                        maxLength={6}
                        style={{ ...styles.googleInput, textAlign: "center", fontSize: "18px", letterSpacing: "4px" }}
                        onChange={(e) => setUserOTPInput(e.target.value.replace(/\D/g, ""))}
                        required
                        autoFocus
                      />

                      <div style={styles.simulationNotification}>
                        <span style={{ fontSize: "12px", color: "#1e3a8a", fontWeight: "600" }}>🔑 Simulation Code:</span>
                        <span style={{ fontSize: "15px", color: "#1d4ed8", fontWeight: "700", letterSpacing: "1px", marginLeft: "8px" }}>
                          {simulatedOTP}
                        </span>
                      </div>

                      <div style={styles.googleFooter}>
                        <span 
                          style={styles.googleCreateLink} 
                          onClick={() => setGoogleStep(2)}
                        >
                          Back
                        </span>
                        <button type="submit" style={styles.googleBtn} disabled={socialLoading}>
                          Verify
                        </button>
                      </div>
                    </form>
                  )}
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
                <div style={{ ...styles.xContainer, backgroundColor: "#000000", height: "100%", width: "100%", padding: "30px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
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
    margin: "15px 0 10px 0",
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
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "15px",
    maxWidth: "320px",
    margin: "0 auto"
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
  googleBtnContainer: {
    display: "flex",
    justifyContent: "center",
    margin: "15px 0 10px 0",
    width: "100%"
  },
  mockGoogleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    width: "320px",
    height: "44px",
    backgroundColor: "#ffffff",
    border: "1px solid #dadce0",
    borderRadius: "4px",
    color: "#3c4043",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    transition: "background-color 0.2s, box-shadow 0.2s",
    fontFamily: "'Roboto', sans-serif"
  },
  mockGoogleIcon: {
    width: "18px",
    height: "18px"
  },
  googleContainer: {
    width: "100%",
    height: "100%",
    padding: "40px 30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#ffffff",
    color: "#202124",
    fontFamily: "'Roboto', 'Helvetica Neue', sans-serif",
    boxSizing: "border-box"
  },
  googleLogo: {
    fontSize: "24px",
    fontWeight: "500",
    marginBottom: "16px",
    letterSpacing: "-0.5px"
  },
  googleTitle: {
    fontSize: "24px",
    fontWeight: "400",
    color: "#202124",
    margin: "0 0 8px 0",
    textAlign: "center"
  },
  googleSub: {
    fontSize: "16px",
    color: "#5f6368",
    margin: "0 0 30px 0",
    textAlign: "center"
  },
  googleInput: {
    width: "100%",
    padding: "16px 14px",
    margin: "10px 0",
    borderRadius: "4px",
    border: "1px solid #dadce0",
    fontSize: "16px",
    color: "#202124",
    outline: "none",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "'Roboto', sans-serif"
  },
  googleFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: "26px"
  },
  googleCreateLink: {
    color: "#1a73e8",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    userSelect: "none"
  },
  googleBtn: {
    backgroundColor: "#1a73e8",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    boxShadow: "none",
    transition: "background-color 0.2s"
  },
  googleUserPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    borderRadius: "16px",
    border: "1px solid #dadce0",
    backgroundColor: "#ffffff",
    marginBottom: "20px",
    maxWidth: "100%",
    boxSizing: "border-box"
  },
  googleUserIcon: {
    fontSize: "14px"
  },
  googleUserEmail: {
    fontSize: "14px",
    color: "#3c4043",
    fontWeight: "500",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "180px"
  },
  simulationNotification: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    padding: "10px 14px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "16px",
    boxSizing: "border-box"
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
    border: "1px solid rgba(255, 255, 255, 0.15)",
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
    boxSizing: "border-box"
  },

  // Facebook OAuth Modal Content
  fbContainer: {
    width: "100%",
    padding: "30px",
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
