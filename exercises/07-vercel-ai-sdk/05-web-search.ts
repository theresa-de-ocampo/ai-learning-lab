import "dotenv/config";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

import { GENERATIVE_MODEL } from "./lib/constants.js";

async function main() {
  const { text, sources } = await generateText({
    model: openai(GENERATIVE_MODEL),
    tools: {
      webSearch: openai.tools.webSearch()
    },
    prompt:
      "What companies are currently hiring AI Engineers in Makati, Philippines?"
  });

  console.log(text);
  console.dir(sources, { depth: null });
}

main();
