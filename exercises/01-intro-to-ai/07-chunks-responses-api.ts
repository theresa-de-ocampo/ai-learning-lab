import OpenAI from "openai";
import type { ResponseInput } from "openai/resources/responses/responses";
import fs from "node:fs/promises";
import path from "node:path";
import {
  checkEnvironment,
  OPENAI_COMPATIBLE_ENV
} from "../shared/check-environment.js";

checkEnvironment(process.env, OPENAI_COMPATIBLE_ENV);

// Initialize the OpenAI client using environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL
});

const messages: ResponseInput = [
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

const stream = await openai.responses.create({
  model: process.env.AI_MODEL,
  input: messages,
  stream: true
});

const outputDirectory = path.join(
  "..",
  "artifacts",
  "01-intro-to-ai",
  "07-chunks-responses-api"
);
await fs.mkdir(outputDirectory, { recursive: true });

let chunkNumber = 0;

for await (const chunk of stream) {
  chunkNumber += 1;

  const fileName = `chunk-${String(chunkNumber).padStart(2, "0")}.json`;
  const filePath = path.join(outputDirectory, fileName);

  await fs.writeFile(filePath, JSON.stringify(chunk, null, 2));
}
