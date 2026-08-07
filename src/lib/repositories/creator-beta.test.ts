import { describe, expect, it, beforeEach } from "vitest";
import { JOURNEY_STOPS, WATER_WRITES_JOURNEY } from "@/data/canonical";
import { buildLegacyJourneyManifest } from "@/lib/creator-beta/legacy-adapter";
import { createPrototypeJourneyProposal } from "@/lib/creator-beta/proposal-engine";
import {
  stopRowToEncounter,
  versionRowsToCreatorJourney,
  type DbJourneyRow,
  type DbStopRow,
  type DbVersionRow,
} from "@/lib/creator-beta/db-adapter";
import {
  createLocalCreatorBetaRepository,
  importLocalCreatorBetaRecord,
  resetLocalCreatorBetaStore,
} from "@/lib/repositories/creator-beta-local";

describe("Creator Beta repository — First Landing compatibility", () => {
  beforeEach(() => {
    resetLocalCreatorBetaStore();
  });

  it("round-trips First Landing manifest through generic persistence", async () => {
    const manifest = buildLegacyJourneyManifest(WATER_WRITES_JOURNEY, JOURNEY_STOPS);
    importLocalCreatorBetaRecord({
      journey: manifest.journey,
      encounters: manifest.encounters,
      slug: "water-writes-the-landscape",
      versionId: "version-first-landing-local",
      isEditable: false,
    });

    const repo = createLocalCreatorBetaRepository();
    const record = await repo.getJourneyById(manifest.journey.id);

    expect(record?.journey.title).toBe("Water Writes the Landscape");
    expect(record?.encounters).toHaveLength(8);
    expect(record?.encounters[0]?.learnerPrompt).toContain("walk without trying to name");
    expect(record?.slug).toBe("water-writes-the-landscape");
  });

  it("maps seeded First Landing DB rows through the storage adapter without special cases", () => {
    const journey: DbJourneyRow = {
      id: "00000000-0000-4000-8000-000000000010",
      slug: "water-writes-the-landscape",
      title: "Water Writes the Landscape",
      region: "Virginia Beach",
      location: "First Landing State Park",
    };
    const version: DbVersionRow = {
      id: "00000000-0000-4000-8000-000000000011",
      journey_id: journey.id,
      status: "field_test",
      central_question: WATER_WRITES_JOURNEY.centralQuestion,
      subtitle: WATER_WRITES_JOURNEY.subtitle,
      description: WATER_WRITES_JOURNEY.description,
      audience: WATER_WRITES_JOURNEY.audience,
      duration_minutes: WATER_WRITES_JOURNEY.durationMinutes,
      learning_domains: WATER_WRITES_JOURNEY.learningDomains,
      prerequisite_concepts: WATER_WRITES_JOURNEY.prerequisiteConcepts,
      artifact_template: { type: "micro-landscape-systems-card" },
    };
    const threshold: DbStopRow = {
      id: "00000000-0000-4000-8000-000000000020",
      journey_version_id: version.id,
      position: 1,
      slug: "threshold",
      title: "The Threshold",
      location_label: "Trail entrance, maritime forest edge",
      purpose: "Attend and notice before naming or explaining.",
      central_concept: "Observation",
      learning_objective: "Capture sensory observations without premature explanation.",
      opening_prompt: "For the next three minutes, walk without trying to name or explain anything.",
      field_action: "Capture three observations, one sound, one pattern, and one surprising detail.",
      evidence_requirements: [],
      safety_notes: ["Stay on designated trail"],
      accessibility_alternatives: ["Seated observation from boardwalk edge"],
      artifact_contribution: null,
      resurfacing_connection: null,
      is_optional: false,
    };

    const mappedJourney = versionRowsToCreatorJourney(journey, version, [threshold.id]);
    const mappedEncounter = stopRowToEncounter(journey.id, threshold);

    expect(mappedJourney.thread.statement).toBe(WATER_WRITES_JOURNEY.centralQuestion);
    expect(mappedJourney.status).toBe("test");
    expect(mappedEncounter.target.label).toContain("Trail entrance");
    expect(mappedEncounter.learnerPrompt).toContain("walk without trying");
  });
});

describe("Creator Beta repository — second Journey generality", () => {
  beforeEach(() => {
    resetLocalCreatorBetaStore();
  });

  it("creates, reads, updates a Tahoe Journey without Tahoe-specific backend code", async () => {
    const repo = createLocalCreatorBetaRepository();
    const proposal = createPrototypeJourneyProposal(
      "I want to create a Tahoe journey about why the lake is so clear and how the watershed affects that clarity.",
    );

    const created = await repo.createJourney({ proposal, creatorId: "creator-test" });
    expect(created.journey.title.toLowerCase()).toContain("tahoe");
    expect(created.encounters).toHaveLength(3);

    const updated = await repo.updateJourney(created.journey.id, {
      thread: {
        type: "question",
        statement: "How does the Tahoe watershed influence lake clarity?",
      },
    });
    expect(updated.journey.thread.statement).toContain("Tahoe watershed");

    const reloaded = await repo.getJourneyById(created.journey.id);
    expect(reloaded?.journey.thread.statement).toContain("Tahoe watershed");
    expect(reloaded?.encounters).toHaveLength(3);
  });

  it("persists Encounter edits for a non-place desk/history Journey", async () => {
    const repo = createLocalCreatorBetaRepository();
    const proposal = createPrototypeJourneyProposal(
      "Help me turn an existing history lesson into a journey about competing accounts of one event.",
    );

    const created = await repo.createJourney({ proposal });
    const firstEncounter = created.encounters[0];
    expect(firstEncounter.target.type).not.toBe("place");

    const updatedEncounter = await repo.updateEncounter(firstEncounter.id, {
      title: "Compare Primary Accounts",
      target: { type: "resource", label: "Two conflicting primary sources" },
      learnerPrompt: "What differs between these accounts before you decide who is right?",
    });

    expect(updatedEncounter.title).toBe("Compare Primary Accounts");
    expect(updatedEncounter.target.type).toBe("resource");

    const added = await repo.createEncounter(created.journey.id, {
      title: "Library synthesis",
      targetType: "resource",
      targetLabel: "Archival index cards",
    });

    const encounters = await repo.listEncountersForJourney(created.journey.id);
    expect(encounters).toHaveLength(4);
    expect(encounters.some((encounter) => encounter.id === added.id)).toBe(true);
  });

  it("lists multiple Journeys without First Landing special casing", async () => {
    const repo = createLocalCreatorBetaRepository();
    await repo.createJourney({
      proposal: createPrototypeJourneyProposal("A Tahoe clarity journey."),
    });
    await repo.createJourney({
      proposal: createPrototypeJourneyProposal("A desk-based philosophy journey."),
    });

    const journeys = await repo.listJourneys();
    expect(journeys.length).toBeGreaterThanOrEqual(2);
    expect(journeys.every((journey) => journey.encounterCount >= 3)).toBe(true);
  });
});
