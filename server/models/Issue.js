const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  video: String,
  category: {
    type: String,
    enum: ["pothole", "waterlogging", "garbage", "streetlight", "drainage", "encroachment", "noise", "other"],
    default: "other"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  location: {
    lat: Number,
    lng: Number
  },
  address: { type: String, default: "" },
  completionImage: String,
  completionVideo: String,
  remarks: String,
  aiAnalysis: { type: String, default: "" },
  status: {
    type: String,
    enum: ["submitted", "verified", "assigned", "in-progress", "resolved", "rejected"],
    default: "submitted"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  votes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  resolvedAt: { type: Date },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Issue", issueSchema);