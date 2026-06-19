const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
const auth = require("../middleware/auth");

const multer = require("multer");
const path = require("path");

// 📸 STORAGE
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


// =============================
// ✅ CREATE ISSUE
// =============================
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    let location = null;

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


// =============================
// 🔥 GET ISSUES (ROLE BASED)
// =============================
router.get("/", auth, async (req, res) => {
  try {
    let issues;

    if (req.user.role === "admin") {
      // ✅ Admin → ALL
      issues = await Issue.find()
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email");
    } 
    else if (req.user.role === "worker") {
      // ✅ Worker → assigned only
      issues = await Issue.find({ assignedTo: req.user.id })
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email");
    } 
    else {
      // ✅ User → own only
      issues = await Issue.find({ createdBy: req.user.id })
        .populate("assignedTo", "name email");
    }

    res.json(issues);

  } catch (err) {
    res.status(500).json("Error fetching issues");
  }
});


// =============================
// 👨‍💼 ASSIGN WORKER
// =============================
router.put("/assign/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("Only admin can assign");
    }

    const { workerId } = req.body;

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


// =============================
// 👷 WORKER TASKS
// =============================
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


// =============================
// ✅ COMPLETE ISSUE (WORKER)
// =============================
router.put("/complete/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const { remarks } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json("Issue not found");
    }

    // Only the assigned worker or admin can resolve/complete the issue
    if (req.user.role !== "admin" && String(issue.assignedTo) !== String(req.user.id)) {
      return res.status(403).json("Unauthorized: You are not assigned to this issue");
    }

    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
        completionImage: req.file ? req.file.filename : "", // ✅ FIXED
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


// =============================
// 🌎 GET ALL ISSUES (PUBLIC CITY FEED)
// =============================
router.get("/all", auth, async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json("Error fetching all issues");
  }
});

// =============================
// 🗳️ VOTE ON ISSUE (TOGGLE)
// =============================
router.put("/vote/:id", auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json("Issue not found");
    }

    if (!Array.isArray(issue.votes)) {
      issue.votes = [];
    }

    const userIdStr = String(req.user.id);
    const voterIndex = issue.votes.findIndex(v => String(v) === userIdStr);

    if (voterIndex === -1) {
      issue.votes.push(req.user.id);
    } else {
      issue.votes.splice(voterIndex, 1);
    }

    await issue.save();

    const updated = await Issue.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.json(updated);

  } catch (err) {
    console.error(err);
    res.status(500).json("Error processing vote");
  }
});

// =============================
// ✅ UPDATE STATUS
// =============================
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json("Update failed");
  }
});

module.exports = router;