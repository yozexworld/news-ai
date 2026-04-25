require("dotenv").config();
const express = require("express");
const Parser = require("rss-parser");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());

const parser = new Parser();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const RSS_URL = "https://news.google.com/rss/search?q=rajasthan&hl=hi&gl=IN&ceid=IN:hi";

app.get("/news", async (req, res) => {
  try {
    const feed = await parser.parseURL(RSS_URL);

    let result = [];

    for (let item of feed.items.slice(0, 5)) {
     const ai = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "user",
      content: `इस खबर को 80 शब्दों में हिंदी में summarize करो:\n${item.title}`
    }
  ]
});

      result.push({
        title: item.title,
        summary: ai.choices[0].message.content,
        link: item.link
      });
    }

    res.json(result);
  } catch (e) {
    res.send("error");
  }
});

app.listen(3000, () => console.log("running"));
