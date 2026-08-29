import "dotenv/config";
import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY");
}

if (!process.env.SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL");
}

if (!process.env.SUPABASE_API_KEY) {
  throw new Error("Missing SUPABASE_API_KEY");
}

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);
