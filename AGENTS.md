# AGENTS.md — LOCUS Journey Studio

## Mission

Build the smallest coherent prototype that proves a creator can turn a real place into a reusable adaptive learning journey, a learner can gather evidence and revise understanding, and a human orchestrator can intervene intelligently.

## Read before changing code

Always inspect:

- `docs/product/journey-studio-spec.md`
- `docs/product/water-writes-the-landscape.md`
- `docs/product/acceptance-criteria.md`
- `docs/product/owll-locus-learning-architecture-charter.md`
- `.cursor/rules/`

Do not rely on this file alone.

## Non-negotiable product distinctions

- **OWLL** is the research, learning-design, and experimentation house.
- **LOCUS** is the persistent learning operating system.
- **Field Notes** is the learner-facing capture and reflection layer.
- **Creator** designs reusable journey architecture.
- **Orchestrator** adapts and supports a journey for actual learners.
- One person may occupy both roles, but the product must keep them structurally distinct.
- AI supports attention, inquiry, evidence, reflection, and adaptation. It does not replace learner thinking or human safeguarding judgment.

## Prototype objective

Build the Virginia Beach vertical slice around **Water Writes the Landscape** at First Landing State Park.

The canonical demonstration path is:

```text
Demo Gateway
→ Journey Overview
→ Learner Invitation
→ Water Fingerprints
→ Field Note Capture
→ Deterministic Adaptive Follow-Up
→ Orchestrator Dashboard
→ Mentor Intervention
→ Exit Claim
→ Micro-Landscape Systems Card
→ Idea Returns
```

A compact Creator experience must also expose:

- journey overview
- route
- Cypress-Knee Mystery stop structure
- adaptive branches
- safety and accessibility
- learner preview

## Engineering behavior

Before implementing a significant feature:

1. Inspect relevant source files and specifications.
2. State the planned changes.
3. Preserve existing behavior unless the task explicitly changes it.
4. Build the smallest coherent implementation.
5. Run type checking, linting, and production build.
6. Report incomplete or simulated behavior honestly.
7. Do not rewrite unrelated files.
8. Avoid large opaque abstractions before repetition justifies them.

## Git behavior

- Do not force-push.
- Do not rewrite history.
- Do not commit secrets.
- Keep each branch focused on one bounded feature or audit.
- Prefer reviewable commits.
- Never allow multiple agents to modify the same branch simultaneously.
- Leave `main` deployable.

## UX behavior

- Learner field mode is minimal and image-led.
- Creator mode may be information-rich, but must remain clear.
- Orchestrator mode centers the learner, not analytics theater.
- The prototype must be usable on mobile and desktop.
- Avoid generic dashboard templates and excessive glassmorphism.
- Do not use streaks, speed leaderboards, or shallow badges as evidence of learning.
- Technology should gradually help learners notice more with fewer overlays.

## AI simulation behavior

v0.1 uses deterministic local rules. Do not present simulated outputs as a live general-purpose AI.

Examples:

- high confidence + weak evidence → request challenging evidence
- prolonged inactivity → offer a bounded field-search challenge
- structured learner profile → one action at a time with sentence starters
- advanced response → offer measurement or experimental-design extension
- unsafe action → refuse and offer a safe observational alternative

## Learning integrity

Do not:

- give the answer before the learner thinks
- replace learner work with polished AI prose
- reward mere screen opening or arrival
- treat completion as mastery
- fabricate species identification
- present uncertain science as settled
- diagnose disability or mental health conditions
- use learner service data as research data without separate consent

## Safety and trust

The interface must state that LOCUS does not replace:

- park rules
- required permits
- trained supervision
- emergency judgment
- accessibility planning
- safeguarding processes

The current journey status must be represented as a prototype or field-test draft, not an approved youth program.

## Definition of done

A feature is not done until:

- its primary interaction works
- its empty and error states are considered
- its mobile layout is usable
- keyboard navigation is possible where applicable
- it uses canonical journey content
- it preserves state appropriately
- type checking and build pass
- it satisfies the relevant acceptance criteria
