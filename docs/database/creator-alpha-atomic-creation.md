# Creator Alpha atomic Journey creation

**Status:** unmerged draft PR #10. No hosted DDL or production deployment.

## Problem removed

Creator Beta formerly inserted a `journeys` row, then `journey_versions`, then each `journey_stops` row in separate REST requests. If Encounter 3 failed, the earlier writes could remain as a partial user draft. The endpoint could then fail after an irreversible partial mutation, making later retries confusing.

## New operation (development only)

`public.create_creator_journey` is a PostgreSQL 17 `SECURITY INVOKER` function invoked via Supabase RPC with a **single transaction**. It creates:

1. An adult-creator-owned Journey in the fixed prototype OWLL organization.
2. Its first editable `draft` version.
3. One through thirty-two typed Encounter/stop rows, preserving the Creator Beta metadata.
4. One diagnostic audit event.

Any failed authorization, required field, uniqueness constraint, malformed Encounter, or audit write aborts the **entire RPC transaction**. A successful RPC returns the created Journey/version identifiers, after which the repository loads the persisted record through the existing owner-only queries.

The function runs **as the authenticated caller**, not as a privileged `SECURITY DEFINER` service account. The existing RLS policies apply. Execution is granted to `authenticated` and denied to `anon` and `PUBLIC`. The organization membership check runs in the already private, non-exposed helper schema.

The server's `creator-beta-supabase.ts` constructs the stop payload using the existing `encounterToStopInsert` adapter. This avoids maintaining a separate stop model for creation and editing.

## Artifacts

- Base creator migration: `20261011205708_creator_alpha_initial.sql` (7 tables)
- CLI-created atomic RPC migration: `20261011213129_creator_atomic_creation.sql`
- Review copy: `docs/database/creator-atomic-rpc.proposed.sql`
- Failure-path test: `docs/database/tests/creator-atomic-smoke.sql`
- Schema-generated database TypeScript: `src/types/database.types.ts` (must be regenerated from both migrations and committed after verification)

## Verification boundaries

Disposable PostgreSQL 17 checks cover: success with two Encounters; duplicate position on the second Encounter causing rollback of the whole new Journey/version; invalid JSON rollback; unassigned authenticated adult denied; anonymous invocation denied; existing creator ownership policies; application typecheck against generated types.

The full local Supabase CLI reset, pgTAP, database lint, and production app build are independently verified by GitHub Actions. **This is not yet proof that real browser Auth, email login, connected save/reentry, two-device synchronization, or hosting setup works.**

The RPC creates one draft and does **not** publish a Journey or access learner profiles, evidence, cohorts, or media.

## Required before enabling real cloud records

- Confirm first adult developer's Supabase Auth account/profile/OWLL membership through a **trusted administrative bootstrap**. Never self-elevate any signed-in user to creator.
- Test the real Supabase HTTP API with two distinct adult Auth sessions. Confirm RLS prevents cross-owner reads and writes, and REST grants are correct.
- Test end-to-end create → edit → navigate away → reconnect → reopen → export Manifest → import into canonical LOCUS.
- Review the retry/idempotency case: if the HTTP response is lost **after a committed transaction**, a repeated request with a new slug may create a second complete Journey. A request idempotency key or duplicate-detection protocol should be established before robust production operation.
- Fix/verify the save queue and revision conflict behavior; verify backups/restores, hosting region, and dependency advisories before deployment.

**No hosted Supabase migration, Auth provisioning, live user data, merge, or deployment performed.**
