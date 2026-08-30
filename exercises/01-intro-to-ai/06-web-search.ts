import OpenAI from "openai";
import {
  checkEnvironment,
  OPENAI_COMPATIBLE_ENV
} from "../shared/check-environment.js";

checkEnvironment(process.env, OPENAI_COMPATIBLE_ENV);

const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL
});

const response = await openai.responses.create({
  model: process.env.AI_MODEL,
  input: "Best foldable phones right now available in Asia.",
  tools: [{ type: "web_search" }]
});

console.log(response.output_text);
