"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createConnectedEncounter,
  createConnectedJourney,
  fetchConnectedJourney,
  getClientPersistenceMode,
  saveConnectedEncounter,
  saveConnectedJourney,
} from "@/lib/creator-beta/persistence-client";
import type { UpdateCreatorBetaJourneyInput } from "@/lib/repositories/creator-beta-types";
import { useCreatorBetaStore } from "@/store/creator-beta-store";
import type { DraftJourneyProposal, Encounter } from "@/types/creator-beta";

export function useCreatorBetaSync(journeyId: string) {
  const hydrateFromRecord = useCreatorBetaStore((state) => state.hydrateFromRecord);
  const isConnectedJourney = useCreatorBetaStore((state) => state.isConnectedJourney);
  const persistenceMode = useCreatorBetaStore((state) => state.persistenceMode);
  const journey = useCreatorBetaStore((state) => state.journeys[journeyId]);

  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clientMode = getClientPersistenceMode();
  const looksLikeConnectedId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    journeyId,
  );
  const isConnected =
    clientMode === "connected" && (isConnectedJourney(journeyId) || looksLikeConnectedId);

  useEffect(() => {
    if (clientMode !== "connected") return;
    if (journey) return;

    let cancelled = false;
    setLoading(true);
    fetchConnectedJourney(journeyId)
      .then((record) => {
        if (cancelled || !record) return;
        hydrateFromRecord(record);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSyncError(error instanceof Error ? error.message : "Could not load connected Journey");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientMode, hydrateFromRecord, journey, journeyId]);

  const queueJourneySave = useCallback(
    (updates: UpdateCreatorBetaJourneyInput) => {
      if (!isConnected) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const record = await saveConnectedJourney(journeyId, updates);
          if (record) {
            hydrateFromRecord(record);
            setLastSavedAt(new Date().toISOString());
            setSyncError(null);
          }
        } catch (error) {
          setSyncError(error instanceof Error ? error.message : "Save failed");
        }
      }, 600);
    },
    [hydrateFromRecord, isConnected, journeyId],
  );

  const queueEncounterSave = useCallback(
    (encounterId: string, updates: Partial<Encounter>) => {
      if (!isConnected) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const encounter = await saveConnectedEncounter(journeyId, encounterId, updates);
          if (encounter) {
            useCreatorBetaStore.getState().updateEncounter(encounterId, encounter);
            setLastSavedAt(new Date().toISOString());
            setSyncError(null);
          }
        } catch (error) {
          setSyncError(error instanceof Error ? error.message : "Encounter save failed");
        }
      }, 600);
    },
    [isConnected, journeyId],
  );

  const addConnectedEncounter = useCallback(async () => {
    if (!isConnected) {
      return useCreatorBetaStore.getState().addEncounter(journeyId);
    }
    const encounter = await createConnectedEncounter(journeyId);
    if (!encounter) {
      return useCreatorBetaStore.getState().addEncounter(journeyId);
    }
    useCreatorBetaStore.setState((state) => {
      const currentJourney = state.journeys[journeyId];
      if (!currentJourney) return state;
      return {
        journeys: {
          ...state.journeys,
          [journeyId]: {
            ...currentJourney,
            encounterIds: [...currentJourney.encounterIds, encounter.id],
          },
        },
        encounters: { ...state.encounters, [encounter.id]: encounter },
      };
    });
    setLastSavedAt(new Date().toISOString());
    return encounter.id;
  }, [isConnected, journeyId]);

  return {
    loading,
    syncError,
    lastSavedAt,
    persistenceMode: isConnected ? ("connected" as const) : persistenceMode,
    queueJourneySave,
    queueEncounterSave,
    addConnectedEncounter,
  };
}

export async function createJourneyWithPersistence(
  proposal: DraftJourneyProposal,
): Promise<{ journeyId: string; mode: "local" | "connected" }> {
  const clientMode = getClientPersistenceMode();
  if (clientMode === "connected") {
    try {
      const record = await createConnectedJourney(proposal);
      if (record) {
        useCreatorBetaStore.getState().hydrateFromRecord(record);
        return { journeyId: record.journey.id, mode: "connected" };
      }
    } catch {
      // Fall through to local when auth or network fails.
    }
  }

  const journeyId = useCreatorBetaStore.getState().createJourneyFromProposal(proposal);
  return { journeyId, mode: "local" };
}
