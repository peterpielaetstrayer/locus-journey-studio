import {
  ADAPTIVE_BRANCHES,
  JOURNEY_STOPS,
  REVIEW_STATUS,
  WATER_WRITES_JOURNEY,
} from "@/data/canonical";
import { useDemoStore } from "@/store/demo-store";
import type { FieldNote, Journey } from "@/types";
import type {
  ArtifactsRepository,
  AuditEvent,
  FieldNotesRepository,
  InterventionsRepository,
  JourneyDraft,
  JourneyRepository,
  RepositoryBundle,
  ReviewRecord,
  ReviewsRepository,
} from "./types";

const CANONICAL_SLUG = "water-writes-the-landscape";

function buildCanonicalDraft(): JourneyDraft {
  return {
    journey: { ...WATER_WRITES_JOURNEY },
    stops: JOURNEY_STOPS.map((s) => ({ ...s })),
    branches: ADAPTIVE_BRANCHES.map((b) => ({ ...b })),
    versionLabel: "v0.1 Field-Test Draft (local)",
    isEditable: true,
  };
}

const localJourneyRepo: JourneyRepository = {
  mode: "demo",
  async getCanonicalDraft(slug) {
    if (slug !== CANONICAL_SLUG) return null;
    const draft = useDemoStore.getState().creatorDraft;
    return {
      journey: { ...draft },
      stops: JOURNEY_STOPS.map((s) => ({ ...s })),
      branches: ADAPTIVE_BRANCHES.map((b) => ({ ...b })),
      versionLabel: "v0.1 Field-Test Draft (local)",
      isEditable: true,
    };
  },
  async saveDraft(draft) {
    useDemoStore.setState({ creatorDraft: draft.journey });
    return { ...draft, savedAt: new Date().toISOString() };
  },
  async createDraftVersion(slug) {
    if (slug !== CANONICAL_SLUG) throw new Error("Unknown journey");
    const base = buildCanonicalDraft();
    return {
      ...base,
      versionLabel: `Draft ${new Date().toISOString().slice(0, 10)} (local)`,
      versionId: `local-${Date.now()}`,
    };
  },
  async listVersions(slug) {
    if (slug !== CANONICAL_SLUG) return [];
    return [
      {
        id: "local-v0.1",
        versionLabel: "v0.1 Field-Test Draft",
        status: "field-test",
        createdAt: new Date().toISOString(),
      },
    ];
  },
  async restoreCanonicalDraft(slug) {
    if (slug !== CANONICAL_SLUG) return null;
    const draft = buildCanonicalDraft();
    useDemoStore.setState({ creatorDraft: draft.journey });
    return draft;
  },
  async listAuditEvents() {
    return [] as AuditEvent[];
  },
};

const localFieldNotesRepo: FieldNotesRepository = {
  mode: "demo",
  async listForLearner(learnerId) {
    return useDemoStore.getState().fieldNotes.filter((n) => n.learnerId === learnerId);
  },
  async create(input) {
    useDemoStore.getState().addFieldNote(input);
    const notes = useDemoStore.getState().fieldNotes;
    return notes[notes.length - 1] as FieldNote;
  },
};

const localInterventionsRepo: InterventionsRepository = {
  mode: "demo",
  async listForLearner(learnerId) {
    return useDemoStore.getState().interventions.filter((i) => i.learnerId === learnerId);
  },
  async create(input) {
    const id = useDemoStore.getState().addIntervention(input);
    return useDemoStore.getState().interventions.find((i) => i.id === id)!;
  },
  async update(id, updates) {
    useDemoStore.getState().updateIntervention(id, updates);
    return useDemoStore.getState().interventions.find((i) => i.id === id)!;
  },
  async deliver(id) {
    useDemoStore.getState().deliverIntervention(id);
    return useDemoStore.getState().interventions.find((i) => i.id === id)!;
  },
};

const localArtifactsRepo: ArtifactsRepository = {
  mode: "demo",
  async getForLearner(learnerId) {
    return useDemoStore.getState().artifacts.find((a) => a.learnerId === learnerId) ?? null;
  },
  async save(artifact) {
    useDemoStore.getState().saveArtifact(artifact);
    return useDemoStore.getState().artifacts.find((a) => a.learnerId === artifact.learnerId)!;
  },
};

const localReviewsRepo: ReviewsRepository = {
  mode: "demo",
  async listForJourneyVersion() {
    const entries: ReviewRecord[] = [
      { id: "r-ld", category: "learningDesign", status: REVIEW_STATUS.learningDesign, notes: "", updatedAt: new Date().toISOString() },
      { id: "r-fact", category: "factual", status: REVIEW_STATUS.factual, notes: "", updatedAt: new Date().toISOString() },
      { id: "r-safety", category: "safety", status: REVIEW_STATUS.safety, notes: "", updatedAt: new Date().toISOString() },
    ];
    return entries;
  },
  async upsert(review) {
    return { id: `local-${review.category}`, ...review, updatedAt: new Date().toISOString() };
  },
};

export function createLocalRepositories(): RepositoryBundle {
  return {
    mode: "demo",
    journeys: localJourneyRepo,
    fieldNotes: localFieldNotesRepo,
    interventions: localInterventionsRepo,
    artifacts: localArtifactsRepo,
    reviews: localReviewsRepo,
  };
}

export function mapDbStatusToJourneyStatus(
  status: string,
): Journey["status"] {
  const map: Record<string, Journey["status"]> = {
    concept: "concept",
    draft: "draft",
    field_test: "field-test",
    private_adult_walk: "private-adult-walk",
    learner_pilot: "learner-pilot",
    published: "published",
    archived: "archived",
  };
  return map[status] ?? "draft";
}

export function mapJourneyStatusToDb(status: Journey["status"]): string {
  const map: Record<Journey["status"], string> = {
    concept: "concept",
    draft: "draft",
    "field-test": "field_test",
    "private-adult-walk": "private_adult_walk",
    "learner-pilot": "learner_pilot",
    published: "published",
    archived: "archived",
  };
  return map[status];
}

export function isVersionEditable(status: string): boolean {
  return !["published", "archived"].includes(status);
}
