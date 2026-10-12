# Creator Alpha: trusted first adult onboarding gate

**Status:** procedural runbook only, NOT executed on hosted Supabase. The authenticated Creator Beta is **not** yet live.
**Candidate development project:** `gblmcfatlfihcnvvqaan` (previously inspected as healthy and empty).

## Before any hosted action: separate approval required

Confirm all of the following **before** applying migrations or provisioning a person:

- Owner explicitly approves a development-only Creator Alpha rollout, target project and hosting region.
- Existing project is deliberately designated a development environment, never assumed production-ready because CI is green.
- Both reviewed CLI migrations from the latest integrated candidate match the deployed code (creator base schema and atomic creation RPC). Review `supabase migration list` and schema/advisors before and after any separately approved application.
- Auth email signup is **disabled on the hosted project**, not just `supabase/config.toml`; verify actual Auth settings through the dashboard/provider rather than assuming local settings transfer.
- Service-role / secret credentials stay exclusively in trusted administrative tooling, never in repository, logs, client code or `NEXT_PUBLIC_*` variables.
- Establish backup/export and restore procedure for any real creator drafts. Confirm Canada Central region and privacy requirements.
- No children, learner profiles, cohorts, learner evidence or real personal learning data.

## First adult creator: manual trusted bootstrap protocol

There is **no public creator registration**, and merely signing in must not grant a creator role. The bootstrap requires a trusted administrator.

1. Create/invite an approved **adult** Auth account via Supabase Auth's authorized admin interface. Confirm email ownership as appropriate. Do not request or store the person's password in ChatGPT or project documentation.
2. Retrieve the new Auth user UUID from the authoritative `auth.users` record in trusted tooling; do not guess. Record only the minimally required identity in the restricted admin system.
3. In an **approved, trusted database admin session only**, create the matching `public.profiles` record and `public.organization_memberships` role `creator` (or `owner` if explicitly approved). The OWLL development organization ID is `00000000-0000-4000-8000-000000000001` **only for this alpha schema**.
4. Verify the membership exists and exactly matches the Auth UUID and OWLL org. A signed-in unassigned adult must receive HTTP 403 on creator-only routes; no client may create or edit `organization_memberships`.
5. Perform actual sign-in in a **protected nonproduction preview**, not the public site. Confirm the profile, Journey library, create, edit, reopen, and export experience with test-only adult content.
6. Use a second adult test identity without access to the first one's Journeys, and one unassigned identity. Verify both **negative** permissions and allowed creator actions.
7. Confirm account revocation and recoverable Journey export procedure before adding additional creators.

Example restricted admin SQL **template only**; substitute UUID/email/display name from an authorized user record, never run with unverified identifiers:

```sql
-- Execute in a trusted SQL admin session, AFTER approved Auth account creation.
-- This intentionally cannot be run by the anon or authenticated client role.
BEGIN;
INSERT INTO public.profiles (id, display_name, email)
VALUES ('<verified-auth-user-uuid>'::uuid, '<approved-display-name>', '<verified-email>');
INSERT INTO public.organization_memberships (organization_id, profile_id, role)
VALUES (
 '00000000-0000-4000-8000-000000000001'::uuid,
 '<verified-auth-user-uuid>'::uuid,
 'creator'
);
COMMIT;
```

Use a fresh, auditable operator transaction and inspect the result. Do not expose credentials or raw `auth.users` data in public issue comments. Account bootstrap should eventually become a narrowly controlled admin flow, not a permanent manual workflow.

## Currently verified vs still unverified

- **Verified in isolated CI:** SQL migration and atomic rollback; synthetic adult RLS; TypeScript; combined save queue/Manifest in draft branches; local Supabase Auth + Data API integration is covered by PR #11's new workflow, but must be reviewed for final results.
- **Not yet verified on hosted infrastructure:** provider signup/confirmation settings, first account provisioning, actual sign-in, two-user isolation, protected preview, second physical device/browser and real end-to-end Manifest import/learner retrieval.
- **Not yet complete for durable production use:** duplicate retries after successful commit but lost HTTP response, multi-device concurrent edit conflict resolution, robust backup/restore, dependency security triage.

**Stop condition:** any unexpected public signup, RLS bypass, missing permission denial, unclear migration history, or absence of backups means do not activate Connected Mode.

No hosted database, Auth user, credentials, deployment, or schema records were changed in the creation of this runbook.
