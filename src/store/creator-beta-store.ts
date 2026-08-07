"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CreatorJourney,
  DraftJourneyProposal,
  Encounter,
  Evidence,
  JourneyManifestV01,
  LearnerCapture,
} from "@/types/creator-beta";

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type LearnerEvidenceInput = {
  journeyId: string;
  encounterId: string;
  learnerId?: string;
  content: string;
  confidence?: number;
};

type CreatorBetaState = {
  journeys: Record<string, CreatorJourney>;
  encounters: Record<string, Encounter>;
  captures: LearnerCapture[];
  evidence: Evidence[];
  lastCreatedJourneyId?: string;

  createJourneyFromProposal: (proposal: DraftJourneyProposal) => string;
  importJourneyManifest: (manifest: JourneyManifestV01) => string;
  updateJourney: (journeyId: string, updates: Partial<CreatorJourney>) => void;
  updateEncounter: (encounterId: string, updates: Partial<Encounter>) => void;
  addEncounter: (journeyId: string) => string;
  addLearnerEvidence: (input: LearnerEvidenceInput) => {
    captureId: string;
    evidenceId: string;
  };
  removeJourney: (journeyId: string) => void;
};

export const useCreatorBetaStore = create<CreatorBetaState>()(
  persist(
    (set, get) => ({
      journeys: {},
      encounters: {},
      captures: [],
      evidence: [],

      createJourneyFromProposal(proposal) {
        const journeyId = makeId("journey");
        const encounterIds: string[] = [];
        const nextEncounters: Record<string, Encounter> = {};

        proposal.suggestedEncounters.forEach((suggestion, index) => {
          const encounterId = makeId("encounter");
          encounterIds.push(encounterId);
          nextEncounters[encounterId] = {
            id: encounterId,
            journeyId,
            order: index + 1,
            title: suggestion.title,
            target: suggestion.target,
            learnerPrompt: suggestion.learnerPrompt,
            learnerAction: suggestion.learnerAction,
            evidenceRequest: suggestion.evidenceRequest,
            provenance: {
              origin: proposal.provenance.origin,
              sourceRefs: [{ type: "other", id: proposal.id }],
              version: proposal.provenance.version,
            },
          };
        });

        const journey: CreatorJourney = {
          id: journeyId,
          title: proposal.suggestedTitle,
          creatorIds: ["creator-local"],
          status: "draft",
          thread: proposal.suggestedThread,
          learnerContext: proposal.suggestedLearnerContext,
          encounterIds,
          sourceContext: [{ type: "other", id: proposal.id }],
          provenance: {
            origin: proposal.provenance.origin,
            createdById: "creator-local",
            sourceRefs: [{ type: "other", id: proposal.id }],
            version: proposal.provenance.version,
          },
          description: proposal.seedText,
        };

        set((state) => ({
          journeys: { ...state.journeys, [journeyId]: journey },
          encounters: { ...state.encounters, ...nextEncounters },
          lastCreatedJourneyId: journeyId,
        }));

        return journeyId;
      },

      importJourneyManifest(manifest) {
        const nextEncounters = Object.fromEntries(
          manifest.encounters.map((encounter) => [encounter.id, encounter]),
        );

        set((state) => ({
          journeys: {
            ...state.journeys,
            [manifest.journey.id]: manifest.journey,
          },
          encounters: {
            ...state.encounters,
            ...nextEncounters,
          },
          lastCreatedJourneyId: manifest.journey.id,
        }));

        return manifest.journey.id;
      },

      updateJourney(journeyId, updates) {
        set((state) => {
          const journey = state.journeys[journeyId];
          if (!journey) return state;
          return {
            journeys: {
              ...state.journeys,
              [journeyId]: { ...journey, ...updates },
            },
          };
        });
      },

      updateEncounter(encounterId, updates) {
        set((state) => {
          const encounter = state.encounters[encounterId];
          if (!encounter) return state;
          return {
            encounters: {
              ...state.encounters,
              [encounterId]: { ...encounter, ...updates },
            },
          };
        });
      },

      addEncounter(journeyId) {
        const journey = get().journeys[journeyId];
        if (!journey) throw new Error("Journey not found");

        const encounterId = makeId("encounter");
        const encounter: Encounter = {
          id: encounterId,
          journeyId,
          order: journey.encounterIds.length + 1,
          title: "Untitled Encounter",
          target: { type: "other", label: "Define what the learner will encounter" },
          learnerPrompt: "What should the learner attend to?",
          learnerAction: "Define a meaningful learner action.",
          evidenceRequest: {
            prompt: "What learner-produced evidence would make this Encounter meaningful?",
            allowedCaptureKinds: ["text"],
          },
          provenance: {
            origin: "creator",
            createdById: journey.creatorIds[0],
            sourceRefs: [],
            version: "creator-beta-v0.2",
          },
        };

        set((state) => {
          const currentJourney = state.journeys[journeyId];
          if (!currentJourney) return state;
          return {
            journeys: {
              ...state.journeys,
              [journeyId]: {
                ...currentJourney,
                encounterIds: [...currentJourney.encounterIds, encounterId],
              },
            },
            encounters: { ...state.encounters, [encounterId]: encounter },
          };
        });

        return encounterId;
      },

      addLearnerEvidence(input) {
        const captureId = makeId("capture");
        const evidenceId = makeId("evidence");
        const createdAt = new Date().toISOString();
        const learnerId = input.learnerId ?? "learner-preview";

        const capture: LearnerCapture = {
          id: captureId,
          learnerId,
          journeyId: input.journeyId,
          encounterId: input.encounterId,
          kind: "text",
          content: input.content,
          createdAt,
          provenance: {
            origin: "learner",
            createdById: learnerId,
            sourceRefs: [],
            version: "creator-beta-v0.2",
          },
        };

        const evidence: Evidence = {
          id: evidenceId,
          learnerId,
          journeyId: input.journeyId,
          encounterId: input.encounterId,
          kind: "observation",
          supportingCaptureIds: [captureId],
          confidence: input.confidence,
          createdAt,
          provenance: {
            origin: "learner",
            createdById: learnerId,
            sourceRefs: [{ type: "capture", id: captureId }],
            version: "creator-beta-v0.2",
          },
        };

        set((state) => ({
          captures: [...state.captures, capture],
          evidence: [...state.evidence, evidence],
        }));

        return { captureId, evidenceId };
      },

      removeJourney(journeyId) {
        set((state) => {
          const journey = state.journeys[journeyId];
          if (!journey) return state;
          const encounters = { ...state.encounters };
          journey.encounterIds.forEach((encounterId) => delete encounters[encounterId]);
          const journeys = { ...state.journeys };
          delete journeys[journeyId];
          return {
            journeys,
            encounters,
            captures: state.captures.filter((capture) => capture.journeyId !== journeyId),
            evidence: state.evidence.filter((item) => item.journeyId !== journeyId),
          };
        });
      },
    }),
    {
      name: "locus-creator-beta-v0.2",
      partialize: (state) => ({
        journeys: state.journeys,
        encounters: state.encounters,
        captures: state.captures,
        evidence: state.evidence,
        lastCreatedJourneyId: state.lastCreatedJourneyId,
      }),
    },
  ),
);
