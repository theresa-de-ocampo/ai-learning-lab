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

app.post("/api/gift", async (req, res) => {
  const messages = [
    {
      role: "system",
      content: systemPrompt
    }
  ];
  const { userPrompt } = req.body;
  messages.push({
    role: "user",
    content: userPrompt
  });

  try {
    const stream = await openai.responses.create({
      model: process.env.AI_MODEL,
      input: messages,
      stream: true,
      tools: [{ type: "web_search" }],
      tool_choice: "required"
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");

    for await (const chunk of stream) {
      if (chunk.type === "response.output_text.delta") {
        res.write(`data: ${JSON.stringify({ message: chunk.delta })}\n\n`);
      }

      checkForStreamFailure(chunk);
    }
  } catch (error) {
    console.error(error);

    if (!res.headersSent) {
      res.status(500).send("Failed to start stream");
    } else {
      res.write(
        `event: error\ndata: ${JSON.stringify({ error: error?.message || "Stream Failed" })}\n\n`
      );
    }
  } finally {
    res.end();
  }
});

function checkForStreamFailure(chunk) {
  let errorMessage;

  if (chunk.type === "error") {
    errorMessage = chunk.message;
  } else if (chunk.type === "response.failed") {
    errorMessage = chunk.response.error?.message;
  } else if (chunk.type === "response.incomplete") {
    errorMessage = chunk.response.incomplete_details?.reason;
  }

  if (errorMessage) {
    throw new Error(errorMessage);
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
