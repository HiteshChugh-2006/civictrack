const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  location: {
    lat: Number,
    lng: Number
  },completionImage: String,
remarks: String,
  status: {
    type: String,
    enum: ["submitted", "verified", "assigned", "in-progress", "resolved"],
    default: "submitted"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  votes: {
    type: Number,
    default: 0
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"   // 🔥 FINAL FIX
  }
}, { timestamps: true });

module.exports = mongoose.model("Issue", issueSchema);