const express = require("express");
const axios = require("axios");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const auth = require("../middleware/auth");

// ==========================================
// 🔐 PURE-JS GOOGLE AUTHENTICATOR (TOTP) UTILS
// ==========================================

// Generate 16-character base32 secret
function generateSecret(length = 16) {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < length; i++) {
    secret += base32chars.charAt(Math.floor(Math.random() * base32chars.length));
  }
  return secret;
}

// Convert Base32 string to Buffer
function base32ToBuffer(base32) {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (let i = 0; i < base32.length; i++) {
    const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
    if (val !== -1) {
      bits += val.toString(2).padStart(5, '0');
    }
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}

// Verify TOTP code (standard 30s window + drift window of 1 interval)
function verifyTOTP(token, secret) {
  try {
    const key = base32ToBuffer(secret);
    const epoch = Math.round(new Date().getTime() / 1000.0);
    const timeStep = Math.floor(epoch / 30);

    for (let i = -1; i <= 1; i++) {
      const counter = timeStep + i;
      const buffer = Buffer.alloc(8);
      buffer.writeUInt32BE(0, 0);
      buffer.writeUInt32BE(counter, 4);

      const hmac = crypto.createHmac("sha1", key);
      hmac.update(buffer);
      const hmacResult = hmac.digest();

      const offset = hmacResult[hmacResult.length - 1] & 0xf;
      const code =
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff);

      const otp = (code % 1000000).toString().padStart(6, "0");
      if (otp === token) {
        return true;
      }
    }
  } catch (err) {
    console.error("Error verifying TOTP:", err);
  }
  return false;
}

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json("User already exists");
    }

    // Clean up previous registration attempts for this email
    await PendingUser.deleteMany({ email });

    // Generate 6-digit verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const hashed = await bcrypt.hash(password, 10);

    // Create PendingUser entry
    await PendingUser.create({
      name,
      email,
      password: hashed,
      otpCode
    });

    console.log(`\n==========================================`);
    console.log(`📧 [EMAIL OTP] Verification Code for ${email}: ${otpCode}`);
    console.log(`==========================================\n`);

    res.json({
      success: true,
      requireOTP: true,
      email,
      message: "Verification OTP generated. Code printed in server console."
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= VERIFY REGISTER OTP =================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, code } = req.body;

    const pending = await PendingUser.findOne({ email });
    if (!pending) {
      return res.status(400).json("No registration request found or OTP expired. Please sign up again.");
    }

    if (pending.otpCode !== code) {
      return res.status(400).json("Invalid verification code. Please try again.");
    }

    // Move to User collection
    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      role: "citizen"
    });

    // Delete pending record
    await PendingUser.deleteOne({ _id: pending._id });

    // Auto-generate token to log them in immediately
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user,
      message: "Account verified and registered successfully!"
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json("Invalid credentials");

    // 2FA Verification redirection if enabled
    if (user.twoFactorEnabled) {
      return res.json({
        require2FA: true,
        userId: user._id
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= 2FA VERIFY LOGIN =================
router.post("/login/2fa-verify", async (req, res) => {
  try {
    const { userId, code } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(400).json("User not found");

    const isValid = verifyTOTP(code, user.twoFactorSecret);
    if (!isValid) return res.status(400).json("Invalid OTP code");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("User not found");

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${req.protocol}://${req.get("host")}/reset-password?token=${token}`;
    console.log(`[PASS RESET] Link generated for ${email}: ${resetLink}`);

    res.json({
      success: true,
      message: "Reset link generated successfully. Code printed in console.",
      token, // Return token for development fallback
      resetLink
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json("Invalid or expired reset token");
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password updated successfully!" });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= 2FA SETUP (AUTH REQ) =================
router.post("/2fa/setup", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(400).json("User not found");

    // Generate secret if not already set or generate fresh one
    const secret = generateSecret();
    user.twoFactorSecret = secret;
    await user.save();

    const otpauthUrl = `otpauth://totp/CivicTrack:${user.email}?secret=${secret}&issuer=CivicTrack`;
    const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(otpauthUrl)}`;

    res.json({
      secret,
      qrUrl
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= 2FA VERIFY & ENABLE (AUTH REQ) =================
router.post("/2fa/verify", auth, async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(400).json("User not found");

    const isValid = verifyTOTP(code, user.twoFactorSecret);
    if (!isValid) return res.status(400).json("Invalid verification code");

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ success: true, message: "2FA enabled successfully!" });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= 2FA DISABLE (AUTH REQ) =================
router.post("/2fa/disable", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(400).json("User not found");

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.json({ success: true, message: "2FA disabled successfully." });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= SOCIAL LOGIN / SIGNUP =================
router.post("/social-login", async (req, res) => {
  try {
    const { email, name, provider } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      // Auto-provision a new citizen user for social logins
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashed = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name,
        email,
        password: hashed,
        role: "citizen"
      });
      console.log(`[SOCIAL SIGNUP] Provisioned citizen account for ${email} via ${provider}`);
    } else {
      console.log(`[SOCIAL LOGIN] Authenticated ${email} via ${provider}`);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ================= REAL GOOGLE OAUTH LOGIN / SIGNUP =================
router.post("/google-login", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json("ID Token is required");
    }

    // Verify token with Google's tokeninfo API
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const payload = response.data;

    if (!payload.email) {
      return res.status(400).json("Invalid Google Token payload");
    }

    const { email, name, sub: googleId, picture } = payload;
    let user = await User.findOne({ email });

    if (!user) {
      // Auto-provision a new citizen user for Google Sign-In
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashed = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: name || "Google User",
        email,
        password: hashed,
        googleId: googleId || "",
        avatar: picture || "",
        role: "citizen",
        lastLogin: new Date()
      });
      console.log(`[GOOGLE OAUTH SIGNUP] Registered account for ${email}`);
    } else {
      // Update google metadata on subsequent logins
      user.googleId = googleId || user.googleId;
      user.avatar = picture || user.avatar;
      user.lastLogin = new Date();
      await user.save();
      console.log(`[GOOGLE OAUTH LOGIN] Authenticated user ${email}`);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user
    });

  } catch (err) {
    console.error("Google Auth Token Error:", err.message);
    res.status(400).json("Google authentication failed. Invalid token.");
  }
});

// ================= DEMO LOGIN (Admin / Worker Preview) =================
router.post("/demo-login", async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["admin", "worker"].includes(role)) {
      return res.status(400).json("Invalid demo role. Must be 'admin' or 'worker'.");
    }

    const demoEmail = `demo_${role}@civictrack.demo`;
    const demoName = role === "admin" ? "Demo Admin" : "Demo Worker";

    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashed = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: demoName,
        email: demoEmail,
        password: hashed,
        role,
        isDemo: true,
        lastLogin: new Date()
      });
      console.log(`[DEMO ACCOUNT] Created demo ${role} account: ${demoEmail}`);
    } else {
      user.lastLogin = new Date();
      await user.save();
      console.log(`[DEMO LOGIN] Demo ${role} logged in`);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      user,
      isDemo: true,
      message: `Demo ${role} access granted! Expires in 2 hours.`
    });

  } catch (err) {
    console.error("Demo login error:", err.message);
    res.status(500).json("Demo login failed.");
  }
});

module.exports = router;
