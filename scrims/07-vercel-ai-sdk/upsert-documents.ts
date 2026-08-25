import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs/promises";

import { openai, supabase } from "./utils/clients.js";
import {
  CLEAR_TABLE,
  DOCUMENTS_DIR,
  EMBEDDING_MODEL,
  TABLE_NAME
} from "./utils/constants.js";

import type { Document } from "./types/index.js";

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

async function createEmbeddings(docsDir: string, files: string[]) {
  const documents = [];

  for (const filename of files) {
    console.log(`Processing file: ${filename}`);
    const filePath = path.join(docsDir, filename);
    const content = await fs.readFile(filePath, { encoding: "utf-8" });

    try {
      const embedding = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: content
      });

      documents.push({
        content,
        embedding: embedding.data[0].embedding,
        metadata: {
          source: filename
        }
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message ? `: ${error.message}` : "";
      console.error(`Failed to embed content from ${filename}${errorMessage}`);
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
      `No files found in ${docsDir}. Nothing to ingest.`;
      return;
    }

    await truncateTable();
    const documents = await createEmbeddings(docsDir, files);

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
