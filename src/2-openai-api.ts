import "dotenv/config";
import OpenAI from "openai";

const { OPENAI_API_KEY } = process.env;

if (!OPENAI_API_KEY) {
  throw new Error("OpenAI API Key is required.");
}

const client = new OpenAI({
  apiKey: OPENAI_API_KEY
});

async function getResponse() {
  const response = await client.responses.create({
    model: "gpt-4.1",
    input: "Write a story about a robot.",
    temperature: 0.7,
    max_output_tokens: 50
  });

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

getStreamResponse();
