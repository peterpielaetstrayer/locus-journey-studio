# Protected Creator Alpha connected preview

**Environment:** private Vercel Preview on `preview/creator-alpha-connected-20261011`; never production.
**Source:** browser-validated Creator Alpha PR #12 (`e8191f0732d0ede39ed04b8cb4038f0e9bb15abb`), all draft changes unmerged.
**Vercel project:** `locus-journey-studio`, authenticated preview deployment URLs.
**Development Supabase project:** `gblmcfatlfihcnvvqaan` (Canada Central, PostgreSQL 17).
**Configured values:** branch-scoped `NEXT_PUBLIC_SUPABASE_URL` and **publishable** key only. Do not set a service-role or secret key in public/build-exposed variables.

## Verified development database state

On 2026-10-11 Eastern / 2026-10-12 UTC the two reviewed SQL migrations were applied via Supabase MCP and succeeded:
- `creator_alpha_initial`: seven public creator-only tables with RLS and trusted membership bootstrap permissions.
- `creator_atomic_creation`: single-transaction `SECURITY INVOKER` Creator Journey creation.

Afterwards all seven public tables reported RLS enabled; security advisors returned no findings. Performance advisors only reported informational missing foreign-key indexes and unused indexes on the new empty schema. Existing `auth.users` and storage buckets were empty before the migration.

**Migration ledger variance:** The Supabase MCP applied them as remote versions `20261012020555` and `20261012020607`. The CLI-created local files are `20261011205708_creator_alpha_initial.sql` and `20261011213129_creator_atomic_creation.sql`. **Do not run `supabase db push` against the development project until migration history is reconciled** in a separately reviewed procedure. Never rerun those CREATE TABLE statements on the existing schema.

## What is / isn't ready

- The protected demo-mode Vercel preview at the tested commit is READY and does not depend on a cloud account.
- The separate connected preview has preview-only Supabase environment variables configured.
- **No hosted Supabase Auth user or creator membership has been created yet**. Connected workflow needs a real adult Auth account plus trusted admin bootstrap per `docs/database/creator-alpha-first-adult-onboarding.md`; do not self-assign memberships.
- Vercel's deployment API returned `api-deployments-free-per-day` (100/day). A connected build may remain blocked until account quota resets or owner adjusts plan. Do not disable protections to publish.

## Browser acceptance gate before sharing outside the project

1. Verify Vercel deployment state READY and correct branch/commit, plus Vercel Authentication (or equivalent restricted access).
2. Sign in as an authorized adult with trusted membership, test create → save → independent browser reopen → edit → export.
3. Verify unassigned access denied and no data visible from other accounts. Keep developer data non-sensitive.
4. Review account and region configuration, backup recovery, dependency advisories, idempotency, and conflicting-device edits before broader exposure.

**Do not confuse a protected beta preview with a validated production system or a published learner experience.**
