import OpenAI from "openai";
import { checkEnvironment } from "../shared/check-environment.js";
import fs from "node:fs/promises";
import path from "node:path";

checkEnvironment(process.env, ["AI_KEY"]);

const client = new OpenAI({
  apiKey: process.env.AI_KEY
});

async function getResponse() {
  const response = await client.responses.create({
    model: "gpt-4.1",
    input: "Write a story about a robot.",
    temperature: 0.7,
    max_output_tokens: 50
  });

  await fs.writeFile(
    path.join("docs", "00-mosh", "01-response.json"),
    JSON.stringify(response)
  );

  console.dir(response, { depth: null });
}

async function getStreamResponse() {
  const stream = await client.responses.create({
    model: "gpt-4.1",
    input: "Write a story about a robot.",
    temperature: 0.7,
    max_output_tokens: 250,
    stream: true
  });

  for await (const event of stream) {
    // console.dir(event, { depth: null });
    // This is the event that represents a chunk of text or token being generated at run time.
    if (event.type === "response.output_text.delta") {
      process.stdout.write(event.delta);
    }
  }
}

console.log("*** Without Stream ***");
await getResponse();

console.log(" ");
console.log("*** With Stream ***");
await getStreamResponse();
