# LOCUS Creator Alpha: first real-browser acceptance

**Date:** 2026-10-11 (U.S. Eastern); GitHub Actions run [38193139942](https://github.com/peterpielaetstrayer/locus-journey-studio/actions/runs/38193139942).
**Result:** PASS, local development only. Draft PR [#12](https://github.com/peterpielaetstrayer/locus-journey-studio/pull/12).
**Code ancestry:** Creator Beta → save-reliability queue + portable Manifest export → creator-only database/type boundary → atomic Journey creation → real Supabase Auth test → Chromium browser test.

## Verified evidence

- Full isolated Supabase startup and two creator-alpha migrations applied cleanly.
- 27 API-level assertions using real Supabase Auth, actual PostgREST, and RLS passed with three **synthetic adult identities** (two authorized creators and one unassigned). No learner records were used.
- 11 **Chromium** application assertions passed in the actual Next.js user interface, not just direct API calls.
- Browser flow: adult creator logs in through the actual app → enters Journey seed → creates a deterministic proposal → creates an editable Journey via the application → edits and observes connected save → independently logs in in a second browser context → reopens the persisted Journey → forces one failed connected PUT → sees an explicit retry → retries → reloads and verifies persistence.
- The app downloaded a **Manifest v0.1**. The test read the download and confirmed matching Journey ID, saved title, at least one Encounter, and absence of a learner-response top-level field. This does not yet test the receiving LOCUS learner importer.
- A second adult creator was denied access to the first creator's Journey through the Next.js API; an unassigned adult was denied connected-library access.
- Existing local-Supabase pgTAP RLS, DB lint, unit tests, TypeScript check, ESLint and production build passed.
- GitHub Actions concluded **success**.

## Infrastructure boundary

The browser test ran in an ephemeral CI stack with local Next.js and local Supabase (loopback addresses only). It installed pinned Playwright Chromium transiently and used synthetic test passwords. No real identities, emails, learner responses, external preview deploy or hosted database were involved.

The existing hosted Supabase project `gblmcfatlfihcnvvqaan` was separately rechecked: **ACTIVE_HEALTHY, zero public application tables, zero applied migrations**.

## Remaining gates, not claims

1. **Cross-repository golden fixture:** export from Creator Studio → validate LOCUS Manifest v0.1 import → complete learner Encounter → later reentry and retrieval, with portability invariants.
2. **Hosted development migration:** independent schema/security review; data region and backup/restore decision; confirm hosted Auth signup settings. Obtain explicit owner approval before any hosted DDL, account or preview deployment.
3. **Lost-response idempotency:** a successful transaction followed by a dropped HTTP response could be duplicated on retry. Design a stable creation request key or equivalent de-duplication and test it.
4. **Concurrent edits:** save queue protects against stale acknowledgements in one browser but does not resolve two-device conflicting edits or hard-browser-kill sync uncertainty.
5. **Dependency vulnerability review:** audit runtime dependencies and triage actionable advisories before hosting real creator work.
6. **Invitation process and UX:** operator-run trusted first-adult bootstrap is documented but has not been used on a hosted project. A real protected-preview browser test remains necessary.

The current result is **first passing real local browser acceptance**, not production readiness and not an actual learner end-to-end trial.
