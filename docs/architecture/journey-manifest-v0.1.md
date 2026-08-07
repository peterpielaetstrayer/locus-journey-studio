# LOCUS Journey Manifest v0.1

**Owner:** Peter Pielaet-Strayer  
**Status:** Active  
**Version:** 0.1  
**Last updated:** 2026-08-07  
**Governs:** Minimum portable contract for an authored LOCUS Journey and its Encounters across Journey Studio and LOCUS Core.  

---

## 1. Purpose

The Journey Manifest separates the semantic learning architecture from a specific UI, route structure, database schema, map renderer, or AI provider.

A Journey created in Journey Studio should be portable enough to:

- preview in Journey Studio;
- instantiate for a learner;
- import into LOCUS Core;
- adapt to another rendering surface later;
- preserve creator intent, safety boundaries, evidence expectations, and provenance.

## 2. Contract principles

- Journeys are authored canonical structures; learner-specific presentation is a separate layer.
- Encounters are not limited to physical stops.
- Physical location is optional.
- AI suggestions do not become canonical content without explicit product validation/acceptance.
- Captures and Evidence are distinct.
- Provenance is preserved.
- Optional fields should remain optional until real use demonstrates that they are structurally necessary.
- Contract meaning takes priority over current database naming such as `journey_stop`.

## 3. Manifest

```ts
interface JourneyManifestV01 {
  manifestVersion: "0.1";
  journey: ManifestJourney;
  encounters: ManifestEncounter[];
  generatedAt: ISODateTime;
}
```

## 4. Journey

```ts
type JourneyThreadType =
  | "question"
  | "problem"
  | "purpose"
  | "capability"
  | "transformation";

type JourneyLifecycleStatus =
  | "concept"
  | "draft"
  | "test"
  | "published"
  | "archived";

interface ManifestJourney {
  id: Id;
  title: string;
  creatorIds: Id[];
  status: JourneyLifecycleStatus;

  thread: {
    type: JourneyThreadType;
    statement: string;
  };

  learnerContext: {
    description: string;
  };

  encounterIds: Id[];
  sourceContext: SourceReference[];
  provenance: Provenance;

  description?: string;
  locationLabel?: string;
  durationMinutes?: number;
  desiredOutcome?: string;
  finalArtifactDescription?: string;
  learningDomains?: string[];
  prerequisiteConcepts?: string[];
}
```

## 5. Encounter

```ts
type EncounterTargetType =
  | "place"
  | "phenomenon"
  | "object"
  | "resource"
  | "person"
  | "problem"
  | "question"
  | "simulation"
  | "artifact"
  | "other";

type CaptureKind = "text" | "photo" | "voice" | "video" | "sketch" | "choice";

interface ManifestEncounter {
  id: Id;
  journeyId: Id;
  order: number;
  title: string;

  target: {
    type: EncounterTargetType;
    label: string;
    location?: GeoPoint;
  };

  learnerPrompt: string;
  learnerAction: string;

  evidenceRequest: {
    prompt: string;
    allowedCaptureKinds: CaptureKind[];
  };

  provenance: Provenance;

  creatorIntent?: string;
  resources?: SourceReference[];
  scaffolds?: string[];
  safetyNotes?: string[];
  accessibilityAlternatives?: string[];
  artifactContribution?: string;
  resurfacingConnection?: string;
  optional?: boolean;
}
```

The conceptual grammar is:

```text
Attend → Act → Evidence
```

`learnerPrompt` frames attention. `learnerAction` defines meaningful action. `evidenceRequest` specifies what learner-produced material could support later interpretation.

## 6. Capture and Evidence

The Journey Manifest defines the requested capture modes, but learner-produced records live outside the canonical Journey.

```ts
interface LearnerCapture {
  id: Id;
  learnerId: Id;
  journeyId?: Id;
  encounterId?: Id;
  kind: CaptureKind;
  content?: string;
  mediaRef?: string;
  createdAt: ISODateTime;
  provenance: Provenance;
}
```

Evidence is a separate record:

```ts
type EvidenceKind =
  | "observation"
  | "explanation"
  | "retrieval"
  | "practice"
  | "comparison"
  | "artifact"
  | "action"
  | "mentor_feedback";

interface Evidence {
  id: Id;
  learnerId: Id;
  journeyId: Id;
  encounterId?: Id;
  kind: EvidenceKind;
  supportingCaptureIds: Id[];
  claim?: string;
  confidence?: number;
  createdAt: ISODateTime;
  provenance: Provenance;
}
```

A capture may exist without becoming Evidence. Evidence is not automatically mastery.

## 7. Provenance

```ts
type ProvenanceOrigin =
  | "creator"
  | "imported"
  | "ai_generated"
  | "ai_inferred"
  | "learner";

interface SourceReference {
  type: "document" | "journey" | "encounter" | "capture" | "url" | "other";
  id: Id;
  locator?: string;
}

interface Provenance {
  origin: ProvenanceOrigin;
  createdById?: Id;
  sourceRefs: SourceReference[];
  adaptedFrom?: SourceReference;
  version: string;
}
```

Provenance answers: **Why is this here? Where did it come from? Who or what authored it?**

## 8. Draft Journey Proposal

AI Creator Intelligence should return proposals before canonical writes.

```ts
interface DraftJourneyProposal {
  id: Id;
  seedText: string;
  suggestedTitle: string;
  suggestedThread: ManifestJourney["thread"];
  suggestedLearnerContext: ManifestJourney["learnerContext"];
  rationale: string;
  suggestedEncounters: Array<
    Pick<ManifestEncounter, "title" | "target" | "learnerPrompt" | "learnerAction" | "evidenceRequest">
  >;
  questionsForCreator: string[];
  provenance: Provenance;
}
```

A proposal is not a Journey until the application validates it and the creator accepts or edits it.

## 9. Legacy Journey Studio mapping

During migration:

```text
Journey.centralQuestion        → Journey.thread.statement
Journey.audience               → Journey.learnerContext.description
Journey.stopIds                → Journey.encounterIds
JourneyStop                    → Encounter
JourneyStop.locationLabel      → Encounter.target.label
JourneyStop.purpose            → Encounter.creatorIntent
JourneyStop.openingPrompt      → Encounter.learnerPrompt
JourneyStop.fieldAction        → Encounter.learnerAction
JourneyStop.safetyNotes        → Encounter.safetyNotes
JourneyStop.accessibility...   → Encounter.accessibilityAlternatives
FieldNote                      → LearnerCapture + optional Evidence support
```

The existing database may retain `journey_stops` temporarily. Contract terminology changes before persistence terminology if that reduces migration risk.

## 10. First Landing acceptance test

The contract is viable when the existing **Water Writes the Landscape** content can be represented without losing:

- central question / Journey Thread;
- encounter order;
- observation-first prompts;
- learner actions;
- evidence expectations;
- safety/accessibility;
- artifacts and resurfacing references;
- creator provenance.

## 11. Second-journey test

A small Tahoe Journey must be representable and renderable through the same contract with no Tahoe-specific product code.

## 12. Deferred fields

Not required in v0.1:

- full standards alignment;
- knowledge graph bindings;
- full adaptation rules;
- learner-model claims;
- organization/cohort permissions;
- marketplace metadata;
- AR renderer metadata;
- complex graph routing.

These may be added as optional fields or later contract versions after validated need.