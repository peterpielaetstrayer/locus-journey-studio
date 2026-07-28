# Cursor Master Bootstrap and Build Prompt

You are the lead product engineer and design-minded prototyping architect for the first LOCUS vertical slice.

Your assignment is to inspect this repository, understand the product doctrine, plan the implementation, and then build the most complete coherent prototype possible without inventing a different product.

## Mandatory first action

Before changing files:

1. Read:
   - `README.md`
   - `AGENTS.md`
   - all files in `.cursor/rules/`
   - `docs/product/owll-locus-learning-architecture-charter.md`
   - `docs/product/water-writes-the-landscape.md`
   - `docs/product/journey-studio-spec.md`
   - `docs/product/acceptance-criteria.md`
   - `docs/architecture/data-model.md`
   - `docs/architecture/adaptation-engine.md`
   - `docs/design/visual-direction.md`
   - `docs/decisions/decision-log.md`

2. Inspect the current repository state.

3. Produce a concise implementation plan containing:
   - chosen stack and versions
   - route structure
   - component structure
   - state strategy
   - mock-data strategy
   - deterministic adaptation-engine strategy
   - image/map strategy
   - phased order
   - risks or contradictions
   - what will be simulated

4. Do not begin coding until the plan is stated.

After stating the plan, proceed unless a genuine blocking contradiction makes implementation impossible.

## Product objective

Build **LOCUS Journey Studio — Virginia Beach Vertical Slice** around **Water Writes the Landscape** at First Landing State Park.

```text
Creator designs a place-based journey
→ Learner encounters a real place
→ Learner captures evidence
→ LOCUS generates a transparent adaptive follow-up
→ Orchestrator sees the learner and intervenes
→ Learner revises an explanation
→ Learner creates a durable artifact
→ The idea returns later in a new context
```

## Core rules

- Do not build a generic LMS, SaaS dashboard, tourism app, or chatbot.
- Do not treat arrival, clicks, time, or progress bars as mastery.
- Do not give the answer before the learner thinks.
- Keep Learner Field Mode visually quiet.
- Keep all four roles distinct.
- Human mentor override must work.
- Use deterministic local adaptation and label it.
- The current journey is not approved for a public youth program.
- Safety, accessibility, privacy, and quality review must be visible.

## Technical requirements

Use Next.js App Router, strict TypeScript, Tailwind, shadcn/ui or accessible equivalent, Lucide, lightweight persistent state, local mock data, deterministic adaptation, local map/SVG, responsive mobile-first Learner Mode, and desktop/tablet Creator and Orchestrator modes.

No external API keys or production backend.

Add scripts for lint, typecheck, and build.

## Required first vertical pathway

```text
Demo Gateway
→ Journey Overview
→ Learner Invitation
→ Preparation and Baseline
→ Fogged Journey Map
→ Water Fingerprints Field Stop
→ Field Note Capture
→ Deterministic Adaptive Follow-Up
→ Orchestrator Cohort Dashboard
→ Learner Detail
→ Mentor Intervention Composer
→ Intervention visible to Learner
→ Exit Claim
→ Baseline vs Revised Thinking
→ Micro-Landscape Systems Card
→ Idea Returns and Shoreline Transfer
```

## Required compact Creator pathway

Build:

- Journey Library
- overview
- illustrated route with eight stops
- Cypress-Knee Mystery editor
- four adaptive branches
- evidence/artifact contribution
- safety/accessibility
- learner preview for Maya, Eli, Jordan
- review status
- future creator-economy preview labeled nonfunctional

## Reviewer pathway

Show learning, factual/source, safety, accessibility, adult field test, unresolved issues, maintenance, and publication state.

Allow only:

> Approved for Private Adult Co-Design Walk

## Canonical learners

Use exact profiles in specification.

## Deterministic adaptation

Implement and unit test:

1. unsafe request
2. mentor override
3. inactivity
4. high confidence + weak evidence
5. low confidence + strong observation
6. structured learner
7. advanced learner
8. creator fallback

Every recommendation needs a reason.

## State

Persist selected role, active learner, journey progress, Field Notes, confidence, adaptive branch, interventions, systems map, artifact, and resurfacing completion. Provide demo reset.

## UX

Learner: mobile-first, one task, image-led, requested hints, quiet mode, privacy, offline fallback.  
Creator: desktop/tablet, map/editor, contextual preview, not generic dashboard.  
Orchestrator: evidence, reason, override, history.  
Reviewer: explicit and sober.

## Visual

Follow visual direction. Feel cinematic, natural, premium, quietly futuristic, and field-notebook inspired.

## Accessibility

Semantic landmarks, keyboard navigation, visible focus, alt text, reduced motion, no color-only status, map list, ~44px targets, text equivalents.

## Honest behavior

Label simulated AI, mock analytics, future creator economy, and approval status. Do not fabricate GPS, park approval, insurance, live AI, analytics, or production readiness.

## Phases

### Phase 1 — Foundation

Scaffold, strict TypeScript, design tokens, app shell, role switcher, types, mock data, store, persistence, map placeholder, demo reset.

### Phase 2 — Learner loop

Gateway, overview, invitation, preparation, map, Water Fingerprints, Field Note, adaptation, exit claim, comparison, artifact, resurfacing.

### Phase 3 — Orchestrator

Dashboard, learner detail, recommendations, composer, overrides, learner delivery, artifact review.

### Phase 4 — Creator

Library, overview, route, stop editor, branches, evidence/artifact, safety/access, preview, review.

### Phase 5 — Quality

Responsive polish, accessibility, tests, edge states, lint, typecheck, build, acceptance audit.

## Tests

Adaptation engine required. Add practical tests for role switching, reset, Field Note save, mentor override, and persistence where feasible.

## Final report

Report architecture, routes, completed criteria, partial items, omitted items, known issues, commands, tests, lint/typecheck/build, and next five tasks.

Do not claim production readiness.
