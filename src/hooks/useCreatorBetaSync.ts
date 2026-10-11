"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DebouncedSaveQueue, type SaveQueuePhase } from "@/lib/creator-beta/debounced-save-queue";
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
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const queuesRef = useRef<{
    journey: DebouncedSaveQueue<UpdateCreatorBetaJourneyInput>;
    encounter: DebouncedSaveQueue<Partial<Encounter>>;
  } | null>(null);

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

  useEffect(() => {
    if (!isConnected) return;

    const updateQueueStatus = (
      recordId: string,
      phase: SaveQueuePhase,
      error?: unknown,
    ) => {
      if (phase === "failed") {
        setSyncError(
          `Could not sync ${recordId}: ${error instanceof Error ? error.message : "save failed"}. Your edits remain in this browser. Retry the save.`,
        );
      }
      if (phase === "saved") setLastSavedAt(new Date().toISOString());

      const queues = queuesRef.current;
      if (queues?.journey.hasFailed() || queues?.encounter.hasFailed()) {
        setSyncStatus("failed");
      } else if (phase === "queued" || phase === "saving" ||
          queues?.journey.hasOutstanding() || queues?.encounter.hasOutstanding()) {
        setSyncStatus("saving");
        if (phase === "queued") setSyncError(null);
      } else {
        setSyncStatus("saved");
        setSyncError(null);
      }
    };

    const queues = {
      journey: new DebouncedSaveQueue<UpdateCreatorBetaJourneyInput>(
        async (_recordId, patch) => {
          const saved = await saveConnectedJourney(journeyId, patch);
          if (!saved) throw new Error("Connected Journey was not saved");
          // Never rehydrate from the network acknowledgment here: doing so
          // could replace a newer optimistic edit with an older response.
        },
        updateQueueStatus,
      ),
      encounter: new DebouncedSaveQueue<Partial<Encounter>>(
        async (encounterId, patch) => {
          const saved = await saveConnectedEncounter(journeyId, encounterId, patch);
          if (!saved) throw new Error("Connected Encounter was not saved");
          // Same rule: the local store remains the current editor truth.
        },
        updateQueueStatus,
      ),
    };
    queuesRef.current = queues;

    function flushWhenHidden() {
      // Best-effort dispatch before navigation/backgrounding. Hard browser
      // termination still requires later server-vs-local reconciliation.
      void queues.journey.flushAll();
      void queues.encounter.flushAll();
    }
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") flushWhenHidden();
    }

    window.addEventListener("pagehide", flushWhenHidden);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushWhenHidden);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      flushWhenHidden();
      if (queuesRef.current === queues) queuesRef.current = null;
    };
  }, [isConnected, journeyId]);

  const queueJourneySave = useCallback(
    (updates: UpdateCreatorBetaJourneyInput) => {
      if (!isConnected) return;
      queuesRef.current?.journey.enqueue(journeyId, updates);
    },
    [isConnected, journeyId],
  );

  const queueEncounterSave = useCallback(
    (encounterId: string, updates: Partial<Encounter>) => {
      if (!isConnected) return;
      queuesRef.current?.encounter.enqueue(encounterId, updates);
    },
    [isConnected],
  );

  const retryFailedSaves = useCallback(() => {
    queuesRef.current?.journey.retryFailed();
    queuesRef.current?.encounter.retryFailed();
  }, []);

  const addConnectedEncounter = useCallback(async () => {
    if (!isConnected) {
      return useCreatorBetaStore.getState().addEncounter(journeyId);
    }
    const encounter = await createConnectedEncounter(journeyId);
    if (!encounter) {
      throw new Error("Connected Encounter creation was not confirmed. No local fallback was created.");
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
    syncStatus,
    retryFailedSaves,
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
    const record = await createConnectedJourney(proposal);
    if (!record) {
      throw new Error("Connected Journey creation was not confirmed. No local draft was created.");
    }
    useCreatorBetaStore.getState().hydrateFromRecord(record);
    return { journeyId: record.journey.id, mode: "connected" };
  }

  const journeyId = useCreatorBetaStore.getState().createJourneyFromProposal(proposal);
  return { journeyId, mode: "local" };
}
