import { embedMany } from "ai";
import { openai } from "./lib/clients.js";
import { EMBEDDING_MODEL } from "./lib/constants.js";

async function generateEmbeddings() {
  const result = await embedMany({
    model: openai.embeddingModel(EMBEDDING_MODEL),
    values: [
      "Spider-Man: Homecoming",
      "Spider-Man: Far From Home",
      "Spider-Man: No Way Home"
    ]
  });

  console.dir(result.embeddings, { depth: null });
}

generateEmbeddings();
