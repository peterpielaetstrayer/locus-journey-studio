# LOCUS Journey Studio — Repository Bootstrap Package

This package establishes the product context, coding-agent rules, architecture, and master build prompt for the first LOCUS vertical slice.

## Prototype

**Canonical journey:** Water Writes the Landscape  
**Location:** First Landing State Park, Virginia Beach  
**Primary modes:** Creator, Learner, Orchestrator, Reviewer  
**Prototype objective:** Demonstrate one complete place-based learning loop from creator authoring through learner evidence, human orchestration, artifact creation, and later resurfacing.

## Recommended setup

1. Copy all files in this package into the root of the private GitHub repository.
2. Commit the context package before generating application code.
3. Open the repository in Cursor.
4. Start a fresh Agent session.
5. Paste the contents of `prompts/CURSOR_MASTER_BOOTSTRAP_PROMPT.md`.
6. Require the agent to inspect and plan before editing.
7. Review the running application before committing generated code.
8. Use Codex later for bounded implementation tasks, architecture reviews, and accessibility audits.

## Suggested first commit

```bash
git add .
git commit -m "chore: establish LOCUS product specifications and agent rules"
git push
```

## Source-of-truth order

When documents conflict, use this priority:

1. `docs/product/acceptance-criteria.md`
2. `docs/product/journey-studio-spec.md`
3. `docs/product/water-writes-the-landscape.md`
4. `docs/product/locus-system-evolution-addendum-v0.2.md`
5. `docs/product/owll-locus-learning-architecture-charter.md`
6. `.cursor/rules/*.mdc`
7. `AGENTS.md`

The addendum governs broader LOCUS system evolution where the original charter or bootstrap assumptions have become too narrow. Journey-specific acceptance criteria and specifications continue to govern the current Virginia Beach vertical slice.

Record unresolved conflicts in `docs/decisions/decision-log.md`. Do not silently invent a resolution.

## Initial stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui or equivalent accessible primitives
- Lucide icons
- Zustand or lightweight React state
- localStorage persistence
- local deterministic adaptation engine
- illustrated local map assets
- Vercel deployment

## Current implementation note

The repository has evolved beyond the original bootstrap assumptions and now includes optional Supabase authentication, persistence, versioned journeys, Field Notes, artifacts, interventions, reviews, and a Demo/Connected repository-adapter pattern. The canonical Journey Studio experience may continue to use deterministic intelligence while future private-alpha LOCUS Core workflows may use live AI under the system evolution addendum and decision log.

## Build philosophy

This is a **professional prototype**, not production infrastructure.

The first implementation should make the complete learning loop tangible and testable while keeping simulated functionality honest. The product must not become a generic LMS, generic SaaS dashboard, travel guide, or chatbot.
