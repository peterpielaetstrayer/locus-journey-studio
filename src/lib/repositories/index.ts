import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createLocalCreatorBetaRepository } from "./creator-beta-local";
import { createSupabaseCreatorBetaRepository } from "./creator-beta-supabase";
import { createLocalRepositories } from "./local";
import { createSupabaseRepositories } from "./supabase";
import type { CreatorBetaRepository } from "./creator-beta-types";
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

/** Creator Beta persistence — demo in-memory when Supabase is absent. */
export function getDemoCreatorBetaRepository(): CreatorBetaRepository {
  return createLocalCreatorBetaRepository();
}

/** Creator Beta persistence — connected Supabase; throws if unconfigured. */
export async function getConnectedCreatorBetaRepository(): Promise<CreatorBetaRepository> {
  if (!isSupabaseConfigured()) {
    throw new ConnectedRepositoryError("Supabase is not configured for Connected Mode.");
  }
  return createSupabaseCreatorBetaRepository();
}

export async function getCreatorBetaRepository(): Promise<CreatorBetaRepository> {
  if (!isSupabaseConfigured()) {
    return getDemoCreatorBetaRepository();
  }
  return getConnectedCreatorBetaRepository();
}

/** @deprecated Client components must not access repositories directly. */
export function getClientRepositories(): RepositoryBundle {
  return getDemoRepositories();
}

export * from "./types";
export * from "./creator-beta-types";
export {
  createLocalCreatorBetaRepository,
  importLocalCreatorBetaRecord,
  resetLocalCreatorBetaStore,
} from "./creator-beta-local";
export {
  createLocalRepositories,
  isVersionEditable,
  EDITABLE_JOURNEY_VERSION_STATUSES,
} from "./local";
