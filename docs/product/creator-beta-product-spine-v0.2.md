# LOCUS Creator Beta — Product Spine v0.2

**Owner:** Peter Pielaet-Strayer  
**Status:** Active  
**Version:** 0.2  
**Last updated:** 2026-08-07  
**Governs:** The active `creator-beta-v0.2` migration and the reusable Creator → Journey → Encounter → Learner → Evidence product loop.  
**Supersedes:** The Virginia Beach vertical-slice specification only where that specification assumes a single hard-coded journey or treats the reference implementation as the product architecture.  

---

## 1. Product objective

Build the smallest reusable LOCUS Creator system that allows a person to turn knowledge, curiosity, existing curriculum, or a real-world observation into a coherent learning journey without requiring the creator to be a trained learning designer.

> Freedom at the surface. Structure underneath. Intelligence in between.

The first product loop is:

```text
Creator intent
→ AI-assisted structuring
→ Journey
→ Encounter
→ learner experience
→ learner capture
→ Evidence
→ future interpretation and adaptation
```

The Virginia Beach / First Landing experience remains the canonical reference journey, but it must be produced and rendered through reusable product machinery rather than hard-coded product assumptions.

## 2. Design laws

1. **AI-assisted, not AI-required.** Advanced creators may manipulate the structure directly. AI should help novice creators express and improve what they know.
2. **Structured underneath, fluid above.** The interface may begin with conversation, documents, field capture, or manual editing; all routes produce the same canonical objects.
3. **Creator authority is preserved.** AI returns proposals. Durable curriculum changes are accepted, edited, or rejected by the creator.
4. **Observation before explanation where appropriate.** LOCUS should protect learner attention and inquiry rather than defaulting to information delivery.
5. **Evidence is not mastery.** Learner captures can support Evidence; Evidence can inform later learner-model interpretations. No layer collapses automatically into the next.
6. **Reference implementation before ecosystem.** First Landing proves the machinery. A second small journey proves generality.
7. **Shared anchors, personalized edges.** Authored journeys may later produce learner-specific instances without erasing the creator's canonical structure.
8. **Provenance is durable.** Creator-supplied, imported, AI-generated, AI-inferred, and learner-generated material remain distinguishable.

## 3. Core primitives

### Journey

An authored learning arc organized around a persistent Journey Thread.

Required system meaning:

- identity;
- creator ownership;
- Journey Thread;
- intended learner context;
- ordered or networked Encounters;
- lifecycle state;
- provenance/source context.

The UI should not force a creator to manually fill every field. LOCUS may provisionally infer missing values and ask only high-value questions.

### Journey Thread

The persistent question, problem, purpose, capability, or transformation that gives the Journey coherence across multiple Encounters and learning landscapes.

Example:

> How does water shape the land and life of First Landing?

### Encounter

A bounded learning interaction in which a learner attends to something, acts on it, and produces evidence.

Canonical grammar:

```text
Attend → Act → Evidence
```

An Encounter may occur in the field, at a desk, in a library, through a simulation, with another person, or in a studio. Physical location is optional.

### Capture / Field Note

A learner-created record such as text, photo, voice, sketch, document, or location observation. Captures are not automatically Evidence.

### Evidence

A record that connects learner-produced material or action to a meaningful demonstration of perception, reasoning, understanding, practice, creation, or transfer.

Evidence may reference one or more captures and may later receive human or AI interpretation.

### Learner Instance

A future object representing the manifestation of a canonical Journey presented to a particular learner.

In the first beta:

```text
Learner Instance = Canonical Journey
```

Later:

```text
Learner Instance
= Canonical Journey
+ learner context
+ adaptation policy
+ current evidence/state
```

## 4. Creator entry modes

Different creator workflows must converge on the same canonical model.

### Start from an idea

Example: “I want to create something at First Landing around how water shapes the landscape.”

### Explore a place

Example: “I am at Lake Tahoe. What could learners investigate here?”

### Turn an observation into an Encounter

Example: photo + location + voice note from the field.

### Bring existing material

Upload a lesson plan, PDF, slide deck, worksheet, syllabus, field guide, or notes. LOCUS extracts instructional intent and proposes a Journey/Encounter structure.

### Direct/manual authoring

Experienced creators may edit Journey and Encounter fields directly without using AI.

## 5. AI Creator Intelligence

AI is an educational collaborator, not an autonomous publisher.

Initial capability:

```text
Creator seed
→ DraftJourneyProposal
→ creator review
→ canonical Journey
```

Future bounded capabilities attach to the same spine:

- improve a Journey Thread;
- generate an Encounter draft;
- critique an Encounter;
- transform a PDF or lesson plan;
- suggest evidence expectations;
- recommend scaffolds;
- research a place;
- identify missing synthesis or transfer;
- map concepts or standards;
- personalize a learner instance;
- interpret Evidence.

Important AI actions should return typed proposals and preserve provenance rather than mutating canonical content invisibly.

## 6. Beta creator golden path

A creator can:

1. Open **My Journeys**.
2. Select **Create Journey**.
3. Describe an idea in natural language or choose another entry mode.
4. Receive a structured Journey proposal.
5. Accept or edit the title, Journey Thread, learner context, and suggested Encounters.
6. Save a draft.
7. Add, edit, remove, and reorder Encounters.
8. Preview the Journey as a learner.
9. Publish a private test Journey.
10. Share it with a trusted learner or beta collaborator.
11. Review learner captures/Evidence.
12. Revise and publish a new version.

The first implementation milestone may stop after steps 1–8 plus local evidence capture; private sharing is a later beta increment.

## 7. First implementation milestone

The Creator Loop v0.2 is successful when Peter can:

1. create a new Journey without using the First Landing hard-coded slug;
2. describe a Journey seed;
3. receive or construct a structured draft;
4. save the Journey;
5. create/edit one Encounter;
6. preview that Encounter in learner mode;
7. submit a learner capture;
8. preserve that capture as data that can support Evidence;
9. return to the Creator view without losing the Journey state.

## 8. Migration strategy

Do not rewrite the existing prototype from zero.

### Reuse

- Next.js / TypeScript / Tailwind application;
- Supabase authentication and RLS foundation;
- repository-adapter pattern;
- journey versioning;
- audit events;
- learner capture / Field Notes infrastructure;
- safety and accessibility fields;
- artifact and resurfacing concepts.

### Generalize

- `Journey` toward Journey Thread and optional context;
- `JourneyStop` into the more general `Encounter` primitive;
- Creator Library into real multi-Journey creation;
- learner stop rendering into generic Encounter rendering;
- repository and API methods away from the single `water-writes-the-landscape` slug.

### Add

- first-class Evidence;
- provenance for creator/imported/AI/learner material;
- `DraftJourneyProposal`;
- generic Journey Manifest;
- AI Creator proposal boundary.

### Preserve but defer

- Orchestrator workflows;
- Reviewer workflows;
- cohort administration;
- advanced adaptive branches;
- marketplace/economy;
- AR;
- full Learner Atlas;
- full knowledge graph.

## 9. Reference-journey rule

**Water Writes the Landscape** remains the first reference implementation.

The migration is not complete until its existing canonical content can be represented through the generalized Journey/Encounter contracts.

A second small journey, preferably Tahoe, must then use the same machinery. If a second Journey requires special-case product code, the architecture is not yet general enough.

## 10. LOCUS Core boundary

Journey Studio remains the creator and authored-journey product surface.

LOCUS Core remains the learner-owned adaptive environment for universal input, Pathways, memory, Atlas, capture, and resurfacing.

The products integrate through explicit contracts, beginning with Journey Manifest rather than by merging repositories.

```text
Creator / Journey Studio
→ Journey Manifest
→ LOCUS Core / learner environment
→ learner-specific Journey Instance
→ Capture / Evidence
→ future Atlas and adaptation
```

## 11. Current sprint boundary

### In scope

- canonical Creator Beta documentation;
- generic Journey Manifest v0.1;
- reusable Creator Beta TypeScript contracts;
- compatibility adapters for the existing Journey/JourneyStop/FieldNote model;
- elimination of the single-journey assumption in bounded layers;
- a generic Creator entry flow;
- generic learner preview for at least one Encounter.

### Out of scope

- full educator beta onboarding;
- production document ingestion;
- autonomous AI publishing;
- cohort/orchestrator expansion;
- full adaptive learner instances;
- learner-model inference;
- public marketplace;
- production youth deployment.

## 12. Reconsideration triggers

Reconsider this spine only if implementation evidence shows that:

- Journey and Encounter cannot represent an important intended LOCUS experience without repeated special cases;
- the Journey Studio / LOCUS Core product boundary creates more coupling than it prevents;
- Evidence cannot remain cleanly separated from Capture;
- trusted creators cannot successfully author useful journeys through the model;
- a second reference journey exposes a structural flaw.

Until then, preserve the horizon and build the next complete loop.