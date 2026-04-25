const express = require("express");
const axios = require("axios");
const Parser = require("rss-parser");
const cors = require("cors");

const app = express();
app.use(cors());

const parser = new Parser();

// ✅ API KEY (ENV से लेना best है)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ सही model (IMPORTANT FIX)
const GEMINI_MODEL = "gemini-1.5-flash-latest";

const RSS_URL =
  "https://news.google.com/rss/search?q=rajasthan&hl=hi&gl=IN&ceid=IN:hi";

// 🟢 GEMINI FUNCTION (FIXED)
async function getSummary(text) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `इस खबर को 60-80 शब्दों में आसान हिंदी में summarize करो:\n${text}`,
              },
            ],
          },
        ],
      }
    );

    return (
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Summary नहीं मिला"
    );
  } catch (err) {
    console.log("❌ AI ERROR:", err.response?.data || err.message);
    return "Summary error आया है";
  }
}

// 🟢 TEST ROUTE (IMPORTANT)
app.get("/test-gemini", async (req, res) => {
  const result = await getSummary("राजस्थान में आज मौसम बहुत गर्म है");
  res.json({ result });
});

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
        link: item.link,
      });
    }

    res.json(result);
  } catch (e) {
    console.log(e);
    res.status(500).send("Server error");
  }
});

// 🟢 PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 Server running on " + PORT);
});
