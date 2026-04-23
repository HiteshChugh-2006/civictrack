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
      model: "mistralai/mistral-7b-instruct", // ✅ free model
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for a Civic Issue Reporting System. Guide users about reporting issues, map, and status."
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