"use client";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  CreatorBetaJourneyRecord,
  CreatorBetaJourneySummary,
  UpdateCreatorBetaJourneyInput,
} from "@/lib/repositories/creator-beta-types";
import type { DraftJourneyProposal, Encounter } from "@/types/creator-beta";

export type CreatorBetaPersistenceMode = "local" | "connected";

export function getClientPersistenceMode(): CreatorBetaPersistenceMode {
  return isSupabaseConfigured() ? "connected" : "local";
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function fetchConnectedJourneys(): Promise<{
  journeys: CreatorBetaJourneySummary[];
  mode: CreatorBetaPersistenceMode;
}> {
  if (!isSupabaseConfigured()) {
    return { journeys: [], mode: "local" };
  }
  try {
    const data = await parseJson<{ journeys: CreatorBetaJourneySummary[]; mode: "connected" }>(
      await fetch("/api/creator/beta/journeys"),
    );
    return { journeys: data.journeys, mode: "connected" };
  } catch {
    return { journeys: [], mode: "local" };
  }
}

export async function fetchConnectedJourney(
  journeyId: string,
): Promise<CreatorBetaJourneyRecord | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    return await parseJson<CreatorBetaJourneyRecord>(
      await fetch(`/api/creator/beta/journeys/${journeyId}`),
    );
  } catch {
    return null;
  }
}

export async function createConnectedJourney(
  proposal: DraftJourneyProposal,
): Promise<CreatorBetaJourneyRecord | null> {
  if (!isSupabaseConfigured()) return null;
  return parseJson<CreatorBetaJourneyRecord>(
    await fetch("/api/creator/beta/journeys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposal }),
    }),
  );
}

export async function saveConnectedJourney(
  journeyId: string,
  updates: UpdateCreatorBetaJourneyInput,
): Promise<CreatorBetaJourneyRecord | null> {
  if (!isSupabaseConfigured()) return null;
  return parseJson<CreatorBetaJourneyRecord>(
    await fetch(`/api/creator/beta/journeys/${journeyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),
  );
}

export async function createConnectedEncounter(journeyId: string): Promise<Encounter | null> {
  if (!isSupabaseConfigured()) return null;
  return parseJson<Encounter>(
    await fetch(`/api/creator/beta/journeys/${journeyId}`, { method: "POST" }),
  );
}

export async function saveConnectedEncounter(
  journeyId: string,
  encounterId: string,
  updates: Partial<Encounter>,
): Promise<Encounter | null> {
  if (!isSupabaseConfigured()) return null;
  return parseJson<Encounter>(
    await fetch(`/api/creator/beta/journeys/${journeyId}/encounters/${encounterId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),
  );
}
