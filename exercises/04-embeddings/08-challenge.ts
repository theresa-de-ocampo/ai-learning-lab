import fs from "node:fs/promises";
import path from "node:path";

import { openai, supabase } from "../shared/clients.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Document } from "@langchain/core/documents";
import { PostgrestError } from "@supabase/supabase-js";

/*
  Challenge: Text Splitters, Embeddings, and Vector Databases!
    1. Use LangChain to split the content in movies.txt into smaller chunks.
    2. Use OpenAI's Embedding model to create an embedding for each chunk.
    3. Insert all text chunks and their corresponding embedding
       into a Supabase database table.
 */

/* Split movies.txt into text chunks.
Return LangChain's "output" – the array of Document objects. */
async function splitDocument(document: string) {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      chunkOverlap: 15
    });

    return await splitter.createDocuments([document]);
  } catch (error) {
    console.error("There was an issue with splitting the text");
    throw error;
  }
}

/* Create an embedding from each text chunk.
Store all embeddings and corresponding text in Supabase. */
async function createAndStoreEmbeddings(
  documents: Document<Record<string, any>>[]
) {
  try {
    const chunks = documents.map((document) => document.pageContent);

    const embeddings = await openai.embeddings.create({
      input: chunks,
      model: "text-embedding-3-small"
    });
    const data = embeddings.data.map(({ embedding }, i) => {
      return {
        chunk: chunks[i],
        embedding
      };
    });

    const { error } = await supabase.from("movies").insert(data);

    if (error) {
      throw error;
    }

    console.log("Done!");
  } catch (error) {
    let message = "There was an issue with creating the embeddings";
    if (error instanceof PostgrestError) {
      message = error.message;
    }
    console.error(message);
  }
}

async function main() {
  const file = path.join("..", "assets", "movies.txt");
  const document = await fs.readFile(file, { encoding: "utf8" });
  const chunkedDocuments = await splitDocument(document);
  await createAndStoreEmbeddings(chunkedDocuments);
}

main();
