const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Issue = require("../models/Issue");
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

// 📊 GET PROFILE STATS & BADGES
router.get("/profile/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role === "worker") {
      const totalTasks = await Issue.countDocuments({ assignedTo: userId });
      const resolvedTasks = await Issue.countDocuments({ assignedTo: userId, status: "resolved" });
      const completionRate = totalTasks > 0 ? Math.round((resolvedTasks / totalTasks) * 100) : 0;

      const badges = [];
      if (resolvedTasks >= 1) badges.push({ id: "first_strike", title: "⚡ First Strike", desc: "Resolved your first task!" });
      if (resolvedTasks >= 5) badges.push({ id: "swift_resolver", title: "🏃 Swift Resolver", desc: "Successfully resolved 5+ issues." });
      if (resolvedTasks >= 10) badges.push({ id: "master_artisan", title: "👑 Master Artisan", desc: "Successfully resolved 10+ issues." });

      res.json({
        totalTasks,
        resolvedTasks,
        completionRate,
        badges
      });
    } else {
      const totalReported = await Issue.countDocuments({ createdBy: userId });
      const resolvedReported = await Issue.countDocuments({ createdBy: userId, status: "resolved" });
      
      const userIssues = await Issue.find({ createdBy: userId });
      let totalUpvotes = 0;
      userIssues.forEach(issue => {
        if (Array.isArray(issue.votes)) {
          totalUpvotes += issue.votes.length;
        }
      });

      const badges = [];
      if (totalReported >= 1) badges.push({ id: "civic_starter", title: "🥉 Civic Starter", desc: "Reported your first city issue!" });
      if (totalReported >= 5) badges.push({ id: "active_observer", title: "🥈 Active Observer", desc: "Reported 5+ city issues." });
      if (totalReported >= 10) badges.push({ id: "city_sentinel", title: "🥇 City Sentinel", desc: "Reported 10+ city issues." });
      if (totalUpvotes >= 5) badges.push({ id: "community_favorite", title: "🌟 Community Favorite", desc: "Received 5+ upvotes on an issue." });
      if (resolvedReported >= 3) badges.push({ id: "civic_hero", title: "🏆 Civic Hero", desc: "Had 3+ reported issues successfully resolved." });

      res.json({
        totalReported,
        resolvedReported,
        totalUpvotes,
        badges
      });
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;