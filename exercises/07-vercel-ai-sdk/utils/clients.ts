import "dotenv/config";
import { createOpenAI } from "@ai-sdk/openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY");
}

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
