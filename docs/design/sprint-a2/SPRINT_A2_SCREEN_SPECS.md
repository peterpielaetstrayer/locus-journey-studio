# Sprint A2 Screen Objective Sheets

# 1. Journey Awakening

**Route:** `/learner`  
**Current component:** `src/components/learner/JourneyAwakening.tsx`

## Objective

Turn the journey overview into a charged invitation. The learner should understand the mission without seeing the whole route or reading an onboarding wall.

## Required copy

```text
WATER WRITES THE LANDSCAPE

Find evidence of water
without looking at the water.
```

## Emotional target

> I have entered a real inquiry, and the place is withholding something.

## Visual composition

- Full-viewport environmental scene.
- Route begins visibly and then dissolves into fog.
- Only the first two anchors are clear.
- A small atlas preview implies what the learner will make.
- Baseline capture appears as a field sheet or drawer, not a standard form card.
- “Begin walking” uses the expedition action language established on the entrance.

## Signature interaction

The learner may begin immediately or record:

> Water shapes a place by…

The baseline is stored but not judged.

## Motion

- route draws partially;
- later route fades into fog;
- atlas preview settles in;
- baseline sheet unfolds;
- reduced-motion renders all states immediately.

## Avoid

- card stack;
- visible full route;
- long instructions;
- generic textarea and select floating on the image;
- multiple equally weighted CTAs.

---

# 2. Water Fingerprint

**Route:** `/learner/water-fingerprints`  
**Current component:** `src/components/learner/WaterFingerprintCapture.tsx`

## Objective

Make the learner’s first evidence capture feel consequential.

## Primary prompt

```text
Find the trace,
not the water.
```

Supporting meaning:

> Find evidence of water that is not water itself.

## Emotional target

> I am acting like an investigator. My observation changes the journey.

## Visual composition

- Environmental detail fills the viewport.
- Capture reticle or observation frame is integrated into the scene.
- Capture modes are presented as tools, not a dropdown.
- Observation input appears only after the learner chooses a mode.
- Confidence is expressed in language, not dominated by numeric scoring.
- Saved evidence becomes a material Field Note fragment.
- Route reveal and causal thread are visible consequences.

## Signature interaction

```text
capture observation
→ one adaptive evidence question
→ Field Note pins into the route
→ map clears
→ water → soil appears
```

## Preserve exactly

- `addFieldNote`;
- `revealMapStop`;
- deterministic `evaluateAdaptation`;
- creator fallback prompt;
- three phases: capture, follow-up, success;
- mentor interventions;
- next route to `/learner/cypress-knee`.

## Motion

- capture slab rises or unfolds;
- note pins into place;
- route fog clears;
- causal thread draws;
- no confetti or correctness animation.

## Avoid

- select menu as the primary mode selector;
- generic upload box;
- visible giant form from the first frame;
- long AI response;
- “Correct!” language;
- points or badges.

---

# 3. Cypress-Knee Mystery

**Route:** `/learner/cypress-knee`  
**Current file:** `src/app/learner/cypress-knee/page.tsx`

## Objective

Create the defining hypothesis-and-evidence moment.

## Required copy

```text
These structures are doing something.

What do you think they are doing?
```

## Emotional target

> I can form a theory, but I am responsible for testing it.

## Visual composition

- Full-bleed close image of cypress knees.
- Prompt is a restrained field label.
- Response modes feel like field tools.
- Learner theory becomes a translucent annotation or material fragment over the scene.
- Confidence appears as natural language.
- Adaptive follow-up is a single quiet question.
- Safety is visible and integrated, not buried.

## Adaptive behavior to preserve

- high confidence + weak evidence:
  `What would you need to observe before trusting that explanation?`
- uncertain:
  `Start with one possibility. What detail made you consider it?`
- movement profile:
  `Find the strangest example within ten safe steps.`
- advanced evidence:
  `Design a field comparison that could separate two competing explanations.`

## Signature interaction

The learner’s theory is visibly provisional. New evidence can refine it.

## Motion

- theory fragment settles onto the image;
- annotation line draws;
- follow-up question fades in alone;
- evidence capture opens only after requested.

## Avoid

- four generic rounded buttons;
- quiz styling;
- premature scientific answer;
- large adaptive-system disclosure competing with the question;
- cluttered safety treatment.

---

# 4. Living Atlas

**Route:** `/learner/artifact`  
**Current components:** `ArtifactPage`, `LivingAtlasPage`

## Objective

Turn assembled learning into a durable personal artifact.

## Emotional target

> This is mine. I can now see and explain more than I could before.

## Visual composition

- A real atlas spread, not a dashboard on beige.
- Material paper edge, seam, map texture, image fragment, tape, annotation, stamp.
- Learner title anchors the page.
- Original theory and evidence remain visibly distinct.
- Systems map becomes an authored causal composition.
- Remaining uncertainty appears as a margin note.
- Completion statement remains outside or below the artifact.
- The page should feel printable.

## Required completion copy

```text
You did not finish a lesson.

You learned to read one part of the world.
```

## Signature interaction

```text
assemble page
→ page unfolds
→ evidence and systems map settle
→ add to Virginia Beach Atlas
```

## Preserve exactly

- artifact state;
- title;
- unresolved question;
- baseline hypothesis;
- evidence extraction;
- revised explanation;
- systems map;
- learner identity pathways;
- next link to resurfacing.

## Media correction

The current atlas fallback uses `shorelineTransfer`. Replace that visual fallback with the most relevant First Landing evidence image or learner media. Do not alter the database schema in this sprint.

## Motion

- page unfolds once;
- evidence photo settles;
- causal relationships assemble;
- reduced-motion shows final state immediately.

## Avoid

- rounded card grid;
- stacked dashboard sections;
- generic certificate;
- badge language;
- social-sharing treatment;
- decorative paper texture that hurts readability.
