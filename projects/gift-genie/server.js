import "dotenv/config";
import OpenAI from "openai";
import express from "express";
import { readFileSync } from "node:fs";

const systemPrompt = readFileSync(
  new URL("./prompts/system.md", import.meta.url),
  "utf8"
);

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL
});

const messages = [
  {
    role: "system",
    content: systemPrompt
  }
];

app.post("/api/gift", async (req, res) => {
  const { userPrompt } = req.body;
  messages.push({
    role: "user",
    content: userPrompt
  });

  try {
    const stream = await openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages,
      stream: true
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");

    for await (const chunk of stream) {
      res.write(
        `data: ${JSON.stringify({ message: chunk.choices[0].delta.content })}\n\n`
      );
    }
  } catch (error) {
    console.error(error);

    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to start stream" });
    } else {
      res.write(
        `event: error\ndata: ${JSON.stringify({ error: "Stream Failed" })}\n\n`
      );
    }
  } finally {
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
