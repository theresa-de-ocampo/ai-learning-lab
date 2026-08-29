import { generateText, Output } from "ai";
import { z } from "zod";

import { openai } from "./utils/clients.js";
import { GENERATIVE_MODEL } from "./utils/constants.js";

async function basicStructuredOutput() {
  const result = await generateText({
    model: openai(GENERATIVE_MODEL),
    prompt: "Write a sinigang recipe for 4 people.",
    output: Output.object({
      schema: z.object({
        name: z.string(),
        ingredients: z.array(
          z.object({
            name: z.string(),
            amount: z.string()
          })
        ),
        steps: z.array(z.string())
      })
    })
  });

  console.dir(result.output, { depth: null });
}

async function classificationStructuredOutput() {
  const result = await generateText({
    model: openai(GENERATIVE_MODEL),
    prompt:
      "Classify this customer review: I tried the app and it worked exactly as I expected.",
    output: Output.object({
      schema: z.object({
        type: z
          .enum(["positive", "negative"])
          .describe("Sentiment of the customer review."),
        reasoning: z
          .string()
          .describe("Brief reasoning for the classification choice.")
      })
    })
  });

  console.dir(result.output, { depth: null });
}

async function main() {
  await basicStructuredOutput();
  await classificationStructuredOutput();
}

main();
