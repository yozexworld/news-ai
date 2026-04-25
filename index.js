require("dotenv").config();

const express = require("express");
const axios = require("axios");
const Parser = require("rss-parser");
const cors = require("cors");

const app = express();
app.use(cors());

const parser = new Parser();

// 🔥 Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 🌍 RSS NEWS
const RSS_URL =
  "https://news.google.com/rss/search?q=rajasthan&hl=hi&gl=IN&ceid=IN:hi";

// 🧠 Gemini Summary Function
async function getSummary(text) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `इस खबर को 60-80 शब्दों में आसान हिंदी में summarize करो:\n${text}`
              }
            ]
          }
        ]
      }
    );

    return (
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Summary नहीं मिला"
    );
  } catch (err) {
    console.log("Gemini Error:", err.response?.data || err.message);
    return "Summary error आया है";
  }
}

// 🏠 Home Route
app.get("/", (req, res) => {
  res.send("🔥 News AI Server Running Successfully");
});

// 📰 News Route
app.get("/news", async (req, res) => {
  try {
    const feed = await parser.parseURL(RSS_URL);

    let result = [];

    for (let item of feed.items.slice(0, 5)) {
      const summary = await getSummary(item.title);

      result.push({
        title: item.title,
        summary,
        link: item.link
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// 🔥 Test Gemini Route
app.get("/test-gemini", async (req, res) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: "Hello in Hindi in one line" }]
          }
        ]
      }
    );

    res.json({
      success: true,
      reply:
        response.data.candidates?.[0]?.content?.parts?.[0]?.text
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

// 🚀 PORT (Render Ready)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 Server running on port " + PORT);
});
