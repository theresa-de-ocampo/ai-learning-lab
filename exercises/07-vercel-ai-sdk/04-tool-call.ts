import { generateText, tool, isStepCount } from "ai";
import z from "zod";
import { openai } from "./lib/clients.js";
import { GENERATIVE_MODEL } from "./lib/constants.js";

async function generateResponseFromToolCalls() {
  const MAX_ITERATIONS = 5;

  const weather = tool({
    description: "Gets the current weather for a location.",
    inputSchema: z.object({
      location: z.string()
    }),
    execute: async ({ location }) => ({
      location,
      temperature: 40 + Math.floor(Math.random() * 21)
    })
  });

  const cityAttractions = tool({
    description: "Get attractions for a city",
    inputSchema: z.object({
      city: z.string()
    }),
    execute: async ({ city }) => ({
      city,
      attractions: ["Central Park", "Met Museum"]
    })
  });

  const result = await generateText({
    model: openai(GENERATIVE_MODEL),
    tools: {
      weather,
      cityAttractions
    },
    prompt:
      "What is the weather in New York and what are the best attractions to visit.",
    //   "The weather is currently hot and sunny (30° C) at Makati City. What are the best tourist attractions to visit for today?",
    stopWhen: isStepCount(MAX_ITERATIONS)
  });

  // * With the prompt above, this will log all tool calls first before the tool results.
  // * This is as expected because the prompt caused the model to
  // * request two tools in the same assistant step.
  const toolEvents = result.steps.flatMap((step) =>
    step.content.filter(
      (part) => part.type === "tool-call" || part.type === "tool-result"
    )
  );

  console.dir(toolEvents, { depth: null });

  // * While the SDK exposes getters, this does not preserve the chronological order of events.
  // console.dir([...result.toolCalls, ...result.toolResults], { depth: null });
}

generateResponseFromToolCalls();
