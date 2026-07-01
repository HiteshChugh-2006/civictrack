const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin", "worker", "citizen"],
    default: "citizen"
  },
  avatar: { type: String, default: "" },
  bio: { type: String, default: "" },
  phone: { type: String, default: "" },
  googleId: { type: String, default: "" },
  isDemo: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  issuesReported: { type: Number, default: 0 },
  issuesResolved: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  badges: [{ type: String }],
  lastLogin: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);