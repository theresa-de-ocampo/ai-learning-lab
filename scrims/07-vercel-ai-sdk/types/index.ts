export type Document = {
  content: string;
  embedding: number[];
  metadata: {
    source: string;
  };
};
