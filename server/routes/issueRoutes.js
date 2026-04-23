const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
const auth = require("../middleware/auth");

const multer = require("multer");
const path = require("path");

// 📸 Multer Storage Config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


// 🔐 CREATE ISSUE (WITH IMAGE + LOCATION)
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    let location = null;

    // ✅ Safe location parsing
    if (req.body.location) {
      try {
        location = JSON.parse(req.body.location);
      } catch {
        return res.status(400).json("Invalid location format");
      }
    }

    const issue = await Issue.create({
      title: req.body.title,
      description: req.body.description,
      location,
      image: req.file ? req.file.filename : "",
      createdBy: req.user.id,
      status: "submitted"
    });

    res.json(issue);

  } catch (err) {
    console.error(err);
    res.status(500).json("Error creating issue");
  }
});


// 🔐 GET ALL ISSUES
router.get("/", auth, async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.json(issues);

  } catch (err) {
    res.status(500).json("Error fetching issues");
  }
});


// 👨‍💼 ASSIGN ISSUE TO WORKER (ADMIN ONLY)
router.put("/assign/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("Only admin can assign");
    }

    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json("Worker ID required");
    }

    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: workerId,
        status: "assigned"
      },
      { new: true }
    )
      .populate("assignedTo", "name email");

    res.json(updated);

  } catch (err) {
    res.status(500).json("Error assigning worker");
  }
});


// 👷 GET WORKER TASKS
router.get("/worker", auth, async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json("Only worker can access");
    }

    const issues = await Issue.find({
      assignedTo: req.user.id
    })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.json(issues);

  } catch (err) {
    res.status(500).json("Error fetching worker issues");
  }
});


router.put("/complete/:id", auth, upload.single("image"), async (req, res) => {
  console.log("🔥 COMPLETE ROUTE HIT");  // IMPORTANT

  try {
    const { remarks } = req.body;

    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
        completionImage: req.file ? `uploads/${req.file.filename}` : "",
        remarks
      },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Completion failed" });
  }
});
module.exports = router;