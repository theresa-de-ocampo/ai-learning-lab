import OpenAI from "openai";
import {
  checkEnvironment,
  OPENAI_COMPATIBLE_ENV
} from "../shared/check-environment.js";

checkEnvironment(process.env, OPENAI_COMPATIBLE_ENV);

// Initialize the OpenAI client using environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL
});

/**
 * Challenge: Separating Intent from Instructions
 *
 * Right now, our entire prompt lives in a single user message.
 * This works — but it’s fragile.
 *
 * Your job is to:
 *
 * 1. Move the behavioral instructions into a system message
 * 2. Keep the user's actual request clean and minimal
 * 3. Send both messages in the messages array
 *
 */
const messages: OpenAI.ChatCompletionMessageParam[] = [
  {
    role: "user",
    content: "Suggest some gifts for someone who loves hiphop music. "
  },
  {
    role: "system",
    content:
      "Make your suggestions thoughtful and practical. Your response must be under 100 words. Skip intros and conclusions. Only output gift suggestions."
  }
];

const response = await openai.chat.completions.create({
  model: process.env.AI_MODEL,
  messages
});

// Extract the model's generated text from the response
console.log(response.choices[0].message.content);
