export const DOCUMENTS_DIR = "docs";
export const TABLE_NAME = "help_documents";
export const CLEAR_TABLE = true;

export const SIMILARITY_MATCH_COUNT = 3;
export const GENERATIVE_MODEL = "gpt-5-nano";
export const EMBEDDING_MODEL = "text-embedding-3-small";
export const CLASSIFICATION_MODEL = "gpt-5-nano";
export const EMBEDDING_BATCH_SIZE = 100;

export enum QueryType {
  General = "general",
  Retrieval = "retrieval"
}
