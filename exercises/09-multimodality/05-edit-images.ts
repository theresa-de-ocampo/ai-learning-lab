import fs from "node:fs/promises";
import path from "node:path";

import {
  checkEnvironment,
  OPENAI_COMPATIBLE_ENV
} from "../shared/check-environment.js";

import OpenAI, { toFile } from "openai";

checkEnvironment(process.env, OPENAI_COMPATIBLE_ENV);

const filePath = path.join("..", "assets", "images");

const originalBuffer = await fs.readFile(path.join(filePath, "original.jpg"));
const maskedBuffer = await fs.readFile(path.join(filePath, "masked.jpg"));

const originalImage = await toFile(originalBuffer, null, {
  type: "image/jpeg"
});
const maskedImage = await toFile(maskedBuffer, null, { type: "image/jpeg" });

const openai = new OpenAI({
  apiKey: process.env.AI_KEY
});

const result = await openai.images.edit({
  model: process.env.AI_MODEL,
  image: [originalImage, maskedImage],
  prompt:
    "Fix the background of the original image by removing or reducing the clouds that are obstructing Mt. Fuji, so that Mt. Fuji is clearly visible. Keep the rest of the image unchanged and preserve the original lighting, colors, and overall realism."
});

const imageBase64 = result?.data?.[0].b64_json;

if (imageBase64) {
  const imageBytes = Buffer.from(imageBase64, "base64");

  const filePath = path.join("..", "artifacts", "09-multimodality");
  await fs.mkdir(filePath, { recursive: true });

  const fileName = path.join(filePath, "05-edited-image.png");
  await fs.writeFile(fileName, imageBytes);
}
