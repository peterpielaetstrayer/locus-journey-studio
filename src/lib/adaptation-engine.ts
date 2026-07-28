import type {
  AdaptationInput,
  AdaptationRecommendation,
  Confidence,
} from "@/types";
import { generateId } from "@/lib/utils";

const SAFETY_PROMPT =
  "Stay on the designated route and observe from here. Choose a safe feature to photograph, sketch, or describe instead.";

const INACTIVITY_PROMPT =
  "Find the strangest thing within ten safe steps. Capture it and convince us why it matters.";

const HIGH_CONFIDENCE_WEAK_EVIDENCE_PROMPT =
  "Find one observation that could challenge your current explanation.";

const LOW_CONFIDENCE_STRONG_OBSERVATION_PROMPT =
  'Your observations are specific. Make a tentative claim beginning with "One possibility is…"';

const STRUCTURED_LEARNER_PROMPT =
  "Step 1: Choose two examples. Step 2: Name one similarity. Step 3: Name one difference.";

const ADVANCED_EXTENSION_PROMPT =
  "Design a field test that could distinguish between two competing explanations.";

function countSpecificObservations(notes: AdaptationInput["recentNotes"]): number {
  return notes.filter(
    (n) => n.observation.trim().length > 20 && n.evidence.length > 0,
  ).length;
}

function buildRecommendation(
  category: AdaptationRecommendation["category"],
  prompt: string,
  reason: string,
  priority: AdaptationRecommendation["priority"],
  source: AdaptationRecommendation["source"],
  requiresHumanReview: boolean,
): AdaptationRecommendation {
  return {
    id: generateId("rec"),
    category,
    prompt,
    reason,
    priority,
    source,
    requiresHumanReview,
  };
}

export function evaluateAdaptation(input: AdaptationInput): AdaptationRecommendation {
  const {
    learner,
    recentNotes,
    evidenceCount,
    confidence,
    simulatedInactiveMinutes = 0,
    unsafeActionRequested,
    mentorOverride,
    creatorFallbackPrompt,
  } = input;

  // Rule 1: Safety
  if (unsafeActionRequested) {
    return buildRecommendation(
      "safety",
      SAFETY_PROMPT,
      "Unsafe action requested — rule priority 1 (safety refusal)",
      "high",
      "deterministic-rule",
      false,
    );
  }

  // Rule 2: Mentor override
  if (mentorOverride) {
    return buildRecommendation(
      mentorOverride.category,
      mentorOverride.message,
      `Mentor override preserved: ${mentorOverride.reason}`,
      "high",
      "mentor-override",
      false,
    );
  }

  // Rule 4: Disengagement (Eli / movement profile)
  if (
    learner.adaptationProfile === "movement" &&
    simulatedInactiveMinutes >= 7
  ) {
    return buildRecommendation(
      "engage",
      INACTIVITY_PROMPT,
      `Simulated inactivity (${simulatedInactiveMinutes} min) for movement-motivated learner`,
      "medium",
      "deterministic-rule",
      true,
    );
  }

  // Rule 5: High confidence + weak evidence
  if (confidence !== undefined && confidence >= 3 && evidenceCount < 2) {
    return buildRecommendation(
      "deepen",
      HIGH_CONFIDENCE_WEAK_EVIDENCE_PROMPT,
      `Confidence level ${confidence} with only ${evidenceCount} evidence item(s) — request challenging evidence`,
      "medium",
      "deterministic-rule",
      true,
    );
  }

  // Rule 6: Low confidence + strong observations
  const specificObservations = countSpecificObservations(recentNotes);
  if (
    confidence !== undefined &&
    confidence <= 2 &&
    specificObservations >= 2
  ) {
    return buildRecommendation(
      "deepen",
      LOW_CONFIDENCE_STRONG_OBSERVATION_PROMPT,
      `Low confidence (${confidence}) but ${specificObservations} specific observations — encourage tentative claim`,
      "medium",
      "deterministic-rule",
      false,
    );
  }

  // Rule 7: Structured learner (Jordan)
  if (learner.adaptationProfile === "structured") {
    return buildRecommendation(
      "structure",
      STRUCTURED_LEARNER_PROMPT,
      "Structured learner profile — stepwise comparison support",
      "medium",
      "deterministic-rule",
      false,
    );
  }

  // Rule 8: Advanced extension (Maya with strong evidence)
  if (
    learner.adaptationProfile === "curious" &&
    evidenceCount >= 3
  ) {
    return buildRecommendation(
      "deepen",
      ADVANCED_EXTENSION_PROMPT,
      `Curious learner with ${evidenceCount} evidence items — experimental design extension`,
      "low",
      "deterministic-rule",
      true,
    );
  }

  // Rule 9: Creator fallback
  if (creatorFallbackPrompt) {
    return buildRecommendation(
      "deepen",
      creatorFallbackPrompt,
      "No higher-priority rule matched — using creator-authored fallback",
      "low",
      "creator-fallback",
      false,
    );
  }

  return buildRecommendation(
    "deepen",
    "What nearby comparison could strengthen or challenge your explanation?",
    "Default adaptive follow-up when no specific rule triggers",
    "low",
    "deterministic-rule",
    false,
  );
}

export function getConfidenceFromNotes(
  notes: AdaptationInput["recentNotes"],
): Confidence | undefined {
  if (notes.length === 0) return undefined;
  return notes[notes.length - 1].confidence;
}

export function getEvidenceCount(notes: AdaptationInput["recentNotes"]): number {
  return notes.reduce((sum, n) => sum + n.evidence.filter(Boolean).length, 0);
}

export const ADAPTATION_RULES = {
  SAFETY_PROMPT,
  INACTIVITY_PROMPT,
  HIGH_CONFIDENCE_WEAK_EVIDENCE_PROMPT,
  LOW_CONFIDENCE_STRONG_OBSERVATION_PROMPT,
  STRUCTURED_LEARNER_PROMPT,
  ADVANCED_EXTENSION_PROMPT,
} as const;
