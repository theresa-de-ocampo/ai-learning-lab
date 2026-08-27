import { retrieveSimilarDocs } from "./retrieve-documents.js";
import { openai } from "./utils/clients.js";
import { GENERATIVE_MODEL } from "./utils/constants.js";
import { combineDocuments, getRagPrompt } from "./utils/prompt.js";

async function main(query: string) {
  const retrievedDocs = await retrieveSimilarDocs(query);

  const context = combineDocuments(retrievedDocs);
  const prompt = getRagPrompt(context, query);

  const response = await openai.responses.create({
    model: GENERATIVE_MODEL,
    input: prompt
  });

  console.log(response.output_text);
}

// const question = "In 1843, what was the key milestone in computing?"
const question =
  "How many houses were damaged during the great fire of london?";
await main(question);
