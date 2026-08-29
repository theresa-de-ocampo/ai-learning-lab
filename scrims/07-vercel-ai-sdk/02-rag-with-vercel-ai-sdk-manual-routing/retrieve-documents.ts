import { openai, supabase } from "./utils/clients.js";
import { embed } from "ai";
import { EMBEDDING_MODEL, SIMILARITY_MATCH_COUNT } from "./utils/constants.js";

export async function retrieveSimilarDocs(query: string) {
  const { embedding } = await embed({
    model: openai.embeddingModel(EMBEDDING_MODEL),
    value: query
  });

  const { data, error } = await supabase.rpc("match_help_documents", {
    query_embedding: embedding,
    match_count: SIMILARITY_MATCH_COUNT
  });

  if (error) {
    throw new Error(`Failed to fetch records: ${error.code} ${error.message}`);
  }

  return data;
}
