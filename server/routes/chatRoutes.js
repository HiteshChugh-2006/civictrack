const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

// 🔥 OpenRouter setup (FREE AI)
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "google/gemma-2-9b-it:free", // ✅ free model
      messages: [
        {
          role: "system",
          content:
            "You are CivicTrack AI, a helpful, intelligent assistant. While you specialize in guiding users on reporting civic issues (potholes, garbage, water, street lights) and navigating CivicTrack, you are also a general-purpose AI (like ChatGPT) capable of answering any questions, writing code, analyzing data, or chatting about any topic the user desires. Keep your tone friendly, professional, and engaging."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    console.log(err);
    res.status(500).json("AI error ❌");
  }
});

module.exports = router;