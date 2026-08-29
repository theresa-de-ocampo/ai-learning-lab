import { tool } from "ai";
import z from "zod";
import { retrieveSimilarDocs } from "../retrieve-documents.js";

export const knowledgeBaseSearch = tool({
  description:
    "Retrieves specific information about Scrimba to answer user's question.",
  inputSchema: z.object({
    query: z.string()
  }),
  execute: retrieveSimilarDocs
});
