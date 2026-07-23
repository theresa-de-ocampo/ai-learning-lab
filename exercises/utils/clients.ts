import OpenAI from "openai";
import { checkEnvironment } from "../utils/check-environment.js";
import { createClient } from "@supabase/supabase-js";

checkEnvironment(process.env);

let openai;
let supabase;

if (!openai) {
  openai = new OpenAI({
    baseURL: process.env.AI_URL,
    apiKey: process.env.AI_KEY
  });
}

if (!supabase) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY
  );
}

export { openai, supabase };
