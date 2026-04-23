const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// 👷 GET ALL WORKERS
router.get("/workers", auth, async (req, res) => {
  try {
    const workers = await User.find({ role: "worker" });

    console.log("Workers:", workers); // 👈 ADD THIS

    res.json(workers);
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

module.exports = router;