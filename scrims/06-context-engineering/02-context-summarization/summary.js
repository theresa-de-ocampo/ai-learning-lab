import { getTotalTokenCount, getMessageTokenCount } from "./utils.js";
import { generateText } from "ai";
import {
  SUMMARY_MAX_OUTPUT_TOKENS,
  TARGET_CONTEXT_TOKENS
} from "./constants.js";

export function splitForSummary(messages) {
  let tokenCount = getTotalTokenCount(messages);
  let remainingTokenCount = tokenCount;
  let splitIndex = 0;

  while (remainingTokenCount > TARGET_CONTEXT_TOKENS) {
    remainingTokenCount -= getMessageTokenCount(messages[splitIndex]);
    splitIndex++;
  }

  let messagesToSummarize = messages.slice(0, splitIndex);
  let remainingMessages = messages.slice(splitIndex);

  return {
    messagesToSummarize,
    remainingMessages
  };
}

export async function generateSummary(messages, model) {
  const summary = await generateText({
    model,
    messages: [
      ...messages,
      {
        role: "user",
        content:
          "Create a concise, well-organized summary of the entire conversation so far to preserve important context. Focus on extracting key user information, important decisions, and technical details that might be referenced later."
      }
    ],
    maxOutputTokens: SUMMARY_MAX_OUTPUT_TOKENS
  });

  return {
    role: "assistant",
    content: summary.text
  };
}
