import OpenAI from "openai";
import { checkEnvironment } from "../utils/check-environment.js";

checkEnvironment(process.env);

const client = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL
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
  model: process.env.AI_MODEL,
  messages: [userMessage],
  max_completion_tokens: 256
});

console.log(response.choices[0].message.content);
