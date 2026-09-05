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
    "A colorful image of an astronaut cycling on the moon, with a vibrant Earth in the background. Include glowing tire tracks, colorful alien plants, and crystals on the lunar surface."
});

const imageBase64 = result?.data?.[0].b64_json;

if (imageBase64) {
  const imageBytes = Buffer.from(imageBase64, "base64");

  const filePath = path.join("..", "artifacts", "09-multimodality");
  await fs.mkdir(filePath, { recursive: true });

  const fileName = path.join(filePath, "03-descriptive-prompt.png");
  await fs.writeFile(fileName, imageBytes);

  console.log(result.data?.[0].revised_prompt);
}
