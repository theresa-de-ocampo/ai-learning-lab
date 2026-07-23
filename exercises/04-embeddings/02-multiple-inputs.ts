import OpenAI from "openai";
import { checkEnvironment } from "../utils/check-environment.js";
import fs from "node:fs/promises";
import path from "node:path";

checkEnvironment(process.env);

const movies = [
  "Hunger Games",
  "Passengers",
  "The Hundred-Foot Journey",
  "Life of Pi"
];

const client = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL
});

const response = await client.embeddings.create({
  model: process.env.AI_MODEL,
  input: movies
});

const filePath = path.join("..", "artifacts", "04-embeddings");

await fs.mkdir(filePath, { recursive: true });

const fileName = path.join(filePath, "02-multiple-inputs.json");

await fs.writeFile(fileName, JSON.stringify(response));

console.dir(response, { depth: null });
