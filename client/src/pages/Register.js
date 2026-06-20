import { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  // OTP Verification States
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailForOTP, setEmailForOTP] = useState("");

  // Canvas particle background effect
  useEffect(() => {
    const canvas = document.getElementById("register-particles");
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

  // Submit Registration (triggers OTP code dispatch)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.name || !data.email || !data.password) {
      alert("⚠️ Fill all fields");
      return;
    }

    try {
      const res = await API.post("/auth/register", data);
      
      if (res.data.requireOTP) {
        setEmailForOTP(res.data.email);
        setShowOTP(true);
        alert("✉️ Verification OTP code sent to your email! (Please check backend console logs)");
      } else {
        alert("Registered Successfully ✅");
        navigate("/");
      }

    } catch (err) {
      console.error(err);
      alert(err?.response?.data || "Registration failed ❌");
    }
  };

  // Submit OTP Code Validation
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      alert("Please enter a valid 6-digit OTP code");
      return;
    }

    try {
      setOtpLoading(true);
      const res = await API.post("/auth/verify-otp", {
        email: emailForOTP,
        code: otpCode
      });
      
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      alert("Account Verified & Registered Successfully! 🎉");
      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data || "Verification failed! Check code.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Real Google Sign-in Callback
  const handleGoogleCredentialResponse = async (response) => {
    try {
      const res = await API.post("/auth/google-login", { idToken: response.credential });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      alert("Successfully registered & logged in with Google! 🎉");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data || "Google authentication failed.");
    }
  };

  // Initialize official Google Sign-In SDK
  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "2754246588-a400n83jgh1j4c86gq9a1b945d8b8jgh.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });

        const btnElement = document.getElementById("google-signin-btn");
        if (btnElement) {
          window.google.accounts.id.renderButton(btnElement, {
            theme: "outline",
            size: "large",
            width: "320",
            text: "signup_with",
            shape: "rectangular"
          });
        }
      }
    };

    const timer = setTimeout(initGoogle, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOTP]);

  return (
    <div style={styles.container}>
      <canvas id="register-particles" className="particle-canvas" />

      <div className="glass-card" style={{ zIndex: 2 }}>
        {showOTP ? (
          /* OTP VERIFICATION VIEW */
          <form onSubmit={handleVerifyOTP}>
            <div style={styles.iconContainer}>✉️</div>
            <h2 style={styles.title}>Email OTP Verification</h2>
            <p style={styles.subtitle}>Enter the 6-digit verification code sent to <b>{emailForOTP}</b>.</p>

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
              {otpLoading ? "Verifying..." : "Verify & Activate"}
            </button>

            <p className="premium-link" onClick={() => {
              setShowOTP(false);
              setOtpCode("");
            }}>
              Back to Register
            </p>
          </form>
        ) : (
          /* STANDARD REGISTRATION VIEW */
          <div>
            <div style={styles.iconContainer}>📝</div>
            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}>Join CivicTrack to report & track issues.</p>

            {/* REAL OFFICIAL GOOGLE SIGN-IN BUTTON CONTAINER */}
            <div style={styles.googleBtnContainer}>
              <div id="google-signin-btn"></div>
            </div>

            <div style={styles.socialDivider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>or register with email</span>
              <span style={styles.dividerLine}></span>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                placeholder="Full Name"
                value={data.name}
                className="glass-input"
                onChange={(e) =>
                  setData({ ...data, name: e.target.value })
                }
                required
              />

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

              <button type="submit" className="premium-btn">
                Register
              </button>
            </form>

            <p onClick={() => navigate("/")} className="premium-link">
              Already have an account? Login
            </p>
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
    margin: "0 0 24px 0"
  },
  googleBtnContainer: {
    display: "flex",
    justifyContent: "center",
    margin: "15px 0 10px 0",
    width: "100%"
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
  }
};
