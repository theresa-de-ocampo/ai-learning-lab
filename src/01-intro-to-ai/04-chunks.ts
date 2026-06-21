import OpenAI from "openai";
import fs from "node:fs/promises";
import path from "node:path";
import { checkEnvironment } from "../utils/check-environment.js";

checkEnvironment(process.env);

// Initialize the OpenAI client using environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL
});

const messages: OpenAI.ChatCompletionMessageParam[] = [
  {
    role: "user",
    content: "Suggest some gifts for someone who loves hiphop music. "
  },
  {
    role: "system",
    content:
      "Make your suggestions thoughtful and practical. Your response must be under 100 words. Skip intros and conclusions. Only output gift suggestions."
  }
];

const stream = await openai.chat.completions.create({
  model: process.env.AI_MODEL,
  messages,
  stream: true
});

const outputDirectory = path.join("docs", "01-intro-to-ai", "04-chunks");
await fs.mkdir(outputDirectory, { recursive: true });

let chunkNumber = 0;

for await (const chunk of stream) {
  chunkNumber += 1;

  const fileName = `chunk-${String(chunkNumber).padStart(2, "0")}.json`;
  const filePath = path.join(outputDirectory, fileName);

  await fs.writeFile(filePath, JSON.stringify(chunk, null, 2));
}
