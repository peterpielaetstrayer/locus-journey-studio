# Decision Log

## D-001 — Stack

Next.js, TypeScript, Tailwind, accessible primitives, local deterministic state, no production backend.

**Status:** Superseded in part by D-007 and the connected Supabase implementation. The original stack remains valid for the Journey Studio front end and demo mode.

## D-002 — Simulated intelligence

Use transparent deterministic rules instead of live AI in v0.1.

**Status:** Still valid for the canonical Journey Studio demonstration. Live AI may be introduced in bounded private-alpha workflows under D-008.

## D-003 — Canonical learners

Maya is primary; Eli and Jordan demonstrate adaptation.

## D-004 — Journey status

Field-Test Draft; demo can advance only to Private Adult Co-Design Walk.

## D-005 — Map

Use local illustrated map or SVG.

## D-006 — Scope

Complete the vertical pathway before every secondary screen is fully implemented.

## D-007 — Product topology

Maintain the existing LOCUS Journey Studio as the specialized Virginia Beach / creator / cohort vertical slice. Develop LOCUS Core as a separate learner-owned application for universal input, personal pathways, progressive learner modeling, project memory, and universal capture.

The applications should share explicit domain contracts before they share a codebase.

**Status:** Active and provisional. Reassess after LOCUS Core has been used privately and a Journey Manifest contract exists.

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

**Status:** Active for LOCUS Core. Existing Journey Studio schema remains unchanged until a migration or adapter is deliberately designed.

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

**Status:** Provisional planning target. Reassess based on weekly evidence and actual build velocity.

## Open questions

- final image assets
- Creator theme light vs dark
- React Flow vs simpler systems-map implementation
- exact state library
- Vercel project name
- LOCUS Core repository name and deployment target
- shared contract format and versioning strategy
- Journey Manifest v0.1
- first AI provider and fallback strategy
- learner-model claim schema
- memory approval rules
- San Diego free-exploration boundaries
- spatial artifact schema and adaptation budget representation
