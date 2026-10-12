import { describe, expect, it } from "vitest";
import {
  FIELD_AI_SCHEMA, fieldAiSuggestionToProposal,
  parseFieldAiInput, parseFieldAiSuggestion,
} from "./field-ai";

const ids = {
  sessionId: "11111111-1111-4111-8111-111111111111",
  observationId: "22222222-2222-4222-8222-222222222222",
};
const rawInput = {
  ...ids,
  observation: "Water appears to collect near the trail edge.",
  placeLabel: "First Landing",
  learnerContext: "Adult field pilot",
};
const rawSuggestion = {
  journeyTitle: "Where Does Water Settle?",
  journeyQuestion: "How does topography affect standing water?",
  encounterTitle: "Compare Two Surfaces",
  learnerQuestion: "Where can you see signs of water lingering?",
  learnerAction: "Compare two publicly accessible surfaces from a safe viewing position.",
  evidencePrompt: "Record two observed differences, one possible mechanism and one uncertainty.",
  safetyConsideration: "Stay on designated trails; avoid entering wetlands.",
  factCheckQuestion: "Can you verify drainage differences using field evidence or credible sources?",
  rationale: "Comparing accessible surfaces can test the claim without assuming a particular hydrological process.",
};

describe("Field AI adult pilot contract", () => {
  it("limits model requests to a selected text observation and bounded context", () => {
    const input = parseFieldAiInput(rawInput);
    expect(input).toEqual(rawInput);
    expect(parseFieldAiInput({ ...rawInput, observation: "" })).toBeNull();
    expect(parseFieldAiInput({ ...rawInput, observation: "x".repeat(1501) })).toBeNull();
    expect(parseFieldAiInput({ ...rawInput, placeLabel: "x".repeat(121) })).toBeNull();
    expect(parseFieldAiInput({ ...rawInput, sessionId: "../unsafe" })).toBeNull();
    expect(parseFieldAiInput(null)).toBeNull();
  });
  it("rejects incomplete, invalid, or unbounded model outputs", () => {
    expect(FIELD_AI_SCHEMA.additionalProperties).toBe(false);
    expect(parseFieldAiSuggestion(rawSuggestion)).toEqual(rawSuggestion);
    expect(parseFieldAiSuggestion({ ...rawSuggestion, learnerAction: "" })).toBeNull();
    expect(parseFieldAiSuggestion({ ...rawSuggestion, journeyTitle: "x".repeat(601) })).toBeNull();
    expect(parseFieldAiSuggestion({ journeyTitle: "short" })).toBeNull();
  });
  it("makes AI provenance explicit and does not turn a suggestion into an accepted or published Journey", () => {
    const input = parseFieldAiInput(rawInput)!;
    const suggestion = parseFieldAiSuggestion(rawSuggestion)!;
    const proposal = fieldAiSuggestionToProposal(input, suggestion);
    expect(proposal.id).toBe(`field-ai-${ids.sessionId}-${ids.observationId}`);
    expect(proposal.provenance).toEqual({
      origin: "ai_generated",
      sourceRefs: [{ type: "capture", id: ids.observationId }],
      version: "field-ai-alpha-v0.1",
    });
    expect(proposal.suggestedEncounters).toHaveLength(1);
    expect(proposal.suggestedEncounters[0].learnerAction).toContain("Compare two");
    expect(proposal.suggestedEncounters[0].evidenceRequest.allowedCaptureKinds).toEqual(["text"]);
    expect(proposal.questionsForCreator.join(" ")).toContain("verify drainage");
    expect(proposal.rationale).toContain("not a sourced or verified claim");
    expect(proposal).not.toHaveProperty("status", "published");
  });
});
