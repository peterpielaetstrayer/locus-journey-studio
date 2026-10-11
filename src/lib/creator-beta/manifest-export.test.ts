import { describe, expect, it } from "vitest";
import type { CreatorJourney, Encounter } from "@/types/creator-beta";
import {
  buildJourneyManifestForExport,
  manifestFilename,
} from "./manifest-export";

function journey(): CreatorJourney {
  return {
    id: "journey-tahoe",
    title: "How Did Tahoe Become Tahoe?",
    creatorIds: ["adult-creator"],
    status: "draft",
    thread: { type: "question", statement: "How did the landscape form?" },
    learnerContext: { description: "Independent adult field learner" },
    encounterIds: ["encounter-1"],
    sourceContext: [],
    provenance: {
      origin: "creator",
      createdById: "adult-creator",
      sourceRefs: [],
      version: "creator-beta-v0.2",
    },
  };
}

function encounter(): Encounter {
  return {
    id: "encounter-1",
    journeyId: "journey-tahoe",
    order: 1,
    title: "Observe the shoreline",
    target: { type: "phenomenon", label: "Geological shoreline clues" },
    learnerPrompt: "Look before interpreting.",
    learnerAction: "Compare two patterns and describe what you see.",
    evidenceRequest: {
      prompt: "What observation supports your explanation?",
      allowedCaptureKinds: ["text"],
    },
    provenance: {
      origin: "creator",
      sourceRefs: [{ type: "url", id: "source-1" }],
      version: "creator-beta-v0.2",
    },
  };
}

describe("portable Creator Beta Journey Manifest export", () => {
  it("preserves authored order, context, evidence request and provenance", () => {
    const result = buildJourneyManifestForExport(
      journey(),
      { "encounter-1": encounter() },
      "2026-10-11T12:00:00.000Z",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.manifest.manifestVersion).toBe("0.1");
    expect(result.manifest.journey.thread.statement).toBe("How did the landscape form?");
    expect(result.manifest.encounters.map((entry) => entry.id)).toEqual(["encounter-1"]);
    expect(result.manifest.encounters[0].evidenceRequest.allowedCaptureKinds).toEqual(["text"]);
    expect(result.manifest.encounters[0].provenance.sourceRefs).toEqual([
      { type: "url", id: "source-1" },
    ]);
  });

  it("accepts non-geographic and home/museum-style encounters", () => {
    const indoor = encounter();
    indoor.target = { type: "object", label: "Museum artifact" };
    const result = buildJourneyManifestForExport(journey(), { "encounter-1": indoor });
    expect(result.ok).toBe(true);
  });

  it("reports missing Encounter and duplicate IDs instead of quietly exporting", () => {
    const missing = buildJourneyManifestForExport(journey(), {});
    expect(missing.ok).toBe(false);
    const duplicate = journey();
    duplicate.encounterIds = ["encounter-1", "encounter-1"];
    const result = buildJourneyManifestForExport(duplicate, { "encounter-1": encounter() });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.join(" ")).toMatch(/repeat/);
  });

  it("rejects mismatched Journey ID and absent learning instructions", () => {
    const wrong = encounter();
    wrong.journeyId = "another-journey";
    wrong.learnerPrompt = " ";
    const result = buildJourneyManifestForExport(journey(), { "encounter-1": wrong });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.join(" ")).toMatch(/different Journey/);
      expect(result.issues.join(" ")).toMatch(/ATTEND and ACT/);
    }
  });

  it("rejects invalid capture modes and mismatched encounter order", () => {
    const bad = encounter();
    bad.order = 2;
    bad.evidenceRequest.allowedCaptureKinds = ["unsafe" as "text"];
    const result = buildJourneyManifestForExport(journey(), { "encounter-1": bad });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.join(" ")).toMatch(/order/);
      expect(result.issues.join(" ")).toMatch(/capture kinds/);
    }
  });

  it("exports a detached snapshot rather than a mutable store reference", () => {
    const source = journey();
    const sourceEncounter = encounter();
    const result = buildJourneyManifestForExport(
      source,
      { "encounter-1": sourceEncounter },
      "2026-10-11T12:00:00.000Z",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    source.title = "Changed after export";
    sourceEncounter.title = "Changed encounter";
    expect(result.manifest.journey.title).toBe("How Did Tahoe Become Tahoe?");
    expect(result.manifest.encounters[0].title).toBe("Observe the shoreline");
  });

  it("creates a safe, predictable download filename", () => {
    expect(manifestFilename("Tahoe / Glacial? History")).toBe(
      "locus-journey-tahoe-glacial-history-manifest-v0.1.json",
    );
  });
});
