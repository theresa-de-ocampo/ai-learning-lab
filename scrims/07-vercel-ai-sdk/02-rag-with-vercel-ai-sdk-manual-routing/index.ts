import { openai } from "./utils/clients.js";
import { generateText, Output } from "ai";
import {
  CLASSIFICATION_MODEL,
  GENERATIVE_MODEL,
  QueryType
} from "./utils/constants.js";
import { retrieveSimilarDocs } from "./retrieve-documents.js";
import { combineDocuments, getRagPrompt } from "./utils/prompt.js";

async function classifyQuery(query: string) {
  const { output } = await generateText({
    model: openai(CLASSIFICATION_MODEL),
    prompt: `Classify the user's question to either 'general' or 'retrieval'. If the question is about Scrimba, return 'retrieval'. Otherwise, respond with 'general'. <query>${query}</query>`,
    output: Output.choice({
      options: Object.values(QueryType)
    })
  });

  console.log(`Classification Result: ${output}`);

  return output;
}

async function handleGeneralQuery(query: string) {
  const { text } = await generateText({
    model: openai(GENERATIVE_MODEL),
    prompt: `Answer the user's question using complete sentence(s). Feel free to use bullets if applicable. <query>${query}</query>`
  });

  return text;
}

async function handleRetrievalQuery(query: string) {
  const retrievedDocs = await retrieveSimilarDocs(query);
  const context = combineDocuments(retrievedDocs);

  const prompt = getRagPrompt(context, query);

  const { text } = await generateText({
    model: openai(GENERATIVE_MODEL),
    prompt
  });

  return text;
}

async function main() {
  const DEFAULT_ERROR_MESSAGE = "Sorry, an unexpected error occurred.";
  const query = "How do I export the code in Scrimba";
  // const query = "What is the capital of France?";

  try {
    const queryType = await classifyQuery(query);
    let reply = DEFAULT_ERROR_MESSAGE;

    if (queryType === QueryType.General) {
      reply = await handleGeneralQuery(query);
    } else if (queryType === QueryType.Retrieval) {
      reply = await handleRetrievalQuery(query);
    }

    console.log(reply);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? `: ${error.message} ${error.stack}`
        : DEFAULT_ERROR_MESSAGE;
    console.error(errorMessage);
  }
}

main();
