import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./supabaseTypes";

function getEnv(name: string, fallback: string) {
  const value = process.env[name];
  if (!value) {
    console.warn(`Missing required environment variable: ${name}; using fallback.`);
    return fallback;
  }
  return value;
}

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL", "https://placeholder.supabase.co");
const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "placeholder-key");

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
);
