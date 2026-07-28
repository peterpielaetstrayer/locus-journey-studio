# LOCUS Magic Pass — Cursor Implementation Prompt

You are the lead interaction engineer and digital art director for the existing LOCUS Journey Studio codebase.

The application is structurally functional. It has working routes, state, adaptation logic, Creator/Orchestrator/Reviewer modes, artifacts, backend architecture, tests, and accessibility foundations.

Your assignment is **not** to rebuild the application or add broad new features.

Your assignment is to transform the learner-facing vertical slice from a competent product demonstration into a place-first, emotionally resonant learning experience.

---

## Mandatory first actions

Before editing:

1. Read:
   - `AGENTS.md`
   - all `.cursor/rules/`
   - `docs/product/water-writes-the-landscape.md`
   - `docs/product/journey-studio-spec.md`
   - `docs/design/visual-direction.md`
   - the new `LOCUS_MAGIC_PASS_EXPERIENCE_DIRECTION.md`
2. Inspect the current implementation of:
   - `src/app/page.tsx`
   - `src/app/learner/**`
   - `src/components/learner/**`
   - `src/app/globals.css`
   - shared navigation and layout components
   - canonical journey data
   - Zustand demo store
3. Run the baseline:
   - `npm run test`
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`
4. State a concise implementation plan.
5. Preserve all working routes, backend code, state, and tests.
6. Work on a new branch:

```bash
git checkout main
git pull origin main
git checkout -b feature/magic-pass
```

Do not modify Supabase migrations, RLS, authentication, repository interfaces, or backend behavior in this pass.

---

# Experience objective

The current prototype explains LOCUS.

The Magic Pass should let a person **enter LOCUS**.

The learner should feel:

- the landscape is withholding something;
- their observation reveals a hidden layer;
- their theory matters but must be tested;
- quiet attention changes what they can perceive;
- their evidence becomes a durable model of the world.

The product must remain restrained, accessible, and honest.

---

# Core design rules

- Reality comes first.
- Mystery comes before explanation.
- The landscape is the interface.
- AI speaks only when it adds something.
- Quiet is an intentional product state.
- Learner-authored evidence is the reward.
- Do not use confetti, streaks, leaderboards, or shallow badges.
- Do not turn the redesign into neon AR or generic sci-fi.
- Do not obscure safety or accessibility controls.
- Do not remove reduced-motion support.

---

# Priority 1 — Replace the public gateway

Transform `/` from a four-card software gateway into a cinematic First Landing entrance.

## Required composition

- full viewport environmental media;
- local image architecture using Next Image;
- dark legibility gradient;
- minimal LOCUS mark;
- location and time;
- restrained primary copy;
- one main learner action;
- quiet Studio access control.

## Required copy

```text
FIRST LANDING
7:18 AM

The water looks still.

It isn’t.
```

Primary action:

> Enter the landscape

Secondary action:

> Open Journey Studio

The Studio control should reveal links to Creator, Orchestrator, and Reviewer modes without making those modes the emotional center of the page.

Do not remove access to those modes.

---

# Priority 2 — Journey awakening

Transform `/learner` into a cinematic journey invitation rather than a conventional overview.

Required copy:

```text
WATER WRITES THE LANDSCAPE

Find evidence of water
without looking at the water.
```

Show:

- only the beginning of the route;
- atmospheric fog over later stops;
- a small preview of the Living Atlas artifact;
- baseline response capture;
- Begin walking action;
- route/accessibility information.

The route should feel discovered rather than fully disclosed.

---

# Priority 3 — Environmental media system

Create a reusable local media architecture.

Suggested structure:

```text
public/
└── images/
    └── first-landing/
        ├── entrance.webp
        ├── route-awakening.webp
        ├── water-fingerprint.webp
        ├── cypress-knees.webp
        ├── hidden-flow.webp
        ├── systems-overlook.webp
        └── shoreline-transfer.webp
```

If final licensed images are not yet available:

- provide intentional, clearly documented placeholder images or development assets;
- do not hotlink arbitrary remote images;
- centralize image metadata in one file;
- include descriptive alt text;
- include focal-position metadata for responsive cropping;
- design graceful fallbacks.

Create a reusable `EnvironmentalScene` component supporting:

- image;
- optional subtle parallax;
- legibility overlay;
- content alignment;
- location/time metadata;
- reduced-motion behavior;
- optional ambient-sound control, off by default.

---

# Priority 4 — Water Fingerprint experience

Transform `/learner/water-fingerprints` into an evidence-capture moment.

## Required prompt

> Find evidence of water that is not water itself.

## Interaction

1. Environmental scene dominates.
2. Capture control is prominent.
3. Learner records an observation.
4. Deterministic adaptation asks one evidence question.
5. Successful capture becomes a tactile Field Note.
6. One section of the map clears.
7. A causal thread seed appears: `water → soil`.

## Success copy

```text
A fingerprint.

You found water
without photographing water.
```

Use the existing Field Note data and state. Do not rewrite the adaptation engine.

---

# Priority 5 — Cypress-Knee Mystery

Transform `/learner/cypress-knee` into the defining hypothesis experience.

## Required copy

```text
These structures are doing something.

What do you think they are doing?
```

Support existing response modes and adaptive branches.

Represent learner theories as field annotations, note fragments, or a voice waveform rather than a generic quiz card.

When confidence is high and evidence is weak, show only:

> What would you need to observe before trusting that explanation?

Do not reveal a definitive scientific answer during this interaction.

Keep the safety boundary visible but visually integrated.

---

# Priority 6 — Hidden Flow quiet state

Transform `/learner/hidden-flow` into the quietest interaction in the application.

## Required copy

```text
For two minutes,
stop trying to move forward.
```

Learner chooses:

- Listen
- Watch one small area
- Sit in silence

During the quiet interval:

- fade most interface chrome;
- retain accessible exit and safety controls;
- avoid a visually loud countdown;
- support reduced motion;
- do not autoplay sound;
- optionally display a subtle environmental waveform or breathing light.

Return prompt:

> What became visible when you stopped searching?

---

# Priority 7 — Systems revelation

Transform the systems-map completion moment into an evidence-driven reveal.

The learner’s own observations should appear as the source of the causal structure.

Animate or progressively assemble:

```text
rain
  ↓
water level
  ↓
soil saturation
  ↓
plant distribution
  ↓
habitat
  ↓
where humans can walk
```

The learner should realize that the route and boardwalk were part of the system.

Motion should explain relationships, not decorate.

Preserve the existing editable systems-map functionality.

---

# Priority 8 — Living Atlas artifact

Redesign `/learner/artifact` into a premium natural-history atlas page.

Required content:

- learner-created title;
- selected photograph or sketch;
- location and time;
- original hypothesis;
- strongest evidence;
- revised explanation;
- systems map;
- unresolved question;
- connection to another place;
- identity pathway marker.

Required completion copy:

```text
You did not finish a lesson.

You learned to read one part of the world.
```

Primary action:

> Add this page to my Virginia Beach Atlas

The artifact should feel printable and durable, not like a social badge.

---

# Priority 9 — Navigation and Studio access

## Public entrance

The learner path is primary.

## Studio

Create a restrained Studio drawer/menu providing:

- Creator Studio
- Orchestrator View
- Reviewer View
- Journey Overview
- Reset Demo

Do not remove role switching from internal screens.

## Learner field mode

Reduce persistent chrome.

Keep accessible access to:

- map;
- capture;
- guide/help;
- route and safety;
- Studio exit where appropriate.

Do not use a desktop admin sidebar in learner field mode.

---

# Priority 10 — Reusable components

Create focused primitives such as:

```text
EnvironmentalScene
JourneyAwakening
FogRouteMap
FieldNoteFragment
EvidenceReveal
QuietAttentionMode
CausalThread
LivingAtlasPage
StudioDrawer
LocationStamp
```

Do not over-abstract. Components should exist because they carry the new experience language.

---

# Visual system

Refine, do not discard, the existing tokens.

Add support for:

- deeper environmental blacks;
- wetland green and water-blue tonal variation;
- parchment artifact surface;
- atmospheric fog;
- field-note paper;
- map ink;
- quiet amber for unresolved questions.

Use CSS variables.

Typography:

- interface sans;
- restrained serif for field-guide and artifact moments;
- large environmental typography;
- minimal all caps.

Motion:

- fog clearing;
- route drawing;
- evidence pinning;
- systems lines assembling;
- atlas page unfolding;
- subtle parallax.

No confetti, bouncing CTAs, or constant animation.

---

# Accessibility

Preserve and improve:

- keyboard navigation;
- visible focus;
- alt text;
- semantic headings;
- reduced-motion support;
- no color-only state;
- 44px touch targets;
- route list alternative;
- sound off by default;
- transcripts/text for audio;
- accessible quiet-mode exit.

Environmental immersion must not reduce usability.

---

# Preserve

Do not regress:

- all current routes;
- Zustand state;
- local persistence;
- deterministic adaptation;
- role switcher and internal role access;
- artifact data;
- resurfacing;
- Creator/Orchestrator/Reviewer modes;
- backend and Supabase code;
- authentication;
- tests;
- Field-Test Draft and prototype disclosures.

---

# Explicitly out of scope

Do not add:

- live AI;
- GPS;
- AR;
- payments;
- creator marketplace;
- new backend schema;
- media-upload backend work;
- full Creator redesign;
- full Orchestrator redesign;
- public minor accounts;
- production notifications.

---

# Validation

Run:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Test manually at:

- desktop wide;
- tablet;
- iPhone-sized viewport;
- reduced-motion preference;
- keyboard-only navigation.

Verify:

- public entrance is learner-first;
- Studio modes remain reachable;
- map state changes after evidence capture;
- adaptive prompt still uses existing logic;
- quiet mode can be exited accessibly;
- artifact still uses learner state;
- refresh persistence still works;
- demo reset still works.

---

# Completion report

Report:

1. routes transformed;
2. new components;
3. image/media architecture;
4. motion behavior;
5. quiet-attention behavior;
6. artifact redesign;
7. navigation changes;
8. accessibility changes;
9. test/typecheck/lint/build results;
10. remaining visual placeholders;
11. known limitations;
12. next three recommended Magic Pass tasks.

Do not claim production readiness.
