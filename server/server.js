const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();

// 🔥 MIDDLEWARE FIRST
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/issues", require("./routes/issueRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));

app.use("/uploads", express.static("uploads"));

let PORT = process.env.PORT || 5000;
if (PORT === "undefined" || PORT === "null" || !PORT) {
  PORT = 5000;
}

let MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/civictrack";
if (MONGO_URI === "undefined" || MONGO_URI === "null" || !MONGO_URI) {
  MONGO_URI = "mongodb://127.0.0.1:27017/civictrack";
}

// DB
mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Connection Error:", err.message));

// SERVER
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

// Serve frontend
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("/*", (req, res) => {
  const filePath = path.join(__dirname, "../client/build/index.html");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending index.html:", err.message);
      res.status(404).json({
        success: false,
        status: 404,
        message: "CivicTrack Frontend Build Not Found",
        error: err.message
      });
    }
  });
});

// Custom 404 fallback for unhandled requests
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `CivicTrack Custom Route Not Found: ${req.originalUrl}`
  });
});
