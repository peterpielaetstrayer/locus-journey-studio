# AGENTS.md — LOCUS Journey Studio / Creator Beta

## Mission

Build the smallest reusable LOCUS Creator product that proves a creator can turn knowledge, curiosity, existing curriculum, or a real-world observation into a coherent learning Journey; a learner can experience its Encounters and capture evidence; and the same architecture can support First Landing, Tahoe, and future journeys without special-case product code.

The historical First Landing prototype remains valuable reference implementation and is preserved on `archive/first-landing-v0.1`.

## Read before changing code

For work on `creator-beta-v0.2`, inspect in this order:

1. `docs/product/creator-beta-product-spine-v0.2.md`
2. `docs/architecture/journey-manifest-v0.1.md`
3. `docs/decisions/decision-log.md`
4. `docs/product/locus-system-evolution-addendum-v0.2.md`
5. `docs/product/owll-locus-learning-architecture-charter.md`
6. `docs/product/journey-studio-spec.md`
7. `docs/product/water-writes-the-landscape.md`
8. relevant `.cursor/rules/`

The older Journey Studio specification and acceptance criteria remain authoritative for preserved First Landing behavior, but they do not override Creator Beta decisions that deliberately generalize the product beyond one canonical journey.

## Current product spine

```text
Creator intent
→ AI-assisted structuring
→ Journey
→ Encounter
→ learner experience
→ learner capture
→ Evidence
→ future interpretation / adaptation
```

Core design laws:

- **AI-assisted, not AI-required.**
- **Freedom at the surface. Structure underneath. Intelligence in between.**
- AI returns proposals before durable curriculum writes.
- Creator authority and provenance are preserved.
- A Journey is an authored learning arc held together by a Journey Thread.
- An Encounter follows the learning grammar **Attend → Act → Evidence**.
- An Encounter is not necessarily a physical stop.
- Field Notes / captures are not automatically Evidence.
- Evidence is not automatically mastery.
- First Landing is a reference Journey, not the application architecture.
- A second Journey must work through the same machinery before the architecture is considered general.

## Non-negotiable product distinctions

- **OWLL** is the research, learning-design, and experimentation house.
- **LOCUS** is the persistent learning operating system.
- **Journey Studio / Creator Beta** is the creator and authored-journey surface.
- **LOCUS Core** is the learner-owned adaptive surface for universal input, Pathways, memory, Atlas, capture, and resurfacing.
- **Field Notes / Capture** records learner-created material.
- **Evidence** connects learner-produced material or action to a meaningful demonstration; it remains distinct from mastery claims.
- **Creator** authors reusable Journey architecture.
- **Orchestrator** supports an instantiated Journey for actual learners. Preserve the distinction even while Orchestrator expansion is deferred.
- AI supports attention, inquiry, evidence, reflection, design, and adaptation. It does not replace learner thinking, creator authority, or human safeguarding judgment.

## Active migration objective

Generalize the existing Journey Studio without throwing away its infrastructure.

### Reuse

- Next.js / TypeScript / Tailwind foundation
- Supabase authentication and RLS
- repository-adapter pattern
- versioned Journey drafts
- audit events
- Field Notes infrastructure
- safety/accessibility fields
- artifacts and resurfacing concepts

### Generalize

- legacy `Journey` into the Creator Beta Journey contract
- legacy `JourneyStop` into the general Encounter contract
- Creator Library into real multi-Journey creation
- hard-coded slug/API assumptions into generic Journey operations
- learner stop screens into generic Encounter rendering

### Add

- Journey Manifest
- provenance
- first-class Evidence
- DraftJourneyProposal
- AI Creator proposal boundary

### Preserve but defer

- Orchestrator expansion
- Reviewer expansion
- cohort administration
- advanced adaptation
- marketplace
- AR
- full Learner Atlas
- full knowledge graph

## Reference Journey migration

`Water Writes the Landscape` must remain intact as content while becoming data rendered through generic Journey/Encounter machinery.

Migration mapping:

```text
Journey.centralQuestion        → Journey.thread.statement
Journey.audience               → Journey.learnerContext.description
Journey.stopIds                → Journey.encounterIds
JourneyStop                    → Encounter
JourneyStop.locationLabel      → Encounter.target.label
JourneyStop.purpose            → Encounter.creatorIntent
JourneyStop.openingPrompt      → Encounter.learnerPrompt
JourneyStop.fieldAction        → Encounter.learnerAction
FieldNote                      → LearnerCapture + optional Evidence support
```

The database may keep `journey_stops` temporarily if renaming storage would create unnecessary migration risk.

## Engineering behavior

Before implementing a significant feature:

1. Inspect relevant source files and governing specifications.
2. State the bounded behavior being changed.
3. Preserve existing First Landing behavior unless the task explicitly migrates it.
4. Prefer compatibility adapters before destructive rewrites.
5. Build the smallest coherent implementation that advances the Creator → Journey → Encounter → Learner → Evidence loop.
6. Run unit tests, type checking, linting, and production build when the execution environment permits.
7. Report incomplete, simulated, or unvalidated behavior honestly.
8. Do not rewrite unrelated files.
9. Avoid large opaque abstractions before repetition justifies them.
10. Do not add one-off Tahoe or Virginia conditionals to prove generality; improve the generic contract instead.

## Git behavior

- Do not force-push.
- Do not rewrite history.
- Do not commit secrets.
- Keep `main` deployable and untouched during the Creator Beta migration until reviewed.
- `archive/first-landing-v0.1` is the preserved historical prototype.
- Active migration work belongs on `creator-beta-v0.2` or bounded feature branches derived from it.
- Keep changes reviewable and intentional.
- Never allow multiple agents to modify the same branch simultaneously without coordination.

## UX behavior

### Creator

- Creation should begin fluidly: conversation, source material, field capture, or direct editing may all be valid entry modes.
- Do not force curriculum-design jargon or a long mandatory form before a creator can begin.
- Show AI suggestions as proposals that can be accepted, edited, or rejected.
- Preserve provenance and make it possible to explain why generated material exists.
- Creator mode can be information-rich but must remain understandable to a non-learning-designer.

### Learner

- Learner field mode is minimal and attention-preserving.
- One meaningful task per field screen where possible.
- Do not reward mere arrival or screen opening as learning.
- Technology should help the learner notice more while gradually requiring fewer overlays.

### Orchestrator / Reviewer

- Preserve existing functionality where practical.
- Do not expand these surfaces until the Creator Beta spine is working unless a blocking safety requirement demands it.

## AI behavior

The historical v0.1 journey may continue to use transparent deterministic adaptation.

Creator Beta may introduce live AI only through bounded structured outputs such as `DraftJourneyProposal` or other typed proposals. AI must not silently publish, rewrite canonical Journey content, or fabricate source provenance.

Useful Creator AI functions may include:

- shape a Journey Thread;
- propose Encounters;
- critique Journey coherence;
- suggest evidence expectations or scaffolds;
- transform imported curriculum;
- research a place with source grounding;
- identify missing synthesis or transfer.

## Learning integrity

Do not:

- give the learner the answer before they think when inquiry is intended;
- replace learner work with polished AI prose;
- treat completion as mastery;
- fabricate species identification or factual certainty;
- collapse learner capture directly into learner-model truth;
- diagnose disability or mental health conditions;
- use learner service data as research data without separate consent.

## Safety and trust

The interface must not imply that LOCUS replaces:

- park rules
- required permits
- trained supervision
- emergency judgment
- accessibility planning
- safeguarding processes

Prototype / test publication states must remain explicit, especially for youth-facing journeys.

## Definition of done

A Creator Beta feature is not done until:

- its primary interaction works;
- its empty/error state is considered;
- mobile behavior is usable where relevant;
- keyboard access is possible where applicable;
- data is represented through the generic contracts rather than a new hard-coded journey assumption;
- state/persistence behavior is honest;
- provenance is preserved when AI/imported material becomes durable;
- relevant tests exist;
- available validation gates pass;
- documentation/decisions are updated when architecture meaning changes.

The current migration milestone is not complete until First Landing can be represented through the generic Journey Manifest and a second small Journey can use the same product machinery.