# LOCUS Journey Studio — Product Specification v0.1

## Product definition

LOCUS Journey Studio is a responsive front-end demonstrator that allows a Creator to build a reusable place-based learning journey, a Learner to experience it, an Orchestrator to adapt it, and a Reviewer to inspect quality and readiness.

## Prototype objective

```text
Creator defines journey
→ Learner encounters place
→ Learner captures evidence
→ LOCUS offers adaptive follow-up
→ Orchestrator intervenes
→ Learner revises
→ Learner creates artifact
→ Idea resurfaces
```

## Core users

### Steph Rivera — Creator and Orchestrator

Needs clear authoring, control over goals, learner preview, AI boundaries, safety/accessibility fields, and evidence of meaningful learning.

### Maya Chen — Learner

Age 14; visual, curious, quick to answer; strong observation; developing causal reasoning and evidence selection; identity: Emerging Naturalist.

### Eli Brooks — Learner

Age 13; movement motivated; easily distracted; prefers voice; identity: Explorer.

### Jordan Reyes — Learner

Age 15; careful and thoughtful; benefits from explicit structure; identity: Systems Thinker.

## Modes

### Creator

Journey Library, Overview, Route Builder, Stop Editor, Adaptive Branches, Evidence/Artifact, Resurfacing, Safety/Access, Learner Preview, Review/Publish.

### Learner

Invitation, Preparation, Fogged Map, Field Stop, Field Note, Comparison, Systems Map, Exit Claim, Artifact, Idea Returns.

### Orchestrator

Cohort Dashboard, Learner Detail, Intervention Composer, Artifact Review.

### Reviewer

Learning design, factual quality, safety, accessibility, field test, maintenance, unresolved issues.

## Canonical demonstration path

```text
Demo Gateway
→ Journey Overview
→ Learner Invitation
→ Water Fingerprints
→ Field Note Capture
→ Adaptive Follow-Up
→ Orchestrator Dashboard
→ Mentor Intervention
→ Exit Claim
→ Micro-Landscape Systems Card
→ Idea Returns
```

## Required shared features

- role switcher
- demo reset
- local persistence
- responsive navigation
- prototype-status disclosure
- local images
- offline/error states
- privacy indicators

## Demo Gateway

Headline:

> Turn the world into a learning environment.

Cards: Create, Experience, Orchestrate, Review.

Relationship:

```text
OWLL → designs the learning model
LOCUS → powers the journey
Field Notes → captures the learner's experience
```

## Journey Overview

Show title, location, age, duration, creator, Field-Test Draft status, central question, route, eight stops, artifact, domains, safety summary, and Creator/Orchestrator distinction.

## Creator Journey Library

Include:

- Water Writes the Landscape
- Roots in Unstable Ground
- A Trail Is a Decision
- Tahoe Basin Explorer
- San Diego Coastal Systems

Future creator-economy preview must be labeled nonfunctional.

## Route Builder

Use a custom illustrated map or SVG with route, numbered stops, habitat zones, safety marker, mysteries, and quiet-attention node.

## Journey Stop Editor

Canonical selected stop: Cypress-Knee Mystery.

Tabs:

- Overview
- Prompt and Action
- Learner Branches
- Evidence
- Mentor
- Safety and Access
- Artifact
- Resurfacing
- Sources

## Adaptive Branch Builder

```text
Core Stop
├── Curious Explorer → Design a field study
├── Needs Structure → Compare two examples
├── Reluctant Learner → Find the strangest example
└── Artistic Path → Sketch before explaining
```

## Learner Journey Invitation

Title: Water Writes the Landscape.

Question:

> How can you tell that water is shaping a place—even when you cannot see it moving?

Promise:

> Collect evidence, test an explanation, and create one page of your Virginia Beach Living Systems Field Guide.

## Fogged Journey Map

Reveal content through evidence, comparison, questions, and collaboration—not speed.

## Field Note Capture

Capture modes: photo, voice, text, sketch placeholder.

Fields:

- What did you notice?
- What do you think it means?
- What evidence supports that?
- What else could explain it?
- Confidence
- Question

Adaptive follow-up example:

> You noticed dark, wet soil near the boardwalk. What nearby comparison could strengthen or challenge your explanation?

## Systems Map

Starting nodes: rainfall, water level, soil saturation, roots, plant distribution, decomposition, habitat, trail design.

## Exit Claim

Prompt:

> Water organizes this landscape by…

Require claim, two observations, causal relationship, and remaining question. Then show baseline and revised thinking.

## Artifact

Micro-Landscape Systems Card with image, original hypothesis, evidence, revised explanation, systems diagram, remaining question, location/date, and identity marker.

## Idea Returns

Ask retrieval from wetland image before showing notes, then transfer to shoreline.

## Orchestrator Dashboard

### Maya

High confidence, weak evidence → ask for challenging evidence.

### Eli

Inactive simulation → unusual-object field challenge.

### Jordan

Needs structure → two-example comparison.

Orchestrator can accept, modify, ignore, replace, and record rationale.

## Quality Review

Show unresolved issues and status not approved for youth program.

## Responsive behavior

Desktop: Creator/Orchestrator split panels.  
Tablet: collapsible panels.  
Mobile: Learner-first, one task per screen, bottom navigation.

## Prototype boundaries

Simulate AI, learner model, map position, analytics, approval, and resurfacing. Do not implement live GPS, live AI, payments, royalties, school integrations, production auth, AR, or full knowledge graph.
