import { Document } from "../types/index.js";

export function combineDocuments(documents: Document[]) {
  return documents.map((document) => document.content).join("\n\n");
}

export function getRagPrompt(context: string, query: string) {
  const basePrompt = `You are a helpful assistant. Answer the user's question based ONLY on the provided context. If the context doesn't contain the answer, state politely "I'm sorry, I don't have specific information about that in the knowledge base.". Do not make up answers.`;

  const contextPrompt = `<context>${context}</context>`;
  const queryPrompt = `<question>${query}</question>`;

  return `${basePrompt}\n${contextPrompt}\n${queryPrompt}`;
}
