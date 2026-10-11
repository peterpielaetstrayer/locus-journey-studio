# Creator Alpha backend boundary and integration checklist

**State:** 2026-10-11, draft PR #8, stacked on draft migration PR #7 and schema design PR #6; NOT deployed.
**Goal:** preserve an explicitly simulated legacy learning demo while enabling a separate adult-only, authenticated Creator Beta using seven public tables and real schema-generated types.

## Boundaries now enforced on this branch

| Product interface | Persistence | Contract |
| --- | --- | --- |
| Creator Beta (`/creator/beta/*`) | Adult Auth + `creator-beta-supabase.ts` when configured; otherwise explicit local drafts | Seven creator-alpha tables, owner-only RLS, no institutional learner records |
| First Landing historical UI | Local demo only | No real connected cohort/learner persistence; demo view is labeled |
| `getConnectedRepositories()` | Disabled | Throws even with Supabase variables; no accidental legacy institution adapter |
| `getRepositories()` for historical clients | Local demo only | Never automatically escalates because Supabase env vars exist |
| Historical `requireAssignedOrchestrator` | Disabled | Denies because cohorts and enrollments do not exist in this schema |

The old `src/lib/repositories/supabase.ts` institutional adapter is removed **from this draft branch only**. It remains in the parent commit history. This does NOT remove the broader long-term institutional vision.

## Connected error and cache behavior

- A connected API failure is an explicit error, **not** an empty local library or automatic local draft creation.
- Creator Library only labels records from the connected API as confirmed cloud Journeys.
- Cached browser copies of connected IDs are explicitly unverified, even if they can be opened to inspect/export. This avoids false cloud-save claims.
- Generic Journey creation and Encounter creation do not silently switch from connected to local when the request fails.
- Database read/query errors and critical write/audit errors are propagated by the Creator Beta repository rather than silently returning empty data or a successful save.

These safeguards do **not** create multi-device revision conflict resolution. A connected Journey already in a browser's local store is not revalidated automatically on every editor opening; test and design reconciliation before enabling simultaneous editing.

## Schema verification

- Actual Creator Alpha PostgreSQL 17 schema types were generated in an **isolated disposable CI database** and committed to `src/types/database.types.ts` in this branch.
- The full app compiled under those generated types in CI after disabling the historic connected backend.
- Unit tests specifically cover historic backend fail-closed and rejection of connected read errors.
- Creator Alpha migration is in `supabase/migrations/20261011205708_creator_alpha_initial.sql` only in draft branches; the old 18-table migration is retained in parent Git history.
- Full local Supabase Docker migration reset + pgTAP row-level security tests and lint passed in the earlier migration package branch, not in the hosted project.

## Cross-branch integration required before a hosted alpha

**Do not merge one PR and assume all other gates are present.** Current work is split across **separate stacked and sibling drafts**:

1. PR #2 Creator Beta v0.2 parent (draft)
2. PR #4 portable Journey Manifest export (sibling on PR #2)
3. PR #5 independent save reliability queue (sibling on PR #2)
4. PR #6 creator-only schema design (draft on PR #2)
5. PR #7 creator-alpha CLI migration (draft on PR #6)
6. PR #8 safe backend boundary and generated types (draft on PR #7)

The **save-reliability PR #5 is not included in PR #8's ancestry**. Its queue fix must be integrated and conflict-tested with PR #8's connected-fallback changes before any real creator work is entrusted to Supabase. Manifest export PR #4 must also be integrated for the complete handoff.

## Remaining deployment gates (not yet approved)

1. Integrate the sibling Creator Beta save queue + Manifest PRs into one protected preview, resolving hook changes and testing full CI.
2. Replace multi-call Journey → version → Encounter creation with an atomic server-side operation (or equally safe failure-repair protocol); run partial-write failure tests.
3. Prepare a trusted invitation-only adult Auth/profile/organization membership bootstrap. **Do not permit self-elevation via public APIs.**
4. Test real Supabase Auth sessions and owner-only RLS using two adults; prove save, close/reopen, navigation flush/retry, and second-device read, including network failure.
5. Review and resolve relevant npm dependency security advisories; establish backup/restore and decide hosting region.
6. Confirm the existing Supabase development project's migration status and obtain explicit authorization **before** hosted schema changes, account creation, merge, or deployment.

**No hosted Supabase DDL, learner storage, real account provisioning, merge or deployment performed by this PR.**
