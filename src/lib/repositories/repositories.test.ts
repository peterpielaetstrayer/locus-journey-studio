import { describe, expect, it } from "vitest";
import { createLocalRepositories, isVersionEditable } from "@/lib/repositories/local";

describe("repository adapter selection", () => {
  it("local adapter reports demo mode", () => {
    const repos = createLocalRepositories();
    expect(repos.mode).toBe("demo");
  });

  it("loads canonical local draft", async () => {
    const repos = createLocalRepositories();
    const draft = await repos.journeys.getCanonicalDraft("water-writes-the-landscape");
    expect(draft?.journey.title).toBe("Water Writes the Landscape");
    expect(draft?.stops).toHaveLength(8);
    expect(draft?.isEditable).toBe(true);
  });
});

describe("version immutability logic", () => {
  it("treats published and archived as not editable", () => {
    expect(isVersionEditable("published")).toBe(false);
    expect(isVersionEditable("archived")).toBe(false);
    expect(isVersionEditable("draft")).toBe(true);
    expect(isVersionEditable("field_test")).toBe(true);
  });
});

describe("demo field note persistence", () => {
  it("creates a field note in local adapter", async () => {
    const repos = createLocalRepositories();
    const note = await repos.fieldNotes.create({
      learnerId: "learner-maya",
      journeyId: "journey-water-writes",
      stopId: "stop-water-fingerprints",
      captureType: "text",
      observation: "Dark soil near roots",
      evidence: ["wet soil"],
      confidence: 2,
      mentorReviewed: false,
      visibility: "mentor",
    });
    expect(note.observation).toContain("Dark soil");
  });
});

describe("mentor override persistence", () => {
  it("stores override reason on intervention update", async () => {
    const repos = createLocalRepositories();
    const created = await repos.interventions.create({
      learnerId: "learner-eli",
      stopId: "stop-water-fingerprints",
      category: "engage",
      recommendationSource: "simulated-ai",
      reason: "Inactivity",
      message: "Find one new detail",
      status: "recommended",
    });
    const updated = await repos.interventions.update(created.id, {
      overrideReason: "Human mentor chose movement challenge",
      message: "Walk ten steps and capture the strangest root pattern.",
      status: "delivered",
    });
    expect(updated.overrideReason).toContain("Human mentor");
  });
});

describe("artifact mapping", () => {
  it("saves artifact draft locally", async () => {
    const repos = createLocalRepositories();
    const artifact = await repos.artifacts.save({
      learnerId: "learner-maya",
      journeyId: "journey-water-writes",
      title: "Micro-Landscape Systems Card",
      originalHypothesis: "Water shapes soil color",
      strongestEvidence: ["dark soil", "cypress knees"],
      revisedExplanation: "Water organizes plant zones",
      systemsMap: { nodes: [], edges: [] },
      remainingQuestion: "How do drought years change knees?",
      status: "draft",
    });
    expect(artifact.title).toBe("Micro-Landscape Systems Card");
  });
});
