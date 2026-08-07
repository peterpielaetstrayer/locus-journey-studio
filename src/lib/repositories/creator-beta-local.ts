import type { CreatorJourney, DraftJourneyProposal, Encounter } from "@/types/creator-beta";
import {
  defaultProvenance,
  slugifyTitle,
} from "@/lib/creator-beta/db-adapter";
import type {
  CreateCreatorBetaEncounterInput,
  CreateCreatorBetaJourneyInput,
  CreatorBetaJourneyRecord,
  CreatorBetaJourneySummary,
  CreatorBetaRepository,
  UpdateCreatorBetaJourneyInput,
} from "./creator-beta-types";

type StoredJourney = CreatorBetaJourneyRecord & { updatedAt: string };

function makeId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`;
}

function makeVersionId(): string {
  return makeId("version");
}

function proposalToJourney(
  proposal: DraftJourneyProposal,
  journeyId: string,
  creatorId?: string,
): { journey: CreatorJourney; encounters: Encounter[] } {
  const encounterIds: string[] = [];
  const encounters: Encounter[] = proposal.suggestedEncounters.map((suggestion, index) => {
    const encounterId = makeId("encounter");
    encounterIds.push(encounterId);
    return {
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
    creatorIds: creatorId ? [creatorId] : ["creator-local"],
    status: "draft",
    thread: proposal.suggestedThread,
    learnerContext: proposal.suggestedLearnerContext,
    encounterIds,
    sourceContext: [{ type: "other", id: proposal.id }],
    provenance: {
      origin: proposal.provenance.origin,
      createdById: creatorId ?? "creator-local",
      sourceRefs: [{ type: "other", id: proposal.id }],
      version: proposal.provenance.version,
    },
    description: proposal.seedText,
  };

  return { journey, encounters };
}

export function createInMemoryCreatorBetaStore() {
  const journeys = new Map<string, StoredJourney>();

  function toSummary(record: StoredJourney): CreatorBetaJourneySummary {
    return {
      id: record.journey.id,
      slug: record.slug,
      title: record.journey.title,
      status: record.journey.status,
      encounterCount: record.encounters.length,
      threadStatement: record.journey.thread.statement,
      updatedAt: record.updatedAt,
    };
  }

  function getRecord(journeyId: string): StoredJourney | undefined {
    return journeys.get(journeyId);
  }

  const repo: CreatorBetaRepository = {
    mode: "demo",

    async listJourneys() {
      return [...journeys.values()]
        .map(toSummary)
        .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    },

    async getJourneyById(journeyId) {
      const record = getRecord(journeyId);
      if (!record) return null;
      const { updatedAt, ...rest } = record;
      void updatedAt;
      return rest;
    },

    async createJourney(input: CreateCreatorBetaJourneyInput) {
      const journeyId = makeId("journey");
      const slug = `${slugifyTitle(input.proposal.suggestedTitle)}-${journeyId.slice(-8)}`;
      const { journey, encounters } = proposalToJourney(
        input.proposal,
        journeyId,
        input.creatorId,
      );
      const record: StoredJourney = {
        journey,
        encounters,
        slug,
        versionId: makeVersionId(),
        isEditable: true,
        updatedAt: new Date().toISOString(),
      };
      journeys.set(journeyId, record);
      return record;
    },

    async updateJourney(journeyId, updates: UpdateCreatorBetaJourneyInput) {
      const record = getRecord(journeyId);
      if (!record) throw new Error("Journey not found");
      if (!record.isEditable) throw new Error("Journey version is not editable");

      record.journey = { ...record.journey, ...updates };
      if (updates.thread) {
        record.journey.thread = { ...record.journey.thread, ...updates.thread };
      }
      if (updates.learnerContext) {
        record.journey.learnerContext = {
          ...record.journey.learnerContext,
          ...updates.learnerContext,
        };
      }
      record.updatedAt = new Date().toISOString();
      return record;
    },

    async listEncountersForJourney(journeyId) {
      const record = getRecord(journeyId);
      if (!record) return [];
      return [...record.encounters].sort((a, b) => a.order - b.order);
    },

    async getEncounterById(encounterId) {
      for (const record of journeys.values()) {
        const encounter = record.encounters.find((item) => item.id === encounterId);
        if (encounter) return encounter;
      }
      return null;
    },

    async createEncounter(journeyId, input?: CreateCreatorBetaEncounterInput) {
      const record = getRecord(journeyId);
      if (!record) throw new Error("Journey not found");
      if (!record.isEditable) throw new Error("Journey version is not editable");

      const encounterId = makeId("encounter");
      const order = record.encounters.length + 1;
      const encounter: Encounter = {
        id: encounterId,
        journeyId,
        order,
        title: input?.title ?? "Untitled Encounter",
        target: {
          type: input?.targetType ?? "other",
          label: input?.targetLabel ?? "Define what the learner will encounter",
        },
        learnerPrompt: "What should the learner attend to?",
        learnerAction: "Define a meaningful learner action.",
        evidenceRequest: {
          prompt: "What learner-produced evidence would make this Encounter meaningful?",
          allowedCaptureKinds: ["text"],
        },
        provenance: defaultProvenance(record.journey.creatorIds[0]),
      };

      record.encounters.push(encounter);
      record.journey.encounterIds = [...record.journey.encounterIds, encounterId];
      record.updatedAt = new Date().toISOString();
      return encounter;
    },

    async updateEncounter(encounterId, updates) {
      for (const record of journeys.values()) {
        const index = record.encounters.findIndex((item) => item.id === encounterId);
        if (index === -1) continue;
        if (!record.isEditable) throw new Error("Journey version is not editable");

        const current = record.encounters[index];
        const next: Encounter = {
          ...current,
          ...updates,
          target: updates.target ? { ...current.target, ...updates.target } : current.target,
          evidenceRequest: updates.evidenceRequest
            ? { ...current.evidenceRequest, ...updates.evidenceRequest }
            : current.evidenceRequest,
        };
        record.encounters[index] = next;
        record.updatedAt = new Date().toISOString();
        return next;
      }
      throw new Error("Encounter not found");
    },
  };

  return { repo, journeys };
}

let sharedStore = createInMemoryCreatorBetaStore();

export function resetLocalCreatorBetaStore() {
  sharedStore = createInMemoryCreatorBetaStore();
}

export function createLocalCreatorBetaRepository(): CreatorBetaRepository {
  return sharedStore.repo;
}

/** Import a full journey record into the local demo repository (tests / manifest import). */
export function importLocalCreatorBetaRecord(record: CreatorBetaJourneyRecord): void {
  sharedStore.journeys.set(record.journey.id, {
    ...record,
    updatedAt: new Date().toISOString(),
  });
}
