import fs from "fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CLEAR_TABLE,
  DOCUMENTS_DIR,
  EMBEDDING_BATCH_SIZE,
  EMBEDDING_MODEL,
  TABLE_NAME
} from "./utils/constants.js";
import { openai, supabase } from "./utils/clients.js";
import { splitter } from "./utils/helpers.js";

import type { Document, DocumentChunk } from "./types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function truncateTable() {
  if (CLEAR_TABLE) {
    console.log(`Clearing existing records from table ${TABLE_NAME} ...`);

    const { error } = await supabase.from(TABLE_NAME).delete().neq("id", -1);

    if (error) {
      console.warn(
        `Warning: Could not clear existing records: ${error.code} ${error.message}`
      );
    } else {
      console.log(`Cleared existing records.`);
    }
  }
}

async function splitDocuments(docsDir: string, files: string[]) {
  const chunks: DocumentChunk[] = [];

  for (const filename of files) {
    console.log(`Splitting File: ${filename}`);
    const filePath = path.join(docsDir, filename);
    const content = await fs.readFile(filePath, { encoding: "utf-8" });
    const fileChunks = await splitter.createDocuments(
      [content],
      [{ source: filename }]
    );

    chunks.push(
      ...fileChunks.map((chunk) => ({
        content: chunk.pageContent,
        metadata: chunk.metadata
      }))
    );

    console.log(`Split ${filename} into ${fileChunks.length} chunks.`);
  }

  return chunks;
}

async function createEmbeddings(chunks: DocumentChunk[]) {
  const documents: Document[] = [];

  for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);

    console.log(
      `Creating embeddings for chunks ${i + 1}-${i + batch.length} of ${chunks.length} ...`
    );

    try {
      const embeddingResponse = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batch.map((chunk) => chunk.content)
      });

      documents.push(
        ...embeddingResponse.data.map((embedding, index) => ({
          ...batch[index],
          embedding: embedding.embedding
        }))
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message ? `: ${error.message}` : "";
      console.error(
        `Failed to embed chunk batch starting at ${i + 1}${errorMessage}`
      );
    }
  }

  return documents;
}

async function insertDocuments(documents: Document[]) {
  console.log(
    `Uploading ${documents.length} records to table '${TABLE_NAME}' ...`
  );
  const { error } = await supabase.from(TABLE_NAME).insert(documents);

  if (error) {
    console.error(`Error inserting records: ${error.code} ${error.message}`);
  } else {
    console.log(`Successfully inserted ${documents.length} records.`);
  }
}

async function ingestDocuments() {
  const docsDir = path.join(__dirname, DOCUMENTS_DIR);
  await fs.mkdir(docsDir, { recursive: true });

  try {
    const files = await fs.readdir(docsDir);

    if (files.length === 0) {
      console.log(`No files found in ${docsDir}. Nothing to ingest.`);
      return;
    }

    await truncateTable();
    const chunks = await splitDocuments(docsDir, files);

    if (chunks.length === 0) {
      console.log("No file content was split into chunks. Aborting upload.");
      return;
    }

    const documents = await createEmbeddings(chunks);

    if (documents.length === 0) {
      console.log(
        "No file was successfully converted to an embedding. Aborting upload."
      );
      return;
    }

    await insertDocuments(documents);
    console.log("--- Ingestion Complete ---");
  } catch (error) {
    console.error("--- Ingestion Failed! ---");
    console.error(error);
    process.exit(1);
  }
}

ingestDocuments();
