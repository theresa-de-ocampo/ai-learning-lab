import fs from "node:fs/promises";
import path from "node:path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const file = path.join("..", "assets", "podcasts.txt");
const text = await fs.readFile(file, { encoding: "utf8" });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 150,
  chunkOverlap: 15
});

const output = await splitter.createDocuments([text]);

console.dir(output, { depth: null });
