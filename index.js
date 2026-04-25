require("dotenv").config();
const express = require("express");
const Parser = require("rss-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const parser = new Parser();

// 🌍 Google News RSS
const RSS_URL =
  "https://news.google.com/rss/search?q=rajasthan&hl=hi&gl=IN&ceid=IN:hi";

// 🔑 Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/* ==============================
   🏠 HOME ROUTE (FIXED ERROR)
============================== */
app.get("/", (req, res) => {
  res.send("🔥 News AI Server Running Successfully. Use /news");
});

/* ==============================
   🧠 GEMINI SUMMARY FUNCTION
============================== */
async function getSummary(text) {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `इस खबर को 80 शब्दों में हिंदी में summarize करो:\n${text}`
              }
            ]
          }
        ]
      }
    );

    // 🔥 SAFE CHECK (IMPORTANT)
    const data = res.data;

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Summary उपलब्ध नहीं है"
    );
  } catch (err) {
    return "Summary error आया है";
  }
}

/* ==============================
   📰 NEWS API ROUTE
============================== */
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
  } catch (err) {
    res.status(500).send("error");
  }
});

/* ==============================
   🚀 SERVER START
============================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 Server running on port " + PORT);
});
