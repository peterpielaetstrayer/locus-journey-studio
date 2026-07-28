import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createLocalRepositories } from "./local";
import { createSupabaseRepositories } from "./supabase";
import type { RepositoryBundle } from "./types";

export async function getRepositories(): Promise<RepositoryBundle> {
  if (!isSupabaseConfigured()) {
    return createLocalRepositories();
  }
  try {
    return await createSupabaseRepositories();
  } catch {
    return createLocalRepositories();
  }
}

export function getClientRepositories(): RepositoryBundle {
  return createLocalRepositories();
}

export * from "./types";
export { createLocalRepositories, isVersionEditable } from "./local";
