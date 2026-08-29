export type Document = {
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
};

export type DocumentChunk = Omit<Document, "embedding">;
