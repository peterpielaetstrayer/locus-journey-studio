# LOCUS Project Operating System v0.1

**Owner:** Peter Pielaet-Strayer  
**Status:** Active working system  
**Date:** 2026-07-30  
**Purpose:** Keep LOCUS coherent while moving from vision and prototypes into sustained execution.

---

## 1. Operating principle

> Chats are laboratories. Canonical documents are project memory. Prototypes are evidence. The backlog is commitment.

LOCUS should not attempt to preserve every conversation as doctrine.

The project should convert important discoveries into one of four things:

1. a canonical document update;
2. a recorded decision;
3. a backlog item;
4. a tested prototype change.

If an idea does not yet justify one of those, it remains an exploration rather than an obligation.

---

## 2. Source-of-truth layers

### Layer A — Vision and doctrine

Defines why LOCUS exists and what it must not become.

- `docs/product/owll-locus-learning-architecture-charter.md`
- `docs/product/locus-system-evolution-addendum-v0.2.md`

Change rarely. Add versioned addenda when the system meaningfully evolves.

### Layer B — System architecture and contracts

Defines how the parts relate and what data or behavior they share.

Planned canonical files:

- `docs/architecture/locus-system-map-v0.1.md`
- `docs/architecture/locus-core-contracts-v0.1.md`
- `docs/architecture/journey-manifest-v0.1.md`
- `docs/architecture/learner-model-spec-v0.1.md`
- `docs/architecture/spatial-artifact-spec-v0.1.md`

Change deliberately and version breaking changes.

### Layer C — Product specifications

Defines the behavior of a particular product or vertical slice.

Existing:

- `docs/product/journey-studio-spec.md`
- `docs/product/water-writes-the-landscape.md`
- `docs/product/acceptance-criteria.md`

Planned:

- `docs/product/locus-core-alpha-spec-v0.1.md`
- `docs/product/free-exploration-spec-v0.1.md`
- `docs/product/creator-field-mode-spec-v0.1.md`

### Layer D — Decisions, risks, and evidence

- `docs/decisions/decision-log.md`
- planned `docs/decisions/assumption-risk-register.md`
- planned `docs/research/evidence-index.md`
- planned `docs/evaluation/locus-evaluation-plan-v0.1.md`

### Layer E — Execution

- roadmap and milestones;
- active sprint;
- backlog;
- release notes;
- retrospective.

These should change frequently.

---

## 3. Document status vocabulary

Every canonical document should use one of these statuses:

- **Exploratory:** useful thinking, not binding;
- **Proposed:** specific enough for review;
- **Active:** current source of truth;
- **Superseded:** preserved for history but no longer governing;
- **Archived:** no longer relevant to active development.

Every document should state:

- owner;
- status;
- version;
- date updated;
- what it governs;
- what it supersedes;
- open questions;
- related decisions and prototypes.

---

## 4. Decision discipline

Record a decision when it changes:

- product topology;
- data contracts;
- learner experience;
- safety or privacy behavior;
- architecture;
- major scope;
- milestone targets;
- what is being deliberately postponed.

A decision entry should contain:

```text
Decision
Why
Alternatives considered
Status: locked / active-provisional / exploratory
What it changes
What would cause reconsideration
Related documents and code
```

Do not silently resolve conflicts in code or AI-generated plans.

---

## 5. The AI context pack

Future AI sessions should not receive every project file by default.

Use a compact context pack selected for the task.

### Default LOCUS strategy context

1. Learning Architecture Charter
2. System Evolution Addendum
3. System Map
4. Decision Log
5. Current Roadmap / Sprint

### LOCUS Core implementation context

1. LOCUS Core Alpha Specification
2. Core Contracts
3. Learner Model Specification
4. AI Behavior and Safety Specification
5. Current Sprint and relevant repository files

### Journey Studio implementation context

1. Acceptance Criteria
2. Journey Studio Specification
3. Water Writes the Landscape
4. relevant Journey Studio decisions
5. current code and tests

### Spatial authoring context

1. System Evolution Addendum
2. Spatial Artifact Specification
3. Journey Manifest
4. Creator Field Mode Specification
5. relevant safety and review decisions

The AI should always be told which documents are authoritative and which are exploratory.

---

## 6. Project areas

Maintain a small set of persistent workstreams.

### A. LOCUS Core

Main learner-owned surface, universal input, personal pathways, learner memory, Capture Inbox, Atlas, resurfacing, and project support.

### B. Journey Studio / Virginia Beach

Specialized place-based authoring, learner experience, cohort adaptation, mentor orchestration, artifacts, and review.

### C. Spatial and field research

Free Exploration, Creator Field Mode, maps, camera workflows, spatial artifacts, phone AR, and future glasses interfaces.

### D. Learning architecture and AI behavior

Pathway logic, educational judgment, learner modeling, memory, retrieval, adaptation, provenance, privacy, and evaluations.

### E. Pilots and creator development

Virginia Beach, San Diego, personal use, trusted educator access, creator onboarding, and field testing.

Each active backlog item must belong to one workstream.

---

## 7. Milestone plan

### Milestone 0 — Consolidation and setup

**Target:** early August 2026

Complete:

- System Evolution Addendum;
- updated Decision Log;
- Project Operating System;
- System Map;
- LOCUS Core Contracts;
- LOCUS Core Alpha Specification;
- create LOCUS Core repository;
- define one active backlog and one current sprint.

### Milestone 1 — Personal LOCUS loop

**Target:** mid-to-late August 2026

Prove:

```text
Touch / type
→ interpret intention
→ immediate next action
→ create or update pathway
→ capture evidence or reflection
→ remember
→ resurface
```

Use real pathways:

- Psychology for Human Development;
- Philosophy Reconstruction;
- LOCUS Product Development.

### Milestone 2 — San Diego field alpha

**Target:** September 2026

Prove on phone:

- rapid voice and image capture;
- optional location context;
- Free Exploration session;
- AI-proposed learning opportunities;
- private creator field drafts;
- connection to personal pathways;
- daily reflection and resurfacing;
- clear privacy and presence controls.

This is a private alpha for Peter, not a public creator platform.

### Milestone 3 — Creator alpha

**Target:** October–November 2026

Prove:

- conversational journey concept creation;
- map-based nodes;
- field authoring;
- shared anchors and personalized edges;
- Journey Manifest v0.1;
- import or handoff between Journey Studio and LOCUS Core;
- artifact maturity and provenance;
- creator preview and field-test status.

### Milestone 4 — Trusted educator pilot

**Target:** December 2026 stretch

Prove:

- invitation access for a small number of trusted creators;
- creator onboarding;
- one journey created or adapted by someone other than Peter;
- controlled learner testing;
- structured feedback;
- privacy, safety, and review boundaries;
- limited spatial preview or phone AR where useful.

The December goal is not the completed LOCUS vision. It is a coherent private creator alpha that demonstrates the system's genetic code.

---

## 8. Sprint operating rhythm

Use one-week sprints initially because AI-assisted build velocity and uncertainty are both high.

### Monday or sprint start

- select one milestone outcome;
- choose no more than three sprint outcomes;
- define acceptance criteria;
- identify documents and code in scope;
- identify what is explicitly out of scope.

### During the sprint

- keep one active task at a time where possible;
- commit small coherent changes;
- record architectural or product decisions immediately;
- use AI for bounded tasks with explicit context;
- test the real learner experience rather than only reviewing screens.

### End of sprint

Record:

- what shipped;
- what was actually tested;
- what was learned;
- what changed in the vision or assumptions;
- what remains blocked;
- whether the milestone forecast changed.

Do not carry every unfinished item automatically into the next sprint.

---

## 9. Definition of done

A feature is not done because code exists.

For prototype work, done means:

- the experience can be used end-to-end;
- important states are understandable;
- persistence behaves honestly;
- simulated and live intelligence are clearly distinguished;
- the relevant acceptance criteria pass;
- basic mobile and accessibility behavior is checked;
- the decision log and specification are updated if behavior changed;
- the result has been tested with real content rather than placeholders;
- a release note or sprint record captures what changed.

---

## 10. Documentation triggers

Create or update a canonical document only when one of these triggers occurs:

- a recurring ambiguity is slowing implementation;
- two products need a shared contract;
- an AI session repeatedly needs the same context;
- a safety, privacy, or learner-model rule must be explicit;
- a prototype is ready for acceptance criteria;
- a major decision supersedes a prior assumption;
- another creator or engineer needs to work independently.

Avoid creating documents merely because a category exists.

---

## 11. Visual assets worth maintaining

Visuals should clarify architecture, experience, or execution—not merely market the idea.

Priority visuals:

1. **LOCUS System Map** — Core, Journey Studio, learner model, Field Notes, Atlas, Creator, Mentor, spatial layer.
2. **One-Touch Interaction Spine** — Touch → Express → Interpret → Act → Structure → Remember → Adapt.
3. **Stable Bones / Adaptive Skin** — stable system primitives versus personalized surfaces.
4. **Pathway–Journey–Artifact Model** — how personal pathways, authored journeys, captures, and artifacts relate.
5. **Spatial Artifact Anatomy** — semantic core, creator intent, spatial binding, adaptation policy, renderings, provenance.
6. **Current / September / December / Horizon** — honest capability progression.
7. **Virginia Beach to Tahoe Adaptation** — preserved learning core with different environmental binding.
8. **Creator Field Mode** — See → Point → Speak → Interpret → Shape → Test → Publish.

Each visual should link back to the canonical document it explains.

---

## 12. Immediate build gate

Do not begin broad LOCUS Core implementation until these three documents exist:

1. LOCUS System Map v0.1;
2. LOCUS Core Contracts v0.1;
3. LOCUS Core Alpha Specification v0.1.

These should be concise and implementation-oriented.

Once complete, create the LOCUS Core repository and begin the first personal loop immediately.

---

## 13. First active sprint recommendation

### Sprint goal

Establish the minimum architecture and interface definition required to build a personal LOCUS alpha without contaminating Journey Studio.

### Outcomes

1. Create LOCUS System Map v0.1.
2. Create LOCUS Core Contracts v0.1.
3. Create LOCUS Core Alpha Specification v0.1 with screen flow and acceptance criteria.

### Out of scope

- production AR;
- creator marketplace;
- public educator access;
- automatic cross-location publishing;
- full knowledge graph;
- custom foundation model;
- merging Journey Studio and LOCUS Core.

### Exit condition

A coding agent can read the three documents and propose a bounded implementation plan for LOCUS Core without requiring access to the full chat history.

---

## 14. Closing rule

The project should remain ambitious in vision and narrow in active execution.

> Preserve the horizon. Build the next complete loop. Let evidence determine the next layer.
