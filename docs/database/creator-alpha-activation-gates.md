# Creator Alpha: activation blockers and review disposition

**Status:** UNMERGED draft only; do not enable Connected Mode or apply any hosted migration.
**Related:** PR #7 (this branch), design PR #6, Creator Beta save reliability PR #5, Creator Beta parent PR #2.
**Supabase development candidate:** `gblmcfatlfihcnvvqaan` (confirmed empty, active/healthy at prior inspection).

## Verified

- The live development candidate is separate and has not received any application DDL, auth users or data from this work.
- Supabase CLI 2.110.0 generated filename `20261011205708_creator_alpha_initial.sql`; that is now the only active migration **on this branch**.
- The legacy 18-table institutional/learner migration is absent from this branch's active migration path, but remains recoverable from Creator Beta's parent branch and Git history.
- Seeding is disabled, and the former youth/cohort fixture seed was replaced with an empty documented seed.
- Disposable PostgreSQL 17 executes the migration; two synthetic adult creators are isolated by RLS; unassigned and anonymous roles are denied; creator permissions and publication boundary pass SQL smoke tests.
- Schema-contract smoke test matches the columns and `record_audit_event` signature expected by `creator-beta-supabase.ts` and `db-adapter.ts`.
- TypeScript type generation succeeds against the seven-table PostgreSQL schema.

## Blocking findings from generated types

Running the **existing full application** typecheck using the newly generated seven-table types fails, because the larger, historical application still includes old connected modules and API functions that address `adaptive_branches`, `cohort_memberships`, `journey_enrollments` and other excluded learner/institutional tables. This is a **real compatibility gap**, not a SQL migration failure.

- `src/lib/repositories/supabase.ts` is the historic institution/learner repository; it must not be selected when only the creator schema exists.
- `src/lib/auth/authorize.ts` includes functions for assigned orchestrators/cohorts; they must be isolated from the narrow creator backend until their tables exist.
- `src/lib/repositories/index.ts` currently selects the old connected repository whenever public Supabase configuration is present. Simply adding Supabase env vars would activate incompatible old routes. This MUST be addressed before any connected deployment.
- The Creator Beta repository attempted nullable `created_by` despite a required creator foreign key. The draft branch now rejects unauthenticated create attempts and always uses authenticated `user.id`; revalidate that under generated types.
- The checked-in `src/types/database.types.ts` describes the former broader schema; it MUST NOT be treated as proof the new creator schema compiles.
- Codegen and diagnostics are in the PR's CI artifact; the current non-blocking diagnostic should become a **passing enforced typecheck** for the correct creator-mode application before this migration is promoted.

## Other mandatory gates

1. Verify migration reset, pgTAP RLS tests, DB lint and TypeScript compile against real local Supabase Auth (not just a Postgres Auth shim).
2. Isolate Creator Alpha connected routes/clients/types from the older institutional learner API; make unsupported legacy routes fail closed or stay explicitly demo-only in a documented manner.
3. Fix/contain partial Journey → version → Encounter writes so network failures cannot silently create incomplete data. Check and propagate errors from every database mutation.
4. Implement controlled adult Auth/profile/creator membership bootstrap with **no public self-elevation**; test two actual Supabase Auth sessions, REST grants and negative RLS requests.
5. Test PR #5 save queue including navigation, retry, browser termination and single-author cross-device reopening; plan a revision/conflict model before concurrent editing.
6. Review npm dependency audit findings reported by CI before hosting persistent personal content; audit summary alone does not establish exploitability.
7. Verify backup/restore and choose acceptable region/data residency. Keep learner evidence local in this phase.
8. Obtain explicit approval before migrating the currently empty hosted development database, connecting credentials to any deployment, merging, or enabling account access.

**Intended acceptance demo:** invited adult signs in → trusted creator membership → creates draft Journey → edits across sessions/devices → export v0.1 Manifest → canonical LOCUS import → learner Encounter/retrieval. No children or institutional learner data in this gate.

**No hosted changes performed by PR #7.**
