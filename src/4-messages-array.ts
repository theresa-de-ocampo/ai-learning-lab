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

const openai = new OpenAI({
  apiKey: AI_API_KEY,
  baseURL: AI_URL
});

/**
 * Challenge: Follow-Up Gift-Genie Conversation
 *
 * The model has no memory!
 * We simulate a conversation history by rebuilding
 * state manually.
 *
 * 1. Store the AI model's first response in the messages array
 * 2. Add a second user message asking for the suggestions to be 
      more budget friendly and under $40.
 * 3. Send a chat completions request with the messages array again
 * 4. Log the final response's content
 *
 * 💡 Check the hints folder for more guidance!
 */

const messages: OpenAI.ChatCompletionMessageParam[] = [
  {
    role: "user",
    content: `Suggest some gifts for someone who loves hiphop music. 
    Make these suggestions thoughtful and practical. Your response 
    must be under 100 words. Skip intros and conclusions. 
    Only output gift suggestions.`
  }
];
const r1 = await openai.chat.completions.create({
  model: AI_MODEL,
  messages
});

messages.push(r1.choices[0].message);
messages.push({
  role: "user",
  content: "Can you make your suggestions more budget friendly and under $40?"
});

const r2 = await openai.chat.completions.create({
  model: AI_MODEL,
  messages
});

// Extract the model's generated text from the response
console.log(r2.choices[0].message.content);

await fs.writeFile("./docs/final.json", JSON.stringify(r2));
