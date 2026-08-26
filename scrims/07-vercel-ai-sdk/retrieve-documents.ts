import { openai, supabase } from "./utils/clients.js";
import { EMBEDDING_MODEL, SIMILARITY_MATCH_COUNT } from "./utils/constants.js";

export async function retrieveSimilarDocs(query: string) {
  const embeddingResponse = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query
  });

  const embedding = embeddingResponse.data[0].embedding;

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_count: SIMILARITY_MATCH_COUNT
  });

  if (error) {
    throw new Error(`Failed to fetch records: ${error.code} ${error.message}`);
  }

  return data;
}
