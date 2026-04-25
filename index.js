const express = require("express");
const axios = require("axios");
const Parser = require("rss-parser");
const cors = require("cors");

const app = express();
app.use(cors());

const parser = new Parser();

// 🔑 Gemini API Key (Render ENV से आएगा)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// News RSS
const RSS_URL =
  "https://news.google.com/rss/search?q=rajasthan&hl=hi&gl=IN&ceid=IN:hi";

// 🧠 AI SUMMARY FUNCTION
async function getSummary(text) {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
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

// 🟢 HOME ROUTE (IMPORTANT)
app.get("/", (req, res) => {
  res.send("🔥 News AI Server Running. Use /news");
});

// 📰 NEWS ROUTE
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
  } catch (e) {
    console.log(e);
    res.send("Server error");
  }
});

// 🚀 PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🔥 Server running on " + PORT));
