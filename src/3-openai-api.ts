import "dotenv/config";
import OpenAI from "openai";
import fs from "node:fs/promises";

const { AI_API_KEY, AI_URL, AI_MODEL } = process.env;

if (!AI_API_KEY) {
  throw new Error("Missing AI_API_KEY");
}

if (!AI_URL) {
  throw new Error("Missing AI_URL");
}

if (!AI_MODEL) {
  throw new Error("Missing AI_MODEL");
}

const client = new OpenAI({
  apiKey: AI_API_KEY,
  baseURL: AI_URL
});

const userMessage: OpenAI.ChatCompletionUserMessageParam = {
  role: "user",
  content: "Suggest some gifts for someone who loves hiphop music."
};

// We're not building a chatbot
// The AI text generation we're going to use is called chat completions
// The Chat Completions API - introduced in 2023
// It's not just for chatbots, it's the standard API for any kind of text generation
// (e.g., explanations, summaries, recommendations)
// Sometimes referred to as the v1 Chat Completions API
const response = await client.chat.completions.create({
  model: AI_MODEL,
  messages: [userMessage],
  max_completion_tokens: 256
});

console.log(response.choices[0].message.content);

await fs.writeFile("./docs/gpt-5-nano.json", JSON.stringify(response));
