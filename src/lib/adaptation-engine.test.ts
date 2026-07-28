import { describe, expect, it } from "vitest";
import { evaluateAdaptation, ADAPTATION_RULES } from "./adaptation-engine";
import {
  getLearnerById,
  getStopById,
  LEARNERS,
} from "@/data/canonical";
import type { FieldNote } from "@/types";

const waterFingerprintsStop = getStopById("stop-water-fingerprints")!;
const maya = getLearnerById("learner-maya")!;
const eli = getLearnerById("learner-eli")!;
const jordan = getLearnerById("learner-jordan")!;

function makeNote(overrides: Partial<FieldNote> = {}): FieldNote {
  return {
    id: "note-1",
    learnerId: "learner-maya",
    journeyId: "journey-water-writes",
    stopId: "stop-water-fingerprints",
    captureType: "text",
    observation: "Dark, saturated soil near the boardwalk edge",
    evidence: ["soil color", "moss pattern"],
    confidence: 3,
    createdAt: new Date().toISOString(),
    mentorReviewed: false,
    visibility: "private",
    ...overrides,
  };
}

describe("adaptation engine — safety", () => {
  it("refuses unsafe action with highest priority", () => {
    const result = evaluateAdaptation({
      learner: maya,
      stop: waterFingerprintsStop,
      recentNotes: [],
      evidenceCount: 0,
      unsafeActionRequested: true,
    });
    expect(result.prompt).toBe(ADAPTATION_RULES.SAFETY_PROMPT);
    expect(result.category).toBe("safety");
    expect(result.priority).toBe("high");
  });
});

describe("adaptation engine — mentor override", () => {
  it("preserves mentor message and reason", () => {
    const result = evaluateAdaptation({
      learner: maya,
      stop: waterFingerprintsStop,
      recentNotes: [],
      evidenceCount: 0,
      mentorOverride: {
        id: "int-1",
        learnerId: "learner-maya",
        stopId: "stop-water-fingerprints",
        category: "deepen",
        recommendationSource: "mentor",
        reason: "Maya is ready for cross-zone comparison",
        message: "Compare the wet zone soil to the drier zone twenty steps ahead.",
        status: "recommended",
      },
    });
    expect(result.source).toBe("mentor-override");
    expect(result.prompt).toContain("Compare the wet zone");
    expect(result.reason).toContain("Maya is ready");
  });
});

describe("adaptation engine — inactivity", () => {
  it("triggers engage prompt for Eli after 7 minutes", () => {
    const result = evaluateAdaptation({
      learner: eli,
      stop: waterFingerprintsStop,
      recentNotes: [],
      evidenceCount: 0,
      simulatedInactiveMinutes: 7,
    });
    expect(result.prompt).toBe(ADAPTATION_RULES.INACTIVITY_PROMPT);
    expect(result.category).toBe("engage");
  });

  it("does not trigger inactivity for non-movement learners", () => {
    const result = evaluateAdaptation({
      learner: maya,
      stop: waterFingerprintsStop,
      recentNotes: [],
      evidenceCount: 0,
      simulatedInactiveMinutes: 10,
    });
    expect(result.prompt).not.toBe(ADAPTATION_RULES.INACTIVITY_PROMPT);
  });
});

describe("adaptation engine — high confidence weak evidence", () => {
  it("requests challenging evidence for Maya", () => {
    const result = evaluateAdaptation({
      learner: maya,
      stop: waterFingerprintsStop,
      recentNotes: [makeNote({ confidence: 4, evidence: ["one clue"] })],
      evidenceCount: 1,
      confidence: 4,
    });
    expect(result.prompt).toBe(ADAPTATION_RULES.HIGH_CONFIDENCE_WEAK_EVIDENCE_PROMPT);
  });
});

describe("adaptation engine — low confidence strong observation", () => {
  it("encourages tentative claim", () => {
    const result = evaluateAdaptation({
      learner: jordan,
      stop: waterFingerprintsStop,
      recentNotes: [
        makeNote({
          learnerId: "learner-jordan",
          observation: "Roots spread wide near the waterline with dark anaerobic soil",
          evidence: ["root spread", "soil color"],
          confidence: 2,
        }),
        makeNote({
          learnerId: "learner-jordan",
          observation: "Leaf litter decomposes slower in the saturated zone near knees",
          evidence: ["decomposition rate", "leaf condition"],
          confidence: 2,
        }),
      ],
      evidenceCount: 4,
      confidence: 2,
    });
    expect(result.prompt).toBe(ADAPTATION_RULES.LOW_CONFIDENCE_STRONG_OBSERVATION_PROMPT);
  });
});

describe("adaptation engine — structured learner", () => {
  it("provides stepwise support for Jordan", () => {
    const result = evaluateAdaptation({
      learner: jordan,
      stop: waterFingerprintsStop,
      recentNotes: [makeNote({ learnerId: "learner-jordan", confidence: 3, evidence: ["a", "b"] })],
      evidenceCount: 2,
      confidence: 3,
    });
    expect(result.prompt).toBe(ADAPTATION_RULES.STRUCTURED_LEARNER_PROMPT);
    expect(result.category).toBe("structure");
  });
});

describe("adaptation engine — advanced extension", () => {
  it("offers field test design for Maya with strong evidence", () => {
    const result = evaluateAdaptation({
      learner: maya,
      stop: waterFingerprintsStop,
      recentNotes: [
        makeNote({ evidence: ["a", "b", "c"], confidence: 3 }),
      ],
      evidenceCount: 3,
      confidence: 3,
    });
    expect(result.prompt).toBe(ADAPTATION_RULES.ADVANCED_EXTENSION_PROMPT);
  });
});

describe("adaptation engine — creator fallback", () => {
  it("uses creator fallback when no rule matches", () => {
    const result = evaluateAdaptation({
      learner: eli,
      stop: waterFingerprintsStop,
      recentNotes: [],
      evidenceCount: 0,
      creatorFallbackPrompt: "You noticed dark, wet soil near the boardwalk. What nearby comparison could strengthen or challenge your explanation?",
    });
    expect(result.source).toBe("creator-fallback");
    expect(result.prompt).toContain("dark, wet soil");
  });
});

describe("adaptation engine — priority ordering", () => {
  it("safety beats mentor override context", () => {
    const result = evaluateAdaptation({
      learner: maya,
      stop: waterFingerprintsStop,
      recentNotes: [],
      evidenceCount: 0,
      unsafeActionRequested: true,
      mentorOverride: {
        id: "int-1",
        learnerId: "learner-maya",
        stopId: "stop-water-fingerprints",
        category: "deepen",
        recommendationSource: "mentor",
        reason: "test",
        message: "Mentor message",
        status: "recommended",
      },
    });
    expect(result.category).toBe("safety");
  });
});

describe("canonical learners exist", () => {
  it("has Maya, Eli, and Jordan", () => {
    expect(LEARNERS).toHaveLength(3);
    expect(maya.adaptationProfile).toBe("curious");
    expect(eli.adaptationProfile).toBe("movement");
    expect(jordan.adaptationProfile).toBe("structured");
  });
});
