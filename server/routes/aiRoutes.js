const express = require("express");
const router = express.Router();
const axios = require("axios");

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    let reply = "";
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemma-2-9b-it:free",
          messages: [
            {
              role: "system",
              content:
                "You are a civic assistant. Help users with civic issues like garbage, roads, water, electricity."
            },
            {
              role: "user",
              content: message
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 6000 // 6 seconds timeout
        }
      );

      reply = response.data.choices[0].message.content;

    } catch (err) {
      console.log("OpenRouter API error/timeout, using local fallback assistant:", err.message);
      
      const msg = (message || "").toLowerCase();
      if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
        reply = "Hello! I am your Civic AI helper. How can I assist you with reporting or tracking public issues today? You can ask me about garbage, potholes, water leaks, or how to use the dashboard.";
      } else if (msg.includes("pothole") || msg.includes("road") || msg.includes("damage")) {
        reply = "To report a pothole or road damage: 1. Click 'Report Issue' in the sidebar. 2. Enter a title and description. 3. Upload an image of the road. 4. Allow location access to automatically tag the map location. 5. Click Submit.";
      } else if (msg.includes("garbage") || msg.includes("dump") || msg.includes("waste")) {
        reply = "If you spot a garbage dump or overflowing waste bin, please report it! Go to 'Report Issue', describe the waste issue, take a picture, and submit. The department will assign a sanitation worker to clear it.";
      } else if (msg.includes("water") || msg.includes("leak") || msg.includes("sewage")) {
        reply = "For water pipe leaks, drainage blockages, or sewage overflows, select the appropriate description and location when submitting a report. These are high-priority issues that our team handles immediately.";
      } else if (msg.includes("light") || msg.includes("electricity") || msg.includes("power")) {
        reply = "Street light failures or electricity hazards can be reported by submitting an issue. Once submitted, the electric department will dispatch a technician to restore the light.";
      } else if (msg.includes("status") || msg.includes("track") || msg.includes("my issues")) {
        reply = "You can track the progress of all your reported complaints in the 'My Issues' page. The status will update from 'submitted' to 'assigned', 'in-progress', and finally 'resolved' once a worker uploads a resolution photo.";
      } else if (msg.includes("vote") || msg.includes("upvote")) {
        reply = "You can vote on existing issues reported by other citizens on the 'Browse City Issues' tab in 'My Issues'. Upvoting issues helps prioritize them, showing authorities which complaints need urgent attention.";
      } else {
        reply = "I'm here to help you report civic issues like potholes, water leaks, street light failures, or garbage dumps. You can register/login, click 'Report Issue' to submit a complaint, or check 'My Issues' to track resolution progress. Upvote issues on the city feed to raise their priority.";
      }
    }

    res.json({ reply });

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "AI failed" });
  }
});

module.exports = router;