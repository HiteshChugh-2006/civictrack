const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  otpCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 900 } // Auto-expires after 15 minutes
});

module.exports = mongoose.model("PendingUser", pendingUserSchema);
