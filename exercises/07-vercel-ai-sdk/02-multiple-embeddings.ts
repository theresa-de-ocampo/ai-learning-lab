import { embedMany } from "ai";
import { openai } from "./utils/clients.js";
import { EMBEDDING_MODEL } from "./utils/constants.js";

import fs from "node:fs/promises";
import path from "node:path";

async function generateEmbeddings() {
  const result = await embedMany({
    model: openai.embeddingModel(EMBEDDING_MODEL),
    values: [
      "Spider-Man: Homecoming",
      "Spider-Man: Far From Home",
      "Spider-Man: No Way Home"
    ]
  });

  const filePath = path.join("..", "artifacts", "07-vercel-ai-sdk");
  await fs.mkdir(filePath, { recursive: true });

  const fileName = path.join(filePath, "02-multiple-embeddings.json");
  await fs.writeFile(fileName, JSON.stringify(result));

  console.dir(result.embeddings, { depth: null });
}

generateEmbeddings();
