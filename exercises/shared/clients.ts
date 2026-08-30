import OpenAI from "openai";
import {
  checkEnvironment,
  OPENAI_COMPATIBLE_ENV,
  SUPABASE_ENV
} from "./check-environment.js";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

checkEnvironment(process.env, [...OPENAI_COMPATIBLE_ENV, ...SUPABASE_ENV]);

export const openai: OpenAI = new OpenAI({
  baseURL: process.env.AI_URL,
  apiKey: process.env.AI_KEY
});

export const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);
