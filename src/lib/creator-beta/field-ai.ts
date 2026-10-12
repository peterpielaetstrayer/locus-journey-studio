import type { DraftJourneyProposal } from "@/types/creator-beta";

/** The server only sends one creator-selected observation, never browser-local history. */
export type FieldAiInput = {
  sessionId: string;
  observationId: string;
  observation: string;
  placeLabel: string;
  learnerContext: string;
};

export type FieldAiSuggestion = {
  journeyTitle: string;
  journeyQuestion: string;
  encounterTitle: string;
  learnerQuestion: string;
  learnerAction: string;
  evidencePrompt: string;
  safetyConsideration: string;
  factCheckQuestion: string;
  rationale: string;
};

export const FIELD_AI_SCHEMA = {
  type: "object",
  properties: {
    journeyTitle: { type: "string" },
    journeyQuestion: { type: "string" },
    encounterTitle: { type: "string" },
    learnerQuestion: { type: "string" },
    learnerAction: { type: "string" },
    evidencePrompt: { type: "string" },
    safetyConsideration: { type: "string" },
    factCheckQuestion: { type: "string" },
    rationale: { type: "string" },
  },
  required: [
    "journeyTitle", "journeyQuestion", "encounterTitle", "learnerQuestion",
    "learnerAction", "evidencePrompt", "safetyConsideration", "factCheckQuestion", "rationale",
  ],
  additionalProperties: false,
} as const;

export function parseFieldAiInput(value: unknown): FieldAiInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const fields = value as Record<string, unknown>;
  if (
    typeof fields.sessionId !== "string" || !/^[a-zA-Z0-9-]{16,70}$/.test(fields.sessionId) ||
    typeof fields.observationId !== "string" || !/^[a-zA-Z0-9-]{16,70}$/.test(fields.observationId) ||
    typeof fields.observation !== "string" ||
    !fields.observation.trim() || fields.observation.trim().length > 1500 ||
    typeof fields.placeLabel !== "string" || fields.placeLabel.length > 120 ||
    typeof fields.learnerContext !== "string" || fields.learnerContext.length > 300
  ) return null;
  return {
    sessionId: fields.sessionId,
    observationId: fields.observationId,
    observation: fields.observation.trim(),
    placeLabel: fields.placeLabel.trim(),
    learnerContext: fields.learnerContext.trim(),
  };
}

export function parseFieldAiSuggestion(value: unknown): FieldAiSuggestion | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(FIELD_AI_SCHEMA.properties) as Array<keyof FieldAiSuggestion>;
  if (keys.some((key) => typeof obj[key] !== "string" ||
    !(obj[key] as string).trim() || (obj[key] as string).length > 600)) return null;
  return Object.fromEntries(keys.map((key) => [key, (obj[key] as string).trim()])) as FieldAiSuggestion;
}

export function fieldAiSuggestionToProposal(
  input: FieldAiInput,
  suggestion: FieldAiSuggestion,
): DraftJourneyProposal {
  return {
    id: `field-ai-${input.sessionId}-${input.observationId}`,
    seedText: input.observation,
    suggestedTitle: suggestion.journeyTitle,
    suggestedThread: { type: "question", statement: suggestion.journeyQuestion },
    suggestedLearnerContext: { description: input.learnerContext || "Adult field-test audience; refine before sharing." },
    rationale: `AI-assisted design hypothesis, not a sourced or verified claim. ${suggestion.rationale} Safety: ${suggestion.safetyConsideration}. Creator must verify before field use.`,
    suggestedEncounters: [{
      title: suggestion.encounterTitle,
      target: {
        type: "phenomenon",
        label: input.observation.slice(0, 160),
      },
      learnerPrompt: suggestion.learnerQuestion,
      learnerAction: suggestion.learnerAction,
      evidenceRequest: { prompt: suggestion.evidencePrompt, allowedCaptureKinds: ["text"] },
    }],
    questionsForCreator: [
      `Safety and access: ${suggestion.safetyConsideration}`,
      `Fact-check before publication: ${suggestion.factCheckQuestion}`,
    ],
    provenance: {
      origin: "ai_generated",
      sourceRefs: [{ type: "capture", id: input.observationId }],
      version: "field-ai-alpha-v0.1",
    },
  };
}
