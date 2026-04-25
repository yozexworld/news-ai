const express = require("express");
const axios = require("axios");
const Parser = require("rss-parser");
const cors = require("cors");

const app = express();
app.use(cors());

const parser = new Parser();

// 🔥 YOUR GEMINI KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const RSS_URL =
  "https://news.google.com/rss/search?q=rajasthan&hl=hi&gl=IN&ceid=IN:hi";

// 🟢 FIXED AI FUNCTION
async function getSummary(text) {
  try {
    const res = await axios.post(
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
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Summary नहीं मिला"
    );
  } catch (err) {
    console.log("AI ERROR:", err.response?.data || err.message);
    return "Summary error आया है";
  }
}

// 🟢 NEWS API
app.get("/news", async (req, res) => {
  try {
    const feed = await parser.parseURL(RSS_URL);

    let result = [];

    for (let item of feed.items.slice(0, 5)) {
      const summary = await getSummary(item.title);

      result.push({
        title: item.title,
        summary: summary,
        link: item.link
      });
    }

    res.json(result);
  } catch (e) {
    res.send("Server error");
  }
});

// 🟢 PORT FIX (IMPORTANT FOR RENDER)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🔥 Server running on " + PORT));
