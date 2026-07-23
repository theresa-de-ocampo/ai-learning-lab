import OpenAI from "openai";
import { checkEnvironment } from "../utils/check-environment.js";
import { createClient } from "@supabase/supabase-js";

checkEnvironment(process.env);

const openai = new OpenAI({
  baseURL: process.env.AI_URL,
  apiKey: process.env.AI_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);

// The Big Easy is a nickname the first of New Orleans known for its music.
// const query = "Jammin' in the Big Easy";

// const query = "Decoding orca calls";
// const query = "What can I listen to in half an hour?";
const query = "Training puppies";

const response = await openai.embeddings.create({
  input: query,
  model: process.env.AI_MODEL
});

const queryEmbedding = response.data[0].embedding;

const { data } = await supabase.rpc("match_documents", {
  query_embedding: queryEmbedding,
  match_threshold: 0.38,
  match_count: 1
});

console.dir(data, { depth: null });
