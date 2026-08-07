import { describe, expect, it } from "vitest";
import { JOURNEY_STOPS, WATER_WRITES_JOURNEY } from "@/data/canonical";
import type { FieldNote } from "@/types";
import {
  buildLegacyJourneyManifest,
  legacyFieldNoteToCapture,
  legacyFieldNoteToEvidence,
  legacyStopToEncounter,
} from "./legacy-adapter";

describe("Creator Beta legacy adapter", () => {
  it("maps Water Writes the Landscape into a portable Journey Manifest", () => {
    const manifest = buildLegacyJourneyManifest(
      WATER_WRITES_JOURNEY,
      JOURNEY_STOPS,
      "2026-08-07T15:30:00.000Z",
    );

    expect(manifest.manifestVersion).toBe("0.1");
    expect(manifest.journey.title).toBe("Water Writes the Landscape");
    expect(manifest.journey.thread.statement).toBe(WATER_WRITES_JOURNEY.centralQuestion);
    expect(manifest.journey.encounterIds).toEqual(WATER_WRITES_JOURNEY.stopIds);
    expect(manifest.encounters).toHaveLength(8);
    expect(manifest.encounters.map((encounter) => encounter.id)).toEqual(
      WATER_WRITES_JOURNEY.stopIds,
    );
  });

  it("preserves the observation-first anatomy of a legacy stop", () => {
    const threshold = JOURNEY_STOPS.find((stop) => stop.id === "stop-threshold");
    expect(threshold).toBeDefined();

    const encounter = legacyStopToEncounter(threshold!);

    expect(encounter.target.type).toBe("place");
    expect(encounter.target.label).toBe(threshold!.locationLabel);
    expect(encounter.creatorIntent).toBe(threshold!.purpose);
    expect(encounter.learnerPrompt).toBe(threshold!.openingPrompt);
    expect(encounter.learnerAction).toBe(threshold!.fieldAction);
    expect(encounter.evidenceRequest.allowedCaptureKinds).toContain("text");
    expect(encounter.provenance.origin).toBe("imported");
  });

  it("keeps a Field Note as a learner capture while allowing separate Evidence", () => {
    const note: FieldNote = {
      id: "note-1",
      learnerId: "learner-maya",
      journeyId: WATER_WRITES_JOURNEY.id,
      stopId: "stop-water-fingerprints",
      captureType: "text",
      observation: "The soil is darker and wetter beside the boardwalk.",
      inference: "Water availability may be changing the local soil conditions.",
      evidence: ["dark saturated soil"],
      confidence: 3,
      createdAt: "2026-08-07T15:30:00.000Z",
      mentorReviewed: false,
      visibility: "mentor",
    };

    const capture = legacyFieldNoteToCapture(note);
    const evidence = legacyFieldNoteToEvidence(note);

    expect(capture.id).toBe("capture-note-1");
    expect(capture.provenance.origin).toBe("learner");
    expect(evidence.id).toBe("evidence-note-1");
    expect(evidence.supportingCaptureIds).toEqual([capture.id]);
    expect(evidence.claim).toBe(note.inference);
    expect(evidence.confidence).toBe(0.75);
  });
});
