-- LOCUS Journey Studio initial schema with hardened RLS
-- See docs/permissions-matrix.md for role × table access.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.org_role as enum (
  'owner',
  'creator',
  'orchestrator',
  'reviewer',
  'admin'
);

create type public.journey_version_status as enum (
  'concept',
  'draft',
  'field_test',
  'private_adult_walk',
  'learner_pilot',
  'published',
  'archived'
);

create type public.field_note_visibility as enum ('private', 'mentor', 'artifact');

create type public.adaptation_profile as enum ('curious', 'movement', 'structured');

create type public.review_category as enum (
  'learning_design',
  'factual',
  'sources',
  'safety',
  'accessibility',
  'field_test',
  'maintenance'
);

create type public.media_visibility as enum ('private', 'mentor', 'artifact', 'organization');

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  email text not null,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.org_role not null,
  created_at timestamptz not null default now(),
  unique (organization_id, profile_id, role)
);

create index idx_org_memberships_org on public.organization_memberships (organization_id);
create index idx_org_memberships_profile on public.organization_memberships (profile_id);

create table public.learner_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  display_name text not null,
  age_band text not null,
  interests text[] not null default '{}',
  strengths text[] not null default '{}',
  growth_areas text[] not null default '{}',
  preferred_capture_modes text[] not null default '{}',
  accessibility_preferences text[] not null default '{}',
  identity_pathways text[] not null default '{}',
  adaptation_profile public.adaptation_profile not null default 'curious',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_learner_profiles_org on public.learner_profiles (organization_id);

create table public.journeys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  slug text not null,
  title text not null,
  region text not null,
  location text not null,
  created_by uuid references public.profiles (id) on delete set null,
  current_published_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create index idx_journeys_org on public.journeys (organization_id);

create table public.journey_versions (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys (id) on delete cascade,
  version_label text not null,
  status public.journey_version_status not null default 'draft',
  central_question text not null,
  subtitle text not null default '',
  description text not null default '',
  audience text not null default '',
  duration_minutes integer not null default 90,
  learning_domains text[] not null default '{}',
  enduring_understandings text[] not null default '{}',
  prerequisite_concepts text[] not null default '{}',
  artifact_template jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  supersedes_version_id uuid references public.journey_versions (id) on delete set null
);

create index idx_journey_versions_journey on public.journey_versions (journey_id);
create index idx_journey_versions_status on public.journey_versions (status);

alter table public.journeys
  add constraint journeys_current_published_version_fk
  foreign key (current_published_version_id)
  references public.journey_versions (id) on delete set null;

create table public.journey_stops (
  id uuid primary key default gen_random_uuid(),
  journey_version_id uuid not null references public.journey_versions (id) on delete cascade,
  position integer not null,
  slug text not null,
  title text not null,
  location_label text not null,
  purpose text not null,
  central_concept text not null,
  learning_objective text not null,
  opening_prompt text not null,
  field_action text not null,
  evidence_requirements jsonb not null default '[]'::jsonb,
  mentor_interventions jsonb not null default '[]'::jsonb,
  safety_notes text[] not null default '{}',
  accessibility_alternatives text[] not null default '{}',
  artifact_contribution text,
  resurfacing_connection text,
  is_optional boolean not null default false,
  is_hidden_until_unlocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (journey_version_id, position),
  unique (journey_version_id, slug)
);

create index idx_journey_stops_version on public.journey_stops (journey_version_id);

create table public.adaptive_branches (
  id uuid primary key default gen_random_uuid(),
  journey_stop_id uuid not null references public.journey_stops (id) on delete cascade,
  name text not null,
  learner_type text not null,
  activation_type text not null,
  trigger_description text not null,
  prompt text not null,
  action text not null,
  evidence_expectation text not null,
  return_to_core boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_adaptive_branches_stop on public.adaptive_branches (journey_stop_id);

create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  journey_version_id uuid not null references public.journey_versions (id) on delete restrict,
  name text not null,
  status text not null default 'active',
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_cohorts_org on public.cohorts (organization_id);

create table public.cohort_memberships (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  learner_profile_id uuid not null references public.learner_profiles (id) on delete cascade,
  assigned_orchestrator_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (cohort_id, learner_profile_id)
);

create index idx_cohort_memberships_cohort on public.cohort_memberships (cohort_id);
create index idx_cohort_memberships_learner on public.cohort_memberships (learner_profile_id);
create index idx_cohort_memberships_orchestrator on public.cohort_memberships (assigned_orchestrator_id);

create table public.journey_enrollments (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  learner_profile_id uuid not null references public.learner_profiles (id) on delete cascade,
  journey_version_id uuid not null references public.journey_versions (id) on delete restrict,
  status text not null default 'active',
  current_stop_id uuid references public.journey_stops (id) on delete set null,
  started_at timestamptz,
  meaningfully_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cohort_id, learner_profile_id)
);

create index idx_enrollments_cohort on public.journey_enrollments (cohort_id);
create index idx_enrollments_learner on public.journey_enrollments (learner_profile_id);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  owner_profile_id uuid not null references public.profiles (id) on delete cascade,
  journey_enrollment_id uuid references public.journey_enrollments (id) on delete set null,
  bucket text not null,
  object_path text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  alt_text text not null default '',
  visibility public.media_visibility not null default 'private',
  created_at timestamptz not null default now(),
  unique (bucket, object_path)
);

create index idx_media_assets_org on public.media_assets (organization_id);
create index idx_media_assets_owner on public.media_assets (owner_profile_id);
create index idx_media_assets_enrollment on public.media_assets (journey_enrollment_id);

create table public.field_notes (
  id uuid primary key default gen_random_uuid(),
  journey_enrollment_id uuid not null references public.journey_enrollments (id) on delete cascade,
  journey_stop_id uuid not null references public.journey_stops (id) on delete restrict,
  learner_profile_id uuid not null references public.learner_profiles (id) on delete cascade,
  created_by_profile_id uuid references public.profiles (id) on delete set null,
  capture_type text not null,
  media_asset_id uuid references public.media_assets (id) on delete set null,
  observation text not null,
  inference text,
  hypothesis text,
  evidence jsonb not null default '[]'::jsonb,
  alternative_explanation text,
  confidence integer not null check (confidence between 1 and 4),
  question text,
  visibility public.field_note_visibility not null default 'mentor',
  mentor_reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_field_notes_enrollment on public.field_notes (journey_enrollment_id);
create index idx_field_notes_learner on public.field_notes (learner_profile_id);

create table public.mentor_interventions (
  id uuid primary key default gen_random_uuid(),
  journey_enrollment_id uuid not null references public.journey_enrollments (id) on delete cascade,
  journey_stop_id uuid references public.journey_stops (id) on delete set null,
  learner_profile_id uuid not null references public.learner_profiles (id) on delete cascade,
  created_by_profile_id uuid references public.profiles (id) on delete set null,
  category text not null,
  recommendation_source text not null,
  reason text not null,
  message text not null,
  status text not null default 'recommended',
  override_reason text,
  delivered_at timestamptz,
  learner_response text,
  outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_interventions_enrollment on public.mentor_interventions (journey_enrollment_id);
create index idx_interventions_learner on public.mentor_interventions (learner_profile_id);

create table public.artifacts (
  id uuid primary key default gen_random_uuid(),
  journey_enrollment_id uuid not null references public.journey_enrollments (id) on delete cascade,
  learner_profile_id uuid not null references public.learner_profiles (id) on delete cascade,
  journey_version_id uuid not null references public.journey_versions (id) on delete restrict,
  title text not null,
  selected_media_asset_id uuid references public.media_assets (id) on delete set null,
  original_hypothesis text not null,
  strongest_evidence jsonb not null default '[]'::jsonb,
  revised_explanation text not null,
  systems_map jsonb not null default '{}'::jsonb,
  remaining_question text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_artifacts_enrollment on public.artifacts (journey_enrollment_id);

create table public.resurfacing_events (
  id uuid primary key default gen_random_uuid(),
  journey_enrollment_id uuid not null references public.journey_enrollments (id) on delete cascade,
  learner_profile_id uuid not null references public.learner_profiles (id) on delete cascade,
  source_journey_version_id uuid not null references public.journey_versions (id) on delete restrict,
  trigger_type text not null,
  scheduled_at timestamptz,
  prompt text not null,
  source_media_asset_id uuid references public.media_assets (id) on delete set null,
  prior_response_hidden boolean not null default true,
  learner_response text,
  connected_journey_id uuid references public.journeys (id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.journey_reviews (
  id uuid primary key default gen_random_uuid(),
  journey_version_id uuid not null references public.journey_versions (id) on delete cascade,
  reviewer_profile_id uuid not null references public.profiles (id) on delete cascade,
  category public.review_category not null,
  status text not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (journey_version_id, reviewer_profile_id, category)
);

create index idx_journey_reviews_version on public.journey_reviews (journey_version_id);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_profile_id uuid references public.profiles (id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_events_org on public.audit_events (organization_id);
create index idx_audit_events_entity on public.audit_events (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Private RLS helper schema (not exposed via Data API)
-- ---------------------------------------------------------------------------

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to postgres, authenticated, service_role;

create or replace function private.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = org_id
      and om.profile_id = (select auth.uid())
  );
$$;

create or replace function private.has_org_role(org_id uuid, roles public.org_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = org_id
      and om.profile_id = (select auth.uid())
      and om.role = any (roles)
  );
$$;

create or replace function private.is_org_admin(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_org_role(org_id, array['owner', 'admin']::public.org_role[]);
$$;

create or replace function private.is_assigned_orchestrator(p_cohort_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.cohort_memberships cm
    where cm.cohort_id = p_cohort_id
      and cm.assigned_orchestrator_id = (select auth.uid())
  );
$$;

create or replace function private.enrollment_cohort_id(p_enrollment_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select je.cohort_id
  from public.journey_enrollments je
  where je.id = p_enrollment_id;
$$;

create or replace function private.enrollment_org_id(p_enrollment_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select c.organization_id
  from public.journey_enrollments je
  join public.cohorts c on c.id = je.cohort_id
  where je.id = p_enrollment_id;
$$;

create or replace function private.is_assigned_orchestrator_for_enrollment(p_enrollment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_assigned_orchestrator(private.enrollment_cohort_id(p_enrollment_id));
$$;

create or replace function private.journey_version_org_id(p_version_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select j.organization_id
  from public.journey_versions jv
  join public.journeys j on j.id = jv.journey_id
  where jv.id = p_version_id;
$$;

create or replace function private.journey_org_id(p_journey_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select organization_id from public.journeys where id = p_journey_id;
$$;

create or replace function private.journey_version_is_editable(p_version_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select jv.status in (
    'concept', 'draft', 'field_test', 'private_adult_walk'
  )
  from public.journey_versions jv
  where jv.id = p_version_id;
$$;

create or replace function private.can_read_cohort(p_cohort_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.cohorts c
    where c.id = p_cohort_id
      and (
        private.is_org_admin(c.organization_id)
        or private.is_assigned_orchestrator(p_cohort_id)
      )
  );
$$;

create or replace function private.can_read_learner_profile(p_learner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.learner_profiles lp
    where lp.id = p_learner_id
      and (
        private.is_org_admin(lp.organization_id)
        or exists (
          select 1
          from public.cohort_memberships cm
          join public.cohorts c on c.id = cm.cohort_id
          where cm.learner_profile_id = p_learner_id
            and cm.assigned_orchestrator_id = (select auth.uid())
        )
      )
  );
$$;

create or replace function private.can_read_enrollment(p_enrollment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.is_org_admin(private.enrollment_org_id(p_enrollment_id))
    or private.is_assigned_orchestrator_for_enrollment(p_enrollment_id);
$$;

create or replace function private.can_write_learner_delivery(p_enrollment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.can_read_enrollment(p_enrollment_id);
$$;

create or replace function private.can_read_field_note(
  p_enrollment_id uuid,
  p_created_by uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    p_created_by = (select auth.uid())
    or private.is_assigned_orchestrator_for_enrollment(p_enrollment_id)
    or private.is_org_admin(private.enrollment_org_id(p_enrollment_id));
$$;

create or replace function private.can_read_intervention(
  p_enrollment_id uuid,
  p_created_by uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    p_created_by = (select auth.uid())
    or private.is_assigned_orchestrator_for_enrollment(p_enrollment_id)
    or private.is_org_admin(private.enrollment_org_id(p_enrollment_id));
$$;

create or replace function private.can_read_media_asset(p_media_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.media_assets ma
    where ma.id = p_media_id
      and (
        ma.owner_profile_id = (select auth.uid())
        or private.is_org_admin(ma.organization_id)
        or (
          ma.journey_enrollment_id is not null
          and private.is_assigned_orchestrator_for_enrollment(ma.journey_enrollment_id)
        )
      )
  );
$$;

create or replace function private.storage_enrollment_from_path(path text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select nullif(split_part(path, '/', 3), '')::uuid;
$$;

create or replace function private.can_read_storage_object(p_bucket text, p_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.media_assets ma
    where ma.bucket = p_bucket
      and ma.object_path = p_path
      and (
        ma.owner_profile_id = (select auth.uid())
        or private.is_org_admin(ma.organization_id)
        or (
          ma.journey_enrollment_id is not null
          and private.is_assigned_orchestrator_for_enrollment(ma.journey_enrollment_id)
        )
      )
  );
$$;

create or replace function private.can_insert_storage_object(p_bucket text, p_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.media_assets ma
    where ma.bucket = p_bucket
      and ma.object_path = p_path
      and ma.owner_profile_id = (select auth.uid())
      and private.is_org_member(ma.organization_id)
      and (
        ma.journey_enrollment_id is null
        or private.can_write_learner_delivery(ma.journey_enrollment_id)
      )
  );
$$;

create or replace function private.can_delete_storage_object(p_bucket text, p_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.media_assets ma
    where ma.bucket = p_bucket
      and ma.object_path = p_path
      and (
        (
          ma.owner_profile_id = (select auth.uid())
          and private.is_org_member(ma.organization_id)
        )
        or private.is_org_admin(ma.organization_id)
      )
  );
$$;

create or replace function private.can_update_media_asset(p_media_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.media_assets ma
    where ma.id = p_media_id
      and (
        ma.owner_profile_id = (select auth.uid())
        or private.is_org_admin(ma.organization_id)
      )
  );
$$;

-- Revoke direct RPC exposure of private helpers
revoke all on all functions in schema private from public;
revoke all on all functions in schema private from anon;
grant execute on all functions in schema private to authenticated;
grant execute on all functions in schema private to service_role;

-- ---------------------------------------------------------------------------
-- Auth profile trigger
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Publishing and audit workflows (public RPC, validated)
-- ---------------------------------------------------------------------------

create or replace function public.record_audit_event(
  p_organization_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Unauthorized';
  end if;
  if not private.is_org_member(p_organization_id) then
    raise exception 'Forbidden';
  end if;
  if not private.has_org_role(
    p_organization_id,
    array['owner', 'admin', 'creator', 'orchestrator', 'reviewer']::public.org_role[]
  ) then
    raise exception 'Forbidden';
  end if;
  insert into public.audit_events (
    organization_id, actor_profile_id, entity_type, entity_id, action, metadata
  ) values (
    p_organization_id, (select auth.uid()), p_entity_type, p_entity_id, p_action, p_metadata
  )
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.publish_journey_version(p_version_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_journey_id uuid;
  v_org_id uuid;
  v_status public.journey_version_status;
  v_missing int;
begin
  if (select auth.uid()) is null then
    raise exception 'Unauthorized';
  end if;

  select jv.journey_id, jv.status, private.journey_version_org_id(p_version_id)
  into v_journey_id, v_status, v_org_id
  from public.journey_versions jv
  where jv.id = p_version_id;

  if v_journey_id is null then
    raise exception 'Version not found';
  end if;

  if not private.has_org_role(v_org_id, array['owner', 'admin']::public.org_role[]) then
    raise exception 'Forbidden';
  end if;

  if v_status in ('published', 'archived') then
    raise exception 'Version is already published or archived';
  end if;

  select count(*) into v_missing
  from (
    values
      ('learning_design'::public.review_category),
      ('factual'::public.review_category),
      ('safety'::public.review_category),
      ('accessibility'::public.review_category),
      ('field_test'::public.review_category)
  ) as required(category)
  where not exists (
    select 1
    from public.journey_reviews jr
    where jr.journey_version_id = p_version_id
      and jr.category = required.category
      and jr.status = 'approved'
  );

  if v_missing > 0 then
    raise exception 'Required review categories are not approved';
  end if;

  update public.journey_versions
  set status = 'published', published_at = now()
  where id = p_version_id;

  update public.journeys
  set current_published_version_id = p_version_id, updated_at = now()
  where id = v_journey_id;
end;
$$;

revoke all on function public.record_audit_event(uuid, text, uuid, text, jsonb) from public;
revoke all on function public.publish_journey_version(uuid) from public;
grant execute on function public.record_audit_event(uuid, text, uuid, text, jsonb) to authenticated;
grant execute on function public.publish_journey_version(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Immutability and publication guards
-- ---------------------------------------------------------------------------

create or replace function private.guard_journey_version_update()
returns trigger
language plpgsql
set search_path = public, private
as $$
declare
  v_org_id uuid;
begin
  v_org_id := private.journey_version_org_id(old.id);

  if old.status in ('published', 'archived') then
    raise exception 'Published and archived versions are immutable';
  end if;

  if new.status is distinct from old.status then
    if new.status in ('published', 'archived') then
      raise exception 'Use publish_journey_version() for publication';
    end if;
    if not private.has_org_role(v_org_id, array['owner', 'admin']::public.org_role[]) then
      if new.status not in ('concept', 'draft', 'field_test', 'private_adult_walk') then
        raise exception 'Creators may not exceed private_adult_walk status';
      end if;
    end if;
  end if;

  if new.published_at is distinct from old.published_at
    and not private.has_org_role(v_org_id, array['owner', 'admin']::public.org_role[]) then
    raise exception 'Only owner/admin may set published_at';
  end if;

  return new;
end;
$$;

create trigger journey_versions_guard_update
  before update on public.journey_versions
  for each row execute function private.guard_journey_version_update();

create or replace function private.guard_journey_published_pointer()
returns trigger
language plpgsql
set search_path = public, private
as $$
declare
  v_version_status public.journey_version_status;
  v_version_journey uuid;
begin
  if new.current_published_version_id is null then
    return new;
  end if;

  if not private.has_org_role(new.organization_id, array['owner', 'admin']::public.org_role[]) then
    raise exception 'Only owner/admin may set current_published_version_id';
  end if;

  select jv.status, jv.journey_id
  into v_version_status, v_version_journey
  from public.journey_versions jv
  where jv.id = new.current_published_version_id;

  if v_version_journey is distinct from new.id then
    raise exception 'Published version must belong to this journey';
  end if;

  if v_version_status is distinct from 'published' then
    raise exception 'current_published_version_id must reference a published version';
  end if;

  return new;
end;
$$;

create trigger journeys_guard_published_pointer
  before update on public.journeys
  for each row
  when (new.current_published_version_id is distinct from old.current_published_version_id)
  execute function private.guard_journey_published_pointer();

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.learner_profiles enable row level security;
alter table public.journeys enable row level security;
alter table public.journey_versions enable row level security;
alter table public.journey_stops enable row level security;
alter table public.adaptive_branches enable row level security;
alter table public.cohorts enable row level security;
alter table public.cohort_memberships enable row level security;
alter table public.journey_enrollments enable row level security;
alter table public.field_notes enable row level security;
alter table public.mentor_interventions enable row level security;
alter table public.artifacts enable row level security;
alter table public.resurfacing_events enable row level security;
alter table public.journey_reviews enable row level security;
alter table public.media_assets enable row level security;
alter table public.audit_events enable row level security;

-- ---------------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------------

-- profiles
create policy "profiles_select_own" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- organizations
create policy "organizations_select_member" on public.organizations for select to authenticated
  using (private.is_org_member(id));

-- organization_memberships
create policy "memberships_select_member" on public.organization_memberships for select to authenticated
  using (private.is_org_member(organization_id));
create policy "memberships_insert_admin" on public.organization_memberships for insert to authenticated
  with check (private.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));
create policy "memberships_update_admin" on public.organization_memberships for update to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));
create policy "memberships_delete_admin" on public.organization_memberships for delete to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

-- learner_profiles (delivery team + admin only)
create policy "learners_select_delivery" on public.learner_profiles for select to authenticated
  using (private.can_read_learner_profile(id));
create policy "learners_insert_admin" on public.learner_profiles for insert to authenticated
  with check (private.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));
create policy "learners_update_admin" on public.learner_profiles for update to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

-- journeys (architecture — org members)
create policy "journeys_select_member" on public.journeys for select to authenticated
  using (private.is_org_member(organization_id));
create policy "journeys_insert_creator" on public.journeys for insert to authenticated
  with check (private.has_org_role(organization_id, array['owner', 'admin', 'creator']::public.org_role[]));
create policy "journeys_update_creator" on public.journeys for update to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin', 'creator']::public.org_role[]));

-- journey_versions
create policy "journey_versions_select_member" on public.journey_versions for select to authenticated
  using (private.is_org_member(private.journey_version_org_id(id)));
create policy "journey_versions_insert_creator" on public.journey_versions for insert to authenticated
  with check (
    private.has_org_role(private.journey_org_id(journey_id), array['owner', 'admin', 'creator']::public.org_role[])
  );
create policy "journey_versions_update_editable" on public.journey_versions for update to authenticated
  using (
    private.has_org_role(private.journey_version_org_id(id), array['owner', 'admin', 'creator']::public.org_role[])
    and private.journey_version_is_editable(id)
  );

-- journey_stops
create policy "journey_stops_select_member" on public.journey_stops for select to authenticated
  using (private.is_org_member(private.journey_version_org_id(journey_version_id)));
create policy "journey_stops_mutate_editable" on public.journey_stops for all to authenticated
  using (
    private.has_org_role(
      private.journey_version_org_id(journey_version_id),
      array['owner', 'admin', 'creator']::public.org_role[]
    )
    and private.journey_version_is_editable(journey_version_id)
  )
  with check (
    private.has_org_role(
      private.journey_version_org_id(journey_version_id),
      array['owner', 'admin', 'creator']::public.org_role[]
    )
    and private.journey_version_is_editable(journey_version_id)
  );

-- adaptive_branches
create policy "branches_select_member" on public.adaptive_branches for select to authenticated
  using (
    private.is_org_member(
      private.journey_version_org_id(
        (select js.journey_version_id from public.journey_stops js where js.id = journey_stop_id)
      )
    )
  );
create policy "branches_mutate_editable" on public.adaptive_branches for all to authenticated
  using (
    private.has_org_role(
      private.journey_version_org_id(
        (select js.journey_version_id from public.journey_stops js where js.id = journey_stop_id)
      ),
      array['owner', 'admin', 'creator']::public.org_role[]
    )
    and private.journey_version_is_editable(
      (select js.journey_version_id from public.journey_stops js where js.id = journey_stop_id)
    )
  )
  with check (
    private.has_org_role(
      private.journey_version_org_id(
        (select js.journey_version_id from public.journey_stops js where js.id = journey_stop_id)
      ),
      array['owner', 'admin', 'creator']::public.org_role[]
    )
    and private.journey_version_is_editable(
      (select js.journey_version_id from public.journey_stops js where js.id = journey_stop_id)
    )
  );

-- cohorts (admin + assigned orchestrator)
create policy "cohorts_select_delivery" on public.cohorts for select to authenticated
  using (private.can_read_cohort(id));
create policy "cohorts_mutate_admin" on public.cohorts for all to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]))
  with check (private.has_org_role(organization_id, array['owner', 'admin']::public.org_role[]));

-- cohort_memberships
create policy "cohort_memberships_select_delivery" on public.cohort_memberships for select to authenticated
  using (
    private.can_read_cohort(cohort_id)
    or assigned_orchestrator_id = (select auth.uid())
  );
create policy "cohort_memberships_mutate_admin" on public.cohort_memberships for all to authenticated
  using (
    private.has_org_role(
      (select c.organization_id from public.cohorts c where c.id = cohort_id),
      array['owner', 'admin']::public.org_role[]
    )
  )
  with check (
    private.has_org_role(
      (select c.organization_id from public.cohorts c where c.id = cohort_id),
      array['owner', 'admin']::public.org_role[]
    )
  );

-- journey_enrollments
create policy "enrollments_select_delivery" on public.journey_enrollments for select to authenticated
  using (private.can_read_enrollment(id));
create policy "enrollments_mutate_delivery" on public.journey_enrollments for all to authenticated
  using (private.can_write_learner_delivery(id))
  with check (private.can_write_learner_delivery(id));

-- field_notes
create policy "field_notes_select" on public.field_notes for select to authenticated
  using (private.can_read_field_note(journey_enrollment_id, created_by_profile_id));
create policy "field_notes_insert" on public.field_notes for insert to authenticated
  with check (
    private.can_write_learner_delivery(journey_enrollment_id)
    and created_by_profile_id = (select auth.uid())
  );
create policy "field_notes_update" on public.field_notes for update to authenticated
  using (private.can_read_field_note(journey_enrollment_id, created_by_profile_id))
  with check (private.can_read_field_note(journey_enrollment_id, created_by_profile_id));

-- mentor_interventions
create policy "interventions_select" on public.mentor_interventions for select to authenticated
  using (private.can_read_intervention(journey_enrollment_id, created_by_profile_id));
create policy "interventions_insert" on public.mentor_interventions for insert to authenticated
  with check (
    private.can_write_learner_delivery(journey_enrollment_id)
    and created_by_profile_id = (select auth.uid())
  );
create policy "interventions_update" on public.mentor_interventions for update to authenticated
  using (private.can_read_intervention(journey_enrollment_id, created_by_profile_id))
  with check (private.can_read_intervention(journey_enrollment_id, created_by_profile_id));

-- artifacts
create policy "artifacts_select" on public.artifacts for select to authenticated
  using (private.can_read_enrollment(journey_enrollment_id));
create policy "artifacts_mutate" on public.artifacts for all to authenticated
  using (private.can_write_learner_delivery(journey_enrollment_id))
  with check (private.can_write_learner_delivery(journey_enrollment_id));

-- resurfacing_events
create policy "resurfacing_select" on public.resurfacing_events for select to authenticated
  using (private.can_read_enrollment(journey_enrollment_id));
create policy "resurfacing_mutate" on public.resurfacing_events for all to authenticated
  using (private.can_write_learner_delivery(journey_enrollment_id))
  with check (private.can_write_learner_delivery(journey_enrollment_id));

-- journey_reviews
create policy "reviews_select" on public.journey_reviews for select to authenticated
  using (private.is_org_member(private.journey_version_org_id(journey_version_id)));
create policy "reviews_insert_reviewer" on public.journey_reviews for insert to authenticated
  with check (
    private.has_org_role(
      private.journey_version_org_id(journey_version_id),
      array['owner', 'admin', 'reviewer']::public.org_role[]
    )
    and reviewer_profile_id = (select auth.uid())
  );
create policy "reviews_update_reviewer" on public.journey_reviews for update to authenticated
  using (
    reviewer_profile_id = (select auth.uid())
    and private.has_org_role(
      private.journey_version_org_id(journey_version_id),
      array['owner', 'admin', 'reviewer']::public.org_role[]
    )
  );

-- media_assets
create policy "media_select" on public.media_assets for select to authenticated
  using (private.can_read_media_asset(id));
create policy "media_insert" on public.media_assets for insert to authenticated
  with check (
    owner_profile_id = (select auth.uid())
    and private.is_org_member(organization_id)
    and (
      journey_enrollment_id is null
      or private.can_write_learner_delivery(journey_enrollment_id)
    )
  );
create policy "media_update" on public.media_assets for update to authenticated
  using (private.can_update_media_asset(id))
  with check (private.can_update_media_asset(id));
create policy "media_delete" on public.media_assets for delete to authenticated
  using (private.can_update_media_asset(id));

-- audit_events (read-only for members; writes via record_audit_event)
create policy "audit_select_admin" on public.audit_events for select to authenticated
  using (private.is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- Storage bucket (private)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'field-media',
  'field-media',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "field_media_insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'field-media'
    and private.can_insert_storage_object(bucket_id, name)
  );

create policy "field_media_select" on storage.objects for select to authenticated
  using (
    bucket_id = 'field-media'
    and private.can_read_storage_object(bucket_id, name)
  );

create policy "field_media_update" on storage.objects for update to authenticated
  using (
    bucket_id = 'field-media'
    and private.can_update_media_asset(
      (select ma.id from public.media_assets ma where ma.bucket = bucket_id and ma.object_path = name)
    )
  )
  with check (
    bucket_id = 'field-media'
    and private.can_update_media_asset(
      (select ma.id from public.media_assets ma where ma.bucket = bucket_id and ma.object_path = name)
    )
  );

create policy "field_media_delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'field-media'
    and private.can_delete_storage_object(bucket_id, name)
  );
