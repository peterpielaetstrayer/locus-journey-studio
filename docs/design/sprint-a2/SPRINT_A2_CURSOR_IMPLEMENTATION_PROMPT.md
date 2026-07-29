# LOCUS Sprint A2 — Learner Experience Pass 2
## Cursor Implementation Prompt

You are the lead interaction engineer and digital art director for the existing LOCUS Journey Studio codebase.

The current prototype is functional. Golden Screen 1, **Enter the Landscape**, now establishes the approved quality standard.

Your assignment is to propagate that standard through exactly four learner routes:

```text
/learner
/learner/water-fingerprints
/learner/cypress-knee
/learner/artifact
```

This is a focused experience sprint, not a rewrite.

---

# Required reading

Before editing, read:

```text
AGENTS.md
all .cursor/rules/**
docs/design/golden-screen-1/**
docs/design/sprint-a2/LOCUS_MASTER_SPRINT_TRACKER.md
docs/design/sprint-a2/SPRINT_A2_BRIEF.md
docs/design/sprint-a2/SPRINT_A2_SCREEN_SPECS.md
docs/design/sprint-a2/BROWSER_REVIEW_RUBRIC.md
```

Inspect every image in:

```text
docs/design/sprint-a2/references/
```

Reference priority:

1. Golden Screen 1 implementation in the browser;
2. individual north-star images;
3. Sprint A2 responsive boards;
4. written screen specifications.

Never ship a reference board or full UI mockup as a flattened webpage.

---

# Branch and baseline

Start from the branch containing the completed Golden Screen 1 work, after it has been merged or committed cleanly.

Create:

```bash
git checkout main
git pull origin main
git checkout -b feature/sprint-a2-learner-core
```

Run and record:

```bash
npm ci
npm run test
npm run typecheck
npm run lint
npm run build
```

---

# Existing code to preserve

## Journey Awakening

```text
src/app/learner/page.tsx
src/components/learner/JourneyAwakening.tsx
```

Preserve:

- `saveBaseline`;
- `learnerSessions`;
- `activeLearnerId`;
- `baselineExplanation`;
- `baselineConfidence`;
- route to `/learner/threshold`;
- route/accessibility disclosure.

## Water Fingerprint

```text
src/app/learner/water-fingerprints/page.tsx
src/components/learner/WaterFingerprintCapture.tsx
```

Preserve:

- phases: `capture | followup | success`;
- `addFieldNote`;
- `revealMapStop`;
- `evaluateAdaptation`;
- mentor intervention display;
- `FieldNoteFragment`;
- `CausalThread`;
- `FogRouteMap`;
- route to `/learner/cypress-knee`.

## Cypress-Knee Mystery

```text
src/app/learner/cypress-knee/page.tsx
```

Preserve:

- response modes;
- confidence state;
- adaptive branching;
- `addFieldNote`;
- `revealMapStop`;
- supporting evidence capture;
- route to `/learner/comparison`;
- safety notes.

## Living Atlas

```text
src/app/learner/artifact/page.tsx
src/components/learner/LivingAtlasPage.tsx
```

Preserve:

- artifact persistence;
- title editing;
- unresolved question;
- baseline hypothesis;
- strongest evidence;
- revised explanation;
- systems map;
- learner identity pathways;
- route to `/learner/resurfacing`.

Do not modify:

- Supabase migrations;
- RLS;
- authentication;
- repositories;
- database types;
- Creator;
- Orchestrator;
- Reviewer;
- unrelated learner screens;
- canonical journey structure;
- live AI behavior;
- public account policy.

---

# Shared design standard

All four screens must feel like they belong immediately after Enter the Landscape.

Required qualities:

- place-first;
- quietly cinematic;
- editorial;
- material and collected;
- intelligent but not chatty;
- field-rigorous;
- responsive;
- accessible;
- restrained in color and motion.

Avoid:

- generic SaaS cards;
- repeated rounded panels;
- giant forms;
- numeric gamification;
- confetti;
- neon sci-fi;
- chat bubbles;
- full-screen tutorials;
- generic dashboard composition.

Use the existing:

```text
Geist
Source Serif 4
EnvironmentalScene
Magic Pass CSS tokens
StudioDrawer
PrototypeBanner
Zustand store
deterministic adaptation engine
```

---

# Environmental assets

Expected production paths:

```text
public/images/first-landing/route-awakening.webp
public/images/first-landing/water-fingerprint.webp
public/images/first-landing/cypress-knees.webp
```

Use `next/image`, local assets, focal metadata, correct `sizes`, and graceful fallbacks.

If a production asset is absent:

- preserve SVG and gradient fallback;
- complete the composition;
- document the missing asset;
- do not claim visual parity.

For the Living Atlas:

- use learner-captured media when supported;
- otherwise use the most relevant First Landing evidence asset;
- do not use `shorelineTransfer` as the default primary artifact image.

Do not change the data schema solely to support this visual fallback.

---

# Screen 1 — Journey Awakening

Transform `/learner` from a compact overview into a full-viewport invitation.

## Required hierarchy

```text
WATER WRITES THE LANDSCAPE

Find evidence of water
without looking at the water.
```

Show:

- partial route only;
- first two anchors clear;
- later route obscured by fog;
- small Living Atlas preview;
- one primary action;
- optional baseline thought;
- route and accessibility details.

## Baseline behavior

The baseline form should appear as a field sheet, drawer, or unfolded material surface.

Preserve:

```text
Water shapes a place by…
starting thought
confidence
saveBaseline()
```

Use natural-language confidence labels. The numeric values may remain internally.

## Primary action

Use the established expedition-action component or visual language. Do not revert to the generic shared button treatment.

---

# Screen 2 — Water Fingerprint

Transform `/learner/water-fingerprints` into an environmental evidence-capture experience.

## Required primary copy

```text
Find the trace,
not the water.
```

Retain the full semantic prompt for accessibility and supporting copy:

```text
Find evidence of water that is not water itself.
```

## Capture-mode redesign

Replace the primary dropdown experience with accessible field-tool controls:

```text
Photo
Voice
Write
Sketch
```

The selected mode must still update the existing `captureType`.

Do not implement fake camera or microphone recording. Clearly retain simulation disclosure where needed.

## Observation

Reveal the observation input after a capture mode is chosen.

Do not place the full form over the scene from the start.

## Confidence

Represent confidence using language:

```text
tentative
leaning
fairly sure
strongly held
```

Preserve the existing values `1–4`.

## Follow-up

Display one adaptive question only. It should feel like a quiet field annotation, not a mentor-colored dashboard card.

## Success

Required copy:

```text
A fingerprint.

You found water
without photographing water.
```

Show:

- saved Field Note;
- route clearing;
- `water → soil`;
- next action.

Preserve all state behavior.

---

# Screen 3 — Cypress-Knee Mystery

Transform `/learner/cypress-knee` into the defining hypothesis interaction.

## Required hierarchy

```text
These structures are doing something.

What do you think they are doing?
```

## Response modes

Retain:

```text
Speak a theory
Sketch it
Type it
I’m not sure yet
```

Present them as field tools or editorial actions, not four generic cards.

## Theory treatment

After submission, the theory should become a material or translucent annotation over the environmental image.

The learner must be able to distinguish:

- observation;
- theory;
- evidence;
- confidence.

## Adaptive follow-up

Preserve the current exact branching.

Show only one question prominently.

Move the “Deterministic adaptive follow-up · Simulated” disclosure into a subtle but readable secondary line.

## Evidence

The supporting Field Note capture should open deliberately after the question, not crowd the first state.

## Safety

Integrate safety into the field interface. It must remain visible and legible without becoming the main visual focus.

---

# Screen 4 — Living Atlas

Transform `/learner/artifact` and `LivingAtlasPage` into a premium natural-history artifact.

## Assembly state

The title and unresolved-question editing step should feel like preparing an atlas plate, not filling a generic form.

Preserve all fields and validation.

## Artifact spread

Required content:

- learner title;
- learner name;
- First Landing location;
- date and time;
- evidence image;
- original hypothesis;
- strongest evidence;
- revised explanation;
- systems map;
- unresolved question;
- connection to another place;
- identity pathways.

## Material language

Use:

- paper edge;
- center seam;
- restrained map texture;
- evidence photo;
- tape or pin accent;
- annotation line;
- stamp or coordinate detail;
- margin note;
- print-friendly contrast.

Do not use a dashboard grid with beige backgrounds.

## Systems map

Preserve the learner-created systems data.

Improve its composition without changing the data model.

Relationships should be more legible and authored, while remaining accessible through an `aria-label` or text alternative.

## Completion

Required copy:

```text
You did not finish a lesson.

You learned to read one part of the world.
```

Primary action:

```text
Add this page to my Virginia Beach Atlas
```

Keep the resurfacing link.

---

# Responsive behavior

Test first-class compositions at:

```text
1440 × 900
1280 × 800
1024 × 768
430 × 932
390 × 844
375 × 667
```

Do not simply shrink desktop layouts.

Mobile requirements:

- dynamic viewport;
- thumb-reachable actions;
- intentional image crop;
- no tiny metadata;
- no hidden safety controls;
- no browser-chrome collisions;
- atlas may become a vertical sequence while retaining material continuity;
- preserve Studio access.

---

# Motion

Approved:

- route drawing;
- fog clearing;
- field-sheet unfolding;
- evidence pinning;
- theory annotation settling;
- causal connection drawing;
- atlas unfolding;
- subtle atmospheric fades.

Do not add a motion dependency solely for this sprint.

Respect reduced motion:

- final state renders immediately;
- no route-draw dependency;
- no parallax requirement;
- no loss of information.

---

# Accessibility

Required:

- semantic heading order;
- keyboard access;
- visible focus;
- 44px touch targets;
- form labels;
- non-color state;
- meaningful media alt;
- decorative SVG marked `aria-hidden`;
- text alternatives for systems map;
- prototype disclosure preserved;
- simulation disclosure preserved;
- safety and accessibility controls remain discoverable;
- 200% zoom works;
- no focus traps.

---

# Implementation discipline

Prefer focused components, for example:

```text
JourneyAwakeningScreen
BaselineThoughtSheet
EvidenceCaptureSlab
CaptureModeRail
EvidenceQuestion
TheoryFragment
LivingAtlasSpread
AtlasCausalSystem
UnresolvedMarginNote
```

Do not create abstractions that are only renamed divs.

Do not globally restyle unrelated screens.

Keep route pages thin where possible.

---

# Validation

Run:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Manual verification:

- complete four-screen flow;
- refresh persistence;
- baseline save;
- Water Fingerprint phases;
- adaptive follow-up;
- map reveal;
- causal thread;
- Cypress response branches;
- supporting evidence capture;
- artifact assembly;
- artifact persistence;
- resurfacing link;
- Studio access;
- mobile and desktop;
- keyboard only;
- reduced motion;
- missing image fallbacks.

---

# Browser review requirement

Do not stop at implementation.

After the first implementation pass:

1. deploy or run locally;
2. review all four routes using `BROWSER_REVIEW_RUBRIC.md`;
3. record at least three issues per screen;
4. complete one focused refinement pass;
5. rerun validation;
6. update the sprint tracker.

---

# Completion report

Report:

1. files changed;
2. components created;
3. routes transformed;
4. state and adaptation behavior preserved;
5. environmental assets used;
6. missing asset gaps;
7. mobile behavior;
8. motion and reduced-motion behavior;
9. accessibility changes;
10. tests, typecheck, lint, and build;
11. browser-review findings;
12. refinement changes;
13. remaining limitations;
14. whether Sprint A2 meets its definition of done.

Do not claim production readiness.
