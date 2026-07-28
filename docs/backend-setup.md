# LOCUS Supabase Backend Setup

Prototype backend for **Connected Adult Creator Lab**. Anonymous Demo Mode works without these steps.

## Prerequisites

- Node.js 22+
- Supabase CLI (`npm install -D supabase`)
- A Supabase project (linked) or local Docker for full RLS test coverage

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

Never commit `.env.local`. Never expose the service-role key in browser code or `NEXT_PUBLIC_*`.

## Apply schema

```bash
npm run db:push
```

Migrations live in `supabase/migrations/`. Seed data loads from `supabase/seed.sql` on `supabase db reset` (local).

## First adult user (invite-only)

1. In Supabase Dashboard → Authentication, **disable public signup** for production-like behavior.
2. Create a user manually (invite or admin create).
3. Sign in once so the `profiles` trigger creates a profile row.
4. Attach membership:

```sql
insert into public.organization_memberships (organization_id, profile_id, role)
values
  ('00000000-0000-4000-8000-000000000001', 'YOUR_AUTH_USER_UUID', 'owner'),
  ('00000000-0000-4000-8000-000000000001', 'YOUR_AUTH_USER_UUID', 'creator'),
  ('00000000-0000-4000-8000-000000000001', 'YOUR_AUTH_USER_UUID', 'reviewer');
```

5. Visit `/login` and sign in. Creator, Orchestrator, and Reviewer routes require auth when Supabase is configured.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run db:push` | Push migrations to linked project |
| `npm run db:types` | Regenerate `src/types/database.types.ts` |
| `npm run db:test` | Run pgTAP database tests (requires local Supabase/Docker) |

## Storage

Private bucket `field-media` with path:

```text
{organization_id}/{owner_profile_id}/{journey_enrollment_id}/{uuid}-{filename}
```

Max upload 5MB; images only (`jpeg`, `png`, `webp`, `gif`).

## Modes

| Mode | When | Persistence |
|------|------|-------------|
| **Demo** | Supabase env absent | Zustand + localStorage |
| **Connected** | Env present + adult sign-in | Supabase Postgres + Storage |

If Supabase is configured but unreachable, the app falls back to Demo adapters where practical.

## Vercel deployment

Set the same two `NEXT_PUBLIC_*` variables in Vercel project settings.

Auth redirect URLs (Supabase Dashboard → Authentication → URL configuration):

- Site URL: your production domain
- Redirect URLs: `https://your-domain/**`, preview URLs as needed

Verify:

1. Demo gateway loads without auth
2. `/login` works for invited adult
3. Creator draft save returns timestamp
4. Protected routes redirect when signed out

## Validation limitations

If Docker is unavailable locally, `supabase test db` may not run. Use linked-project manual verification and the anonymous RLS pgTAP check. Full multi-user RLS proofs require local Supabase or staged auth fixtures.

## Status

This prototype is **not production-ready** for minors, schools, public launch, or park deployment. Maximum journey approval status: **Private Adult Co-Design Walk**.
