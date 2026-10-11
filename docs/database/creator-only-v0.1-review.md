# Creator-only persistence: v0.1 proposed database boundary

**Status:** draft, NOT applied, NOT a runnable production migration.
**Database audited:** existing Supabase project `gblmcfatlfihcnvvqaan`, publicly exposed application schema empty as of 2026-10-11.
**SQL source:** [creator-only-v0.1.proposed.sql](./creator-only-v0.1.proposed.sql).
**Related software:** Creator Beta v0.2 draft branch and [save-reliability fix PR #5](https://github.com/peterpielaetstrayer/locus-journey-studio/pull/5).

## Why this is a proposal, not yet an active migration

The repository **already has** `supabase/migrations/20260728180000_initial_schema.sql`, a broad **18-table** institution/learner schema, along with `supabase/seed.sql` containing demo learner profiles, age bands, cohorts and enrollments. A `supabase db push` would run the **existing broad migration**, NOT the narrower proposal here.

**Do not run `supabase db push`, `supabase db reset`, `supabase db seed`, or paste the proposed SQL into the live database at this stage.** Those actions require an independently reviewed promotion plan. The SQL remains in `docs/database` precisely to avoid accidental execution.

After approval, generate a proper migration filename using the installed Supabase CLI (`supabase migration new <descriptive-name>`), migrate this vetted SQL into that CLI-created file, **and retire/segregate the old unapplied 18-table migration in the same reviewed change**. Verify the migration list and schema diff in a disposable local or isolated development database before any remote application.

## Goal and deliberate exclusions

**One adult, authenticated creator** can save/reopen/edit a Journey across devices and export a portable Manifest. No group editing, learner accounts, child/teen data, teaching cohorts, learner tracking, publication, peer review workflows, media or AI inference.

Keep the canonical LOCUS learner application local-first during this phase.

## Seven-table compatibility-first subset

| Table | Why it remains | Access |
| --- | --- | --- |
| `profiles` | Supabase Auth user identity for the existing API | Self |
| `organizations` | Existing API assumes a fixed OWLL organization ID | Existing member read only |
| `organization_memberships` | Existing API checks an organization role | Self read; **no client writes** |
| `journeys` | Named creator Journey | Own creator only |
| `journey_versions` | Draft content and revision metadata | Own drafts only |
| `journey_stops` | Existing database adapter maps Encounters to stops | Own editable drafts only |
| `audit_events` | Existing server adapter calls `record_audit_event` | Own diagnostic log |

The schema retains original enum names and table columns needed by `src/lib/repositories/creator-beta-supabase.ts` and `src/lib/creator-beta/db-adapter.ts`. It changes early-alpha read scope to **strict per-creator ownership**, more restrictive than the earlier organization-wide read policies. Such restrictions require actual role-based tests, not merely SQL inspection.

No `learner_profiles`, `cohorts`, `field_notes`, `artifacts`, or `media_assets` tables exist in the proposed migration.

## Authentication and bootstrapping

- Supabase Auth must be configured for a **limited adult development cohort** before Connected Mode is used.
- This SQL creates a **non-personal OWLL organization row only**. It creates **no Auth user**, profile, or membership, and it cannot grant creator privileges to arbitrary signups.
- After an authorized adult signs in, their corresponding `profiles` row can be created through the self-only insert policy. The first owner or creator membership must be assigned by a trusted administrator in a separate explicitly reviewed bootstrap action. Do not create a public self-elevation or open membership signup.
- Existing `requireOrganizationMembership` / `requireOrganizationRole` gates will reject a signed-in user without that membership. Without bootstrap, Connected Mode is **not ready** for the acceptance test.
- The editor currently uses a fixed organization ID; that is an intentional **single-organization development constraint**, not a general multi-tenant design.

## Security considerations and validation required

1. **Authentication:** anonymous browser requests must see zero Journey records, and no secret/service-role key may be available in any frontend bundle.
2. **Row-level security:** verify every public table has RLS enabled; each grant is deliberate. Two distinct adult test users in the same OWLL org must not read or change each other's Journeys, versions, or Encounters.
3. **Authorization:** an authenticated but unassigned user cannot create a Journey; a creator cannot update records owned by another; no client can issue membership changes.
4. **Draft-only:** published, learner pilot and archived states cannot be inserted or entered via this alpha. Publishing requires a future separate review workflow.
5. **Audit:** `record_audit_event` is SECURITY INVOKER and obeys RLS; log content is diagnostic and **not tamper-proof regulatory evidence**.
6. **Schema:** confirm foreign keys, non-null constraints, creator ownership after updates, version/Encounter ordering, and conflict behavior.
7. **Reliability:** run unit tests and realistic rapid-edit/offline/retry flows from save-reliability PR #5. Browser termination can still interrupt writes; app needs a later server-revision/reconciliation strategy.
8. **Recovery:** establish backups, restoration procedure, and a sample draft export before treating the database as a source of important creator work.
9. **Data API:** verify actual REST exposure and grants after migration (RLS and grants are distinct access checks).
10. **Location:** evaluate current Canada Central hosting for intended U.S. users, contractual data residency and latency before production decisions.

## Additional compatibility issues

- The existing Journey Studio `src/types/database.types.ts` was generated for the **larger** schema; after approval, regenerate types against the actual smaller database and fix any code that imports now-absent institutional tables.
- Creator Beta's current backend performs a series of Journey/version/Encounter inserts without one atomic database transaction. If a later insert fails, a partial draft may remain. Before real persistent creator use, test this failure path and consider transactional creation or an explicit compensating/repair flow.
- The existing server repository occasionally does not check `error` after a Journey title update. Add error checks before treating save acknowledgments as reliable.
- The current Creator Beta sync does **not** resolve simultaneous divergent edits on two devices. Use one-device-at-a-time for the first acceptance test or add revisions/conflict handling.
- New draft schema must be verified using actual test accounts and database lints. No migration dry-run was performed here because the database is deliberately unchanged.

## Gate for promoting this SQL to a real migration

Only after code review confirms the constraints above and the owner authorizes a development-only application:
1. Remove or archive the legacy unapplied broad migration from the active path.
2. Create a correctly named migration via the Supabase CLI in a fresh local database.
3. Test schema creation, negative RLS cases and auth bootstrap without importing the old youth/cohort seed.
4. Review generated types and actual repository queries.
5. Apply to the **approved development project only**, verify rows/policies/advisors and back up before testing persistent real adult drafts.
6. Verify creator sign-in → create → edit → navigate away → reopen → retry failure → export Manifest → import into canonical LOCUS.

No user account, migration, project branch, deployment or data record was created in this design stage.
