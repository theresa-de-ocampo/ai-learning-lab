import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs } from "ai";

import { GENERATIVE_MODEL } from "./utils/constants.js";
import { knowledgeBaseSearch } from "./utils/tools.js";
import { getSystemPrompt } from "./utils/prompts.js";

async function main() {
  const DEFAULT_ERROR_MESSAGE = "Sorry, an unexpected error occurred.";
  // const query = "How do I export the code in Scrimba";
  // const query = "What is the capital of France?";
  const query = "What are the latest OpenAI models?";

  try {
    const systemPrompt = await getSystemPrompt();
    const response = await generateText({
      model: openai(GENERATIVE_MODEL),
      instructions: systemPrompt,
      prompt: query,
      tools: {
        knowledgeBaseSearch,
        webSearch: openai.tools.webSearch()
      },
      stopWhen: stepCountIs(5)
    });

    console.log();
    console.log(response.text);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? `: ${error.message} ${error.stack}`
        : DEFAULT_ERROR_MESSAGE;
    console.error(errorMessage);
  }
}

main();
