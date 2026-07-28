import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createLocalRepositories } from "./local";
import { createSupabaseRepositories } from "./supabase";
import type { RepositoryBundle } from "./types";

export class ConnectedRepositoryError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ConnectedRepositoryError";
    this.cause = cause;
  }
}

/** Demo Mode only — never use when Supabase env is present. */
export function getDemoRepositories(): RepositoryBundle {
  return createLocalRepositories();
}

/** Connected Mode — throws if Supabase is unavailable; never falls back to local. */
export async function getConnectedRepositories(): Promise<RepositoryBundle> {
  if (!isSupabaseConfigured()) {
    throw new ConnectedRepositoryError("Supabase is not configured for Connected Mode.");
  }
  return createSupabaseRepositories();
}

/**
 * Server-side repository selector.
 * Demo when env absent; Connected otherwise (no silent fallback).
 */
export async function getRepositories(): Promise<RepositoryBundle> {
  if (!isSupabaseConfigured()) {
    return getDemoRepositories();
  }
  return getConnectedRepositories();
}

/** @deprecated Client components must not access repositories directly. */
export function getClientRepositories(): RepositoryBundle {
  return getDemoRepositories();
}

export * from "./types";
export {
  createLocalRepositories,
  isVersionEditable,
  EDITABLE_JOURNEY_VERSION_STATUSES,
} from "./local";
