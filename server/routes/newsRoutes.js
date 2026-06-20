const express = require("express");
const router = express.Router();
const News = require("../models/News");
const auth = require("../middleware/auth");

// 📢 CREATE ANNOUNCEMENT (ADMIN ONLY)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("Only administrator can publish news");
    }

    const { title, content, type } = req.body;
    if (!title || !content) {
      return res.status(400).json("Title and content are required");
    }

    const alertItem = await News.create({
      title,
      content,
      type: type || "announcement"
    });

    res.json(alertItem);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// 📢 GET ALL ANNOUNCEMENTS (PUBLIC/AUTHENTICATED)
router.get("/", auth, async (req, res) => {
  try {
    const bulletins = await News.find().sort({ createdAt: -1 });
    res.json(bulletins);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
