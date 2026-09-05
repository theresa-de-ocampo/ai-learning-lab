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

const { data = [] } = await openai.images.generate({
  model: process.env.AI_MODEL,
  prompt: "An astronaut riding a bicycle on the moon.",
  n: 3
});

for (let i = 0; i < data?.length; i++) {
  const imageBase64 = data?.[i]?.b64_json;

  if (imageBase64) {
    const imageBytes = Buffer.from(imageBase64, "base64");

    const filePath = path.join(
      "..",
      "artifacts",
      "09-multimodality",
      "02-multiple-outputs"
    );
    await fs.mkdir(filePath, { recursive: true });

    const fileName = path.join(filePath, `v${i}.png`);
    await fs.writeFile(fileName, imageBytes);
  }
}
