# LOCUS Permissions Matrix

Prototype backend for **Private Adult Co-Design Walk** maximum. Learner operational data requires assignment or admin authority — not general org membership.

Legend: **R** read · **W** write · **—** no access · **A** admin-only · **D** delivery team (assigned orchestrator + owner/admin)

## Journey architecture (design content)

| Table | owner/admin | creator | reviewer | orchestrator |
|-------|-------------|---------|----------|--------------|
| organizations | R | R | R | R |
| organization_memberships | R/W | R | R | R |
| journeys | R/W | R/W | R | R |
| journey_versions | R/W editable | R/W editable | R | R |
| journey_stops | R/W editable | R/W editable | R | R |
| adaptive_branches | R/W editable | R/W editable | R | R |
| journey_reviews | R | R | R/W own reviews | R |

Publication to `published` requires `publish_journey_version()` (owner/admin) with required review categories approved.

Creators cannot exceed `private_adult_walk` status.

## Learner operational data

| Table | owner/admin | assigned orchestrator | unassigned orchestrator | creator | reviewer |
|-------|-------------|----------------------|-------------------------|---------|----------|
| learner_profiles | R/W | R assigned learners | — | — | — |
| cohorts | R/W | R assigned cohort | — | — | — |
| cohort_memberships | R/W | R assigned | — | — | — |
| journey_enrollments | D | D | — | — | — |
| field_notes | D | D | — | — | — |
| mentor_interventions | D | D | — | — | — |
| artifacts | D | D | — | — | — |
| resurfacing_events | D | D | — | — | — |
| media_assets | D | D assigned enrollment | — | — | — |
| storage.objects (field-media) | D via media_assets | D via media_assets | — | — | — |

## Audit

| Table | owner/admin | other staff |
|-------|-------------|-------------|
| audit_events | R | insert via `record_audit_event()` only |

## Storage access matrix (`field-media`)

| Actor | SELECT | INSERT | UPDATE visibility | DELETE |
|-------|--------|--------|-------------------|--------|
| media owner (current org member) | yes | via media_assets row first | yes | yes |
| assigned orchestrator | yes if linked enrollment | — | — | — |
| owner/admin | yes | — | yes | yes |
| creator | — | — | — | — |
| reviewer | — | — | — | — |
| removed org member | — | — | — | — |

Insert flow: register `media_assets` → upload storage → on failure delete both.

## Anonymous

No SELECT/INSERT/UPDATE/DELETE on protected tables or storage.
