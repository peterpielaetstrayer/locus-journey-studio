# Sprint A2 — Learner Experience Pass 2

## Sprint purpose

Extend the visual and interaction quality established by **Enter the Landscape** into the four screens that define the central LOCUS learner loop:

```text
Invitation → Evidence → Interpretation → Memory
```

This sprint is not a broad visual refresh. It is a focused transformation of four existing, functioning routes.

---

## Product truth to preserve

The current application already contains:

- journey state;
- baseline capture;
- deterministic adaptation;
- field-note persistence in Demo Mode;
- map reveal behavior;
- confidence state;
- learner evidence;
- artifact assembly;
- Creator, Orchestrator, and Reviewer access;
- Supabase and authentication foundations;
- accessibility and reduced-motion foundations.

The sprint must preserve those mechanics.

---

## Emotional arc

| Screen | Movement | Learner feeling |
|---|---|---|
| Journey Awakening | arrival → tension | “Something important is hidden here.” |
| Water Fingerprint | tension → agency | “I can collect a real trace.” |
| Cypress-Knee Mystery | agency → productive doubt | “My theory matters, but evidence must test it.” |
| Living Atlas | fragments → ownership | “My learning became something durable.” |

---

## Visual doctrine

- Place before interface.
- Mystery before explanation.
- One consequential question at a time.
- Evidence changes what becomes visible.
- Learner thinking is the collectible.
- AI is quiet and exact.
- Materials feel collected, not generated.
- Motion reveals relationships.
- The interface should gradually recede as attention strengthens.

---

## Sprint deliverables

1. Four transformed routes.
2. Responsive desktop and mobile compositions.
3. A small reusable learner-experience component set.
4. Environmental media integration for each screen.
5. Preserved state and adaptation behavior.
6. Updated tests where component behavior changes.
7. Browser review notes.
8. One refinement commit after review.
9. Updated master sprint tracker.

---

## Recommended reusable components

Create only when justified:

```text
JourneyAwakeningScreen
RouteAwakeningThread
BaselineThoughtSheet
EvidenceCaptureSlab
CaptureModeRail
EvidenceQuestion
TheoryFragment
ConfidenceLanguageControl
LivingAtlasSpread
AtlasEvidenceFragment
AtlasCausalSystem
UnresolvedMarginNote
```

Do not over-abstract. A component must carry a distinctive LOCUS behavior or material language.

---

## Environmental assets

Expected production paths:

```text
public/images/first-landing/route-awakening.webp
public/images/first-landing/water-fingerprint.webp
public/images/first-landing/cypress-knees.webp
```

For Living Atlas, use:

1. learner-captured evidence when supported;
2. otherwise the most relevant evidence asset;
3. never the shoreline-transfer image as the primary First Landing artifact image unless the learner actually selected it.

All full UI mockups are visual references only. Never ship them as flattened screens.
