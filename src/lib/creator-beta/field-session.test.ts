import { describe, expect, it } from "vitest";
import {
  appendCreatorObservation,
  isCreatorFieldSession,
  MAX_FIELD_NOTES,
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
});
