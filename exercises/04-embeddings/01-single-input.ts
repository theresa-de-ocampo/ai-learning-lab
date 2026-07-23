import OpenAI from "openai";
import { checkEnvironment } from "../utils/check-environment.js";

checkEnvironment(process.env);

// For text-embedding-ada-002 and text-embedding-3-small,
// the length or dimension of embedding array is 1536.
// Regardless of the size of the input text, there will always be 1536 numbers in the array.

const client = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL
});

const response = await client.embeddings.create({
  model: process.env.AI_MODEL,
  input: "Hello World!"
});

console.dir(response, { depth: null });
