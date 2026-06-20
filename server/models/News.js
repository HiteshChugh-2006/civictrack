const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ["announcement", "alert", "update"],
    default: "announcement"
  },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("News", newsSchema);
