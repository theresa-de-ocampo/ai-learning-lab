import fs from "node:fs/promises";
import path from "node:path";
import { CharacterTextSplitter } from "@langchain/textsplitters";

const file = path.join("..", "assets", "podcasts.txt");
const text = await fs.readFile(file, { encoding: "utf8" });

const splitter = new CharacterTextSplitter({
  separator: " ",
  chunkSize: 150,
  chunkOverlap: 15
});

const output = await splitter.createDocuments([text]);

console.dir(output, { depth: null });
