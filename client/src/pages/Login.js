import { useState, useEffect } from "react";
import API from "../api"; // ✅ FIXED
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

  // Social Login Simulator (Google / Facebook / Twitter)
  const handleSocialLogin = async (provider) => {
    let email = "";
    let name = "";
    if (provider === "google") {
      email = "google-user@gmail.com";
      name = "Google Citizen";
    } else if (provider === "facebook") {
      email = "fb-user@gmail.com";
      name = "Facebook Citizen";
    } else if (provider === "twitter") {
      email = "twitter-user@gmail.com";
      name = "Twitter Citizen";
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/social-login", { email, name, provider });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      redirectUser(user.role);
    } catch (err) {
      alert(`Social Login with ${provider} failed.`);
    } finally {
      setLoading(false);
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
                  <button onClick={() => handleSocialLogin("google")} style={styles.socialBtn}>
                    Google
                  </button>
                  <button onClick={() => handleSocialLogin("facebook")} style={styles.socialBtn}>
                    Facebook
                  </button>
                  <button onClick={() => handleSocialLogin("twitter")} style={styles.socialBtn}>
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
  }
};
