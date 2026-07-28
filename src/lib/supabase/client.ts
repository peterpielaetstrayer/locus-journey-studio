import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { getSupabasePublishableKey, getSupabaseUrl } from "./config";

export function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) {
    throw new Error("Supabase is not configured for Connected Mode.");
  }
  return createBrowserClient<Database>(url, key);
}

/** Returns null when env vars are absent (demo mode). */
export function createClientIfConfigured() {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) return null;
  return createBrowserClient<Database>(url, key);
}
