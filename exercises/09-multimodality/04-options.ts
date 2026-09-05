import fs from "node:fs/promises";
import path from "node:path";
import { Buffer } from "node:buffer";

import OpenAI from "openai";
import {
  checkEnvironment,
  OPENAI_COMPATIBLE_ENV
} from "../shared/check-environment.js";

checkEnvironment(process.env, OPENAI_COMPATIBLE_ENV);

const openai = new OpenAI({
  apiKey: process.env.AI_KEY
});

const result = await openai.images.generate({
  model: process.env.AI_MODEL,
  prompt:
    "Create a minimal, geometric, modern, and monochromatic logo with word mark for 'ProStore'.",
  size: "1792x1024",
  quality: "high"
});

const imageBase64 = result?.data?.[0].b64_json;

if (imageBase64) {
  const imageBytes = Buffer.from(imageBase64, "base64");

  const filePath = path.join("..", "artifacts", "09-multimodality");
  await fs.mkdir(filePath, { recursive: true });

  const fileName = path.join(filePath, "04-options.png");
  await fs.writeFile(fileName, imageBytes);
}
