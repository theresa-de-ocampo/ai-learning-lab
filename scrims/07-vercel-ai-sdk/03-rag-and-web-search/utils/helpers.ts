import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000,
  chunkOverlap: 100
});
