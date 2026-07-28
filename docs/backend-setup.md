# LOCUS Supabase Backend Setup

Prototype backend for **Connected Adult Creator Lab**. Anonymous Demo Mode works without these steps.

## Prerequisites

- Node.js 22+
- Supabase CLI (`npm install -D supabase`)
- **Migration/RLS validation:** GitHub Actions is the authoritative gate when local Docker is unavailable (see [Supabase Migration Validation](../.github/workflows/supabase-migration-validation.yml)). For optional local runs: Docker Desktop + `supabase start`.

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

Never commit `.env.local`. Never expose the service-role key in browser code or `NEXT_PUBLIC_*`.

## Migrations vs seed (important)

| Command | What it does |
|---------|----------------|
| `npm run db:push` | Applies migrations **only** to the linked project |
| `supabase db reset` | Local only: migrations + `supabase/seed.sql` |
| Manual seed | Run `supabase/seed.sql` via SQL editor or psql as postgres/service role |

`db push` does **not** load canonical demo rows. After first push, apply seed intentionally if you need OWLL fixture data.

## Apply schema (dry-run first)

```bash
npx supabase db push --dry-run
npm run db:push
```

Do not push until the **Supabase Migration Validation** GitHub Actions workflow passes on your PR (or a manual workflow dispatch). Locally, the same gate applies after `supabase test db` succeeds.

## First adult user (invite-only)

1. Supabase Dashboard → Authentication → **disable public signup**.
2. Create a user manually (invite or admin create). **Do not seed Auth users.**
3. Sign in once so `handle_new_user` creates a `profiles` row.
4. Attach membership (Dashboard SQL editor as postgres/service role):

```sql
insert into public.organization_memberships (organization_id, profile_id, role)
values
  ('00000000-0000-4000-8000-000000000001', 'YOUR_AUTH_USER_UUID', 'owner'),
  ('00000000-0000-4000-8000-000000000001', 'YOUR_AUTH_USER_UUID', 'creator'),
  ('00000000-0000-4000-8000-000000000001', 'YOUR_AUTH_USER_UUID', 'reviewer');
```

5. Visit `/login` and sign in. Creator, Orchestrator, Reviewer, and `/api/creator/*` require auth when Supabase is configured.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run db:push` | Push migrations to linked project |
| `npm run db:types` | Regenerate `src/types/database.types.ts` after push |
| `npm run db:test` | Run pgTAP RLS tests (local Docker, or rely on GitHub Actions) |

## Storage

Private bucket `field-media`. Path convention:

```text
{organization_id}/{owner_profile_id}/{journey_enrollment_id}/{uuid}-{filename}
```

Access is enforced via linked `media_assets` rows — not org-path alone.

Max upload 5MB; images only (`jpeg`, `png`, `webp`, `gif`).

## Modes

| Mode | When | Persistence |
|------|------|-------------|
| **Demo** | Supabase env absent | Zustand + localStorage |
| **Connected** | Env present + adult sign-in | Supabase Postgres + Storage |

Connected Mode **does not** silently fall back to local storage. Failures surface errors in the Creator toolbar.

## Permissions reference

See [permissions-matrix.md](./permissions-matrix.md).

## Validation

### Authoritative CI gate (no hosted project access)

Pull requests that touch `supabase/**`, repository/auth/API layers, or `src/types/database.types.ts` run the **Supabase Migration Validation** workflow. It:

1. Starts an isolated local Supabase stack in GitHub Actions (Docker on `ubuntu-latest`)
2. Runs `supabase db reset` against **local only** — never `db push`, never links to hosted project
3. Executes all **48 pgTAP** assertions via `supabase test db`
4. Runs `supabase db lint --local --fail-on error`
5. Runs `npm run test`, `typecheck`, `lint`, and `build`

No repository secrets, service-role keys, or hosted database passwords are required. Failures upload logs as workflow artifacts.

Manual trigger: GitHub → Actions → **Supabase Migration Validation** → **Run workflow**.

### Local validation (optional; requires Docker)

```bash
npm run test
npm run typecheck
npm run lint
npm run build
supabase start
supabase db reset
npx supabase db lint --local --fail-on error
npm run db:test
npx supabase db push --dry-run
```

## Status

This prototype is **not production-ready** for minors, schools, public launch, or park deployment. Maximum journey approval status: **Private Adult Co-Design Walk**.
