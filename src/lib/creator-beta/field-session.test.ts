import { describe, expect, it } from "vitest";
import {
  appendCreatorObservation,
  isCreatorFieldSession,
  MAX_FIELD_NOTES,
  MAX_FIELD_EXPORT_SIZE,
  parseCreatorFieldExport,
  newCreatorFieldSession,
  observationToJourneyProposal,
} from "./field-session";

describe("creator field observation → Encounter", () => {
  it("preserves the observation, creator provenance and exactly one editable Encounter scaffold", () => {
    const started = newCreatorFieldSession("First Landing");
    const captured = appendCreatorObservation(started, "Wet ground beside a boardwalk", "observation-one", "2026-10-12T13:00:00Z");
    const proposal = observationToJourneyProposal(captured, "observation-one");
    expect(captured.observations[0].text).toBe("Wet ground beside a boardwalk");
    expect(proposal.id).toBe(`field-${started.id}-observation-one`);
    expect(proposal.seedText).toBe("Wet ground beside a boardwalk");
    expect(proposal.provenance.origin).toBe("creator");
    expect(proposal.provenance.sourceRefs).toEqual([{ type: "capture", id: "observation-one" }]);
    expect(proposal.suggestedEncounters).toHaveLength(1);
    expect(proposal.suggestedEncounters[0].evidenceRequest.allowedCaptureKinds).toEqual(["text"]);
    expect(proposal.rationale).toMatch(/not.*AI model/);
    expect(observationToJourneyProposal(captured, "observation-one").id).toBe(proposal.id);
  });
  it("rejects missing notes, empty input, oversize input and a full notebook", () => {
    const session = newCreatorFieldSession();
    expect(() => appendCreatorObservation(session, "  ")).toThrow();
    expect(() => appendCreatorObservation(session, "x".repeat(1501))).toThrow();
    expect(() => observationToJourneyProposal(session, "missing")).toThrow();
    const full = { ...session, observations: Array.from({ length: MAX_FIELD_NOTES }, (_, i) => ({
      id: String(i), text: "observed", createdAt: "2026-10-12T13:00:00Z",
    })) };
    expect(() => appendCreatorObservation(full, "another")).toThrow();
  });
  it("rejects malformed persisted records so they cannot be silently overwritten", () => {
    const session = newCreatorFieldSession();
    expect(isCreatorFieldSession(session)).toBe(true);
    expect(isCreatorFieldSession({ ...session, version: 2 })).toBe(false);
    expect(isCreatorFieldSession({ ...session, observations: [{ id: 1 }] })).toBe(false);
    expect(isCreatorFieldSession(null)).toBe(false);
  });
  it("restores an exported private field notebook without losing capture IDs or Journey reference", () => {
    const started = newCreatorFieldSession("First Landing");
    const saved = {
      ...appendCreatorObservation(started, "The path is higher than the wetland", "field-a", "2026-10-12T13:00:00Z"),
      createdJourneyId: "journey-123",
    };
    const exported = JSON.stringify({ notice: "Private field export", session: saved });
    expect(parseCreatorFieldExport(exported)).toEqual(saved);
    expect(parseCreatorFieldExport(JSON.stringify(saved))).toEqual(saved);
    expect(observationToJourneyProposal(parseCreatorFieldExport(exported), "field-a").id)
      .toBe(`field-${started.id}-field-a`);
  });

  it("fails closed on malformed, oversized, unsupported and duplicate-observation imports", () => {
    const session = newCreatorFieldSession("a place");
    const noted = appendCreatorObservation(session, "An observation", "same", "2026-10-12T13:00:00Z");
    expect(() => parseCreatorFieldExport("{broken")).toThrow(/JSON/);
    expect(() => parseCreatorFieldExport("x".repeat(MAX_FIELD_EXPORT_SIZE + 1))).toThrow(/large/);
    expect(() => parseCreatorFieldExport(JSON.stringify({ ...noted, version: 2 }))).toThrow(/valid/);
    expect(() => parseCreatorFieldExport(JSON.stringify({ session: { ...noted, observations: [noted.observations[0], noted.observations[0]] } }))).toThrow(/valid/);
    expect(() => parseCreatorFieldExport(JSON.stringify({ session: { ...noted, placeLabel: "x".repeat(121) } }))).toThrow(/valid/);
    expect(() => parseCreatorFieldExport(JSON.stringify({ other: noted }))).toThrow(/valid/);
  });

});
