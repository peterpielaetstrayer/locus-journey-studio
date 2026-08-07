# Decision Log

## D-001 — Stack

Next.js, TypeScript, Tailwind, accessible primitives, local deterministic state, no production backend.

**Status:** Superseded in part by D-007 and the connected Supabase implementation. The original stack remains valid for the Journey Studio front end and demo mode.

## D-002 — Simulated intelligence

Use transparent deterministic rules instead of live AI in v0.1.

**Status:** Still valid for the canonical Journey Studio demonstration. Live AI may be introduced in bounded private-alpha workflows under D-008 and Creator Beta under D-016.

## D-003 — Canonical learners

Maya is primary; Eli and Jordan demonstrate adaptation.

## D-004 — Journey status

Field-Test Draft; demo can advance only to Private Adult Co-Design Walk.

## D-005 — Map

Use local illustrated map or SVG.

## D-006 — Scope

Complete the vertical pathway before every secondary screen is fully implemented.

## D-007 — Product topology

Maintain LOCUS Journey Studio as the creator/authored-journey application. Develop LOCUS Core as a separate learner-owned application for universal input, personal pathways, progressive learner modeling, project memory, and universal capture.

The applications should share explicit domain contracts before they share a codebase.

**Status:** Active and provisional. D-016 generalizes Journey Studio beyond the single Virginia Beach vertical slice while preserving the Journey Studio / LOCUS Core boundary.

## D-008 — Universal input and live AI

The primary LOCUS interaction is a universal multimodal input rather than a conventional dashboard or generic chat page.

Canonical spine:

```text
Touch → Express → Interpret → Act → Structure → Remember → Adapt
```

LOCUS Core may use live AI in a bounded private alpha, provided important actions use structured schemas, application validation, transparent memory updates, and learner approval where appropriate.

**Status:** Active.

## D-009 — Stable bones and adaptive skin

LOCUS should preserve stable system areas while allowing visual, modal, cognitive, and contextual personalization.

Likely stable areas:

- universal input
- Home
- Pathways / Journeys
- Field Notes / Capture Inbox
- Atlas
- Learning Profile
- privacy, memory, and presence controls

**Status:** Active design law; exact navigation remains exploratory.

## D-010 — Field Notes as universal capture

Field Notes remains a focused and independently useful loop, but should become a universal LOCUS capture primitive. A Field Note should not always require a journey, cohort, enrollment, or predefined stop.

**Status:** Active. D-016 additionally establishes that Capture / Field Note is distinct from Evidence.

## D-011 — Phone first, glasses ready

Build with current phones and responsive web now while preserving future spatial and glasses interfaces in the data contracts and interaction grammar.

Do not wait for ideal AR hardware. Do not let phone-first implementation erase the spatial horizon.

**Status:** Active.

## D-012 — Spatial artifact maturity ladder

Spatial and learning artifacts must expose maturity and provenance so AI suggestions, personal captures, drafts, field-tested work, reviewed adaptations, published artifacts, and canonical journey components do not appear equally authoritative.

```text
Ephemeral suggestion
→ Personal capture
→ Draft artifact
→ Field-tested artifact
→ Reviewed adaptation
→ Published artifact
→ Canonical journey component
```

**Status:** Active architecture requirement.

## D-013 — Cross-place adaptation

LOCUS may propose adapting the semantic core of a learning artifact from one environment to another, such as Virginia Beach to Tahoe.

Cross-place adaptations should begin as private drafts and preserve creator-defined adaptation budgets, provenance, and review requirements. They should not be automatically published.

**Status:** Active long-horizon design decision; implementation deferred.

## D-014 — Shared anchors and personalized edges

Cohort experiences should preserve shared encounters, questions, and collaborative artifacts while allowing LOCUS to personalize modality, scaffolding, challenge, examples, and optional discoveries.

> Shared anchors preserve the cohort. Personalized edges deepen the learner.

**Status:** Active design law.

## D-015 — September and December execution targets

September 2026 target: private LOCUS Core alpha usable for psychology, philosophy, LOCUS project memory, universal capture, early San Diego free exploration, and phone-based creator field drafts.

December 2026 stretch target: private creator alpha with stronger learner memory, grounded retrieval, map-based authoring, Journey Manifest import/export, controlled local adaptation drafts, and limited spatial preview or phone AR.

The completed LOCUS vision is not the December target.

**Status:** Provisional planning target. Reassess based on weekly evidence and actual build velocity. Creator Beta development is being pulled forward under D-016 without declaring the broader December target complete.

## D-016 — Creator Beta product spine and migration

**Decision**

Generalize `locus-journey-studio` into the reusable LOCUS Creator / authored-Journey product rather than continuing to treat the Virginia Beach experience as the application architecture or creating a third repository.

The product spine is:

```text
Creator intent
→ AI-assisted structuring
→ Journey
→ Encounter
→ learner experience
→ learner Capture
→ Evidence
→ future interpretation / adaptation
```

Canonical design laws:

- **AI-assisted, not AI-required.**
- **Freedom at the surface. Structure underneath. Intelligence in between.**
- AI produces typed proposals before canonical curriculum writes.
- Creator authority and provenance are preserved.
- Journey is an authored learning arc organized by a persistent Journey Thread.
- Encounter is a bounded learning interaction following **Attend → Act → Evidence** and is not limited to physical stops.
- Capture / Field Note is distinct from Evidence.
- Evidence is distinct from mastery or learner-model truth.
- First Landing becomes the reference Journey rendered through generic machinery.
- A second small Journey, preferably Tahoe, must prove the architecture does not depend on First Landing special cases.

**Why**

The existing Journey Studio already contains valuable reusable infrastructure: versioned Journey persistence, Supabase auth/RLS, repository adapters, audit events, Field Notes, artifacts, safety/accessibility, and learner rendering. The main architectural debt is hard-coded single-Journey assumptions at the UI/API/adapter layer. Generalizing those layers has higher ROI and lower risk than discarding the implementation.

The Creator Beta also provides a more direct path to trusted beta creators who are not trained learning designers: creators can begin with an idea, a place, an observation, existing lesson material, or direct/manual authoring while AI helps translate their intent into structured Journey/Encounter objects.

**Alternatives considered**

1. Continue polishing the static First Landing prototype — rejected as too narrow.
2. Pivot `locus-core` into Creator Studio — rejected because Core has a distinct learner-owned role.
3. Create a third repository — deferred; unnecessary duplication while existing Journey Studio infrastructure remains useful.
4. Rewrite Journey Studio from zero — rejected unless migration evidence later proves the existing infrastructure structurally incompatible.

**Repository preservation**

- `main` remains the known working pre-migration prototype until review.
- `archive/first-landing-v0.1` preserves the exact pre-migration historical state.
- `creator-beta-v0.2` is the active migration branch.

**Canonical artifacts**

- `docs/product/creator-beta-product-spine-v0.2.md`
- `docs/architecture/journey-manifest-v0.1.md`
- `src/types/creator-beta.ts`
- compatibility adapters under `src/lib/creator-beta/`

**Status:** Active-provisional. Treat as governing for `creator-beta-v0.2`.

**Reconsider if**

- a second Journey repeatedly requires special-case architecture;
- Encounter cannot represent important non-field learning interactions cleanly;
- the Journey Studio / LOCUS Core boundary creates material duplication or coupling;
- existing persistence infrastructure makes generic Journey creation materially harder than a clean rebuild;
- trusted creator testing shows that the proposed Creator interaction model does not enable independent creation.

## Open questions

- final image assets
- Creator theme light vs dark
- React Flow vs simpler systems-map implementation
- exact state library as Creator Beta state expands
- Vercel project/preview strategy for `creator-beta-v0.2`
- first AI provider and fallback strategy for Creator proposals
- exact schema and UX for document/PDF curriculum import
- when to migrate database naming from `journey_stops` to Encounters versus preserving an adapter
- Journey Manifest import/export versioning between Journey Studio and LOCUS Core
- learner-model claim schema
- memory approval rules
- San Diego free-exploration boundaries
- spatial artifact schema and adaptation budget representation
- minimum trusted-creator beta onboarding and private-sharing requirements
