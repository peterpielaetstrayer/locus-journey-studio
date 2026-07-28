# Deterministic Adaptation Engine v0.1

## Purpose

Demonstrate plausible personalization without pretending to use unrestricted live AI.

## Input

```ts
type AdaptationInput = {
  learner: LearnerProfile;
  stop: JourneyStop;
  recentNotes: FieldNote[];
  evidenceCount: number;
  confidence?: Confidence;
  simulatedInactiveMinutes?: number;
  repeatedHintCount?: number;
  unsafeActionRequested?: boolean;
  mentorOverride?: MentorIntervention;
};
```

## Output

```ts
type AdaptationRecommendation = {
  id: string;
  category: InterventionCategory;
  prompt: string;
  reason: string;
  priority: "low" | "medium" | "high";
  source: "deterministic-rule";
  requiresHumanReview: boolean;
};
```

## Rule order

1. safety
2. mentor override
3. accessibility
4. disengagement
5. insufficient evidence
6. confidence calibration
7. structured support
8. advanced extension
9. creator-authored fallback

## Canonical rules

### Safety refusal

If unsafe action requested:

> Stay on the designated route and observe from here. Choose a safe feature to photograph, sketch, or describe instead.

### Mentor override

Use the human message exactly and preserve the reason.

### Inactivity

For Eli after seven simulated minutes:

> Find the strangest thing within ten safe steps. Capture it and convince us why it matters.

### High confidence, weak evidence

If confidence >= 3 and evidence < 2:

> Find one observation that could challenge your current explanation.

### Low confidence, strong observation

If confidence <= 2 and at least two specific observations:

> Your observations are specific. Make a tentative claim beginning with “One possibility is…”

### Structured learner

For Jordan:

> Step 1: Choose two examples. Step 2: Name one similarity. Step 3: Name one difference.

### Advanced extension

For Maya with at least three evidence items:

> Design a field test that could distinguish between two competing explanations.

## Explainability

Every orchestrator recommendation must include rule, evidence used, uncertainty, and human-review status.

## Prohibited behavior

Do not infer medical/protected traits, diagnose, rank publicly, reduce confidence to a grade, fabricate facts, create unsafe navigation, silently override a mentor, or create punitive streaks.

## Tests

Write unit tests for all canonical rules and priority ordering.
