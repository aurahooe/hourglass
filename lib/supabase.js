import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabase() {
  if (!url || !key) {
    throw new Error("Missing Supabase env");
  }
  return createClient(url, key);
}

export function hourSlot(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}
