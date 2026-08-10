import "dotenv/config";
import OpenAI from "openai";
import { toResponseInputItems } from "openai/lib/responses/ResponseInputItems";

import { tools, availableTools, isValidTool } from "./tools.js";

// * Types
import type { ResponseInput } from "openai/resources/responses/responses";

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

export async function agent(query: string) {
  const messages: ResponseInput = [
    {
      type: "message",
      role: "system",
      content:
        "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers."
    },
    {
      type: "message",
      role: "user",
      content: query
    }
  ];

  const MAX_ITERATIONS = 5;

  for (let i = 0; i <= MAX_ITERATIONS; i++) {
    const response = await openai.responses.create({
      model: AI_MODEL,
      input: messages,
      tools
    });
    console.log(`Iteration #${i}`);
    console.dir(response.output, { depth: null });
    console.log(" ");

    // Preserve the complete ordered output, including reasoning and tool-call items.
    messages.push(...toResponseInputItems(response.output));

    const toolCalls = response.output.filter(
      (item) => item.type === "function_call"
    );

    if (toolCalls.length === 0) {
      return response.output_text;
    } else {
      for (const toolCall of toolCalls) {
        const { name, arguments: args } = toolCall;

        if (!isValidTool(name)) {
          throw new Error(`Unknown tool call: ${name}`);
        }

        const toolArgs = JSON.parse(args) as unknown;
        console.log(`Tool call: ${name}`);
        console.log("Tool arguments:");
        console.dir(toolArgs, { depth: null });

        const toolOutput = await availableTools[name](toolArgs);
        console.log("Tool output:");
        console.dir(toolOutput, { depth: null });
        console.log(" ");

        messages.push({
          type: "function_call_output",
          call_id: toolCall.call_id,
          output: JSON.stringify(toolOutput)
        });
      }
    }
  }

  throw new Error(
    "Agent stopped after reaching the maximum number of iterations"
  );
}

const question = "Give me some fun activity ideas for today.";
// const question = "Give me some fun activity ideas for today at California, USA."
// const question = "What's my current location?"
const response = await agent(question);
console.log(response);
