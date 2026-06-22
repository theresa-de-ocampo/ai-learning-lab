import OpenAI from "openai";
import { checkEnvironment } from "../utils/check-environment.js";

const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL
});

checkEnvironment(process.env);

const response = await openai.responses.create({
  model: process.env.AI_MODEL,
  input: "Best foldable phones right now available in Asia.",
  tools: [{ type: "web_search" }]
});

console.log(response.output_text);
