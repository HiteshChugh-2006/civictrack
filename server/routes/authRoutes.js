const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
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

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "citizen"
    });

    res.json(user);

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

module.exports = router;
