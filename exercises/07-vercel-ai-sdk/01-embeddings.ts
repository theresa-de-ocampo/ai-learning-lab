import { generateText, embed } from "ai";

import { openai } from "./lib/clients.js";
import { EMBEDDING_MODEL, GENERATIVE_MODEL } from "./lib/constants.js";

async function generateResponse() {
  const response = await generateText({
    model: openai(GENERATIVE_MODEL),
    prompt: "Write a sinigang recipe for 4 people."
  });

  return response.text;
}

async function generateEmbeddings(textToEmbed: string) {
  console.log(textToEmbed);
  const response = await embed({
    model: openai.embeddingModel(EMBEDDING_MODEL),
    value: textToEmbed
  });

  console.log(response.embedding);
}

async function main() {
  const textToEmbed = await generateResponse();
  await generateEmbeddings(textToEmbed);
}

main();
