-- LOCUS Creator Beta: ADULT-ONLY, REVIEW-ONLY proposed migration, NOT active.
-- DO NOT run on a hosted database without separate approval and SQL/RLS review.
-- This is intentionally OUTSIDE supabase/migrations. The old 18-table initial
-- migration in supabase/migrations must be replaced/segregated before a CLI push.
--
-- Seven tables preserving the current Creator Beta repository adapter contract:
-- organizations, profiles, organization_memberships, journeys,
-- journey_versions, journey_stops, audit_events.
-- No learner profiles, youth/cohorts, enrollments, field notes or media.
-- PostgreSQL 17 / Supabase Auth. One trusted organization, adult authors only.
-- Non-idempotent by design: intended for a fresh database once approved.
BEGIN;

CREATE TYPE public.org_role AS ENUM (
  'owner', 'creator', 'orchestrator', 'reviewer', 'admin'
);
CREATE TYPE public.journey_version_status AS ENUM (
  'concept', 'draft', 'field_test', 'private_adult_walk',
  'learner_pilot', 'published', 'archived'
);

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  email text NOT NULL,
  avatar_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.org_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, profile_id, role)
);
CREATE INDEX idx_creator_memberships_profile
  ON public.organization_memberships (profile_id, organization_id);

CREATE TABLE public.journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  region text NOT NULL,
  location text NOT NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  current_published_version_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, slug)
);
CREATE INDEX idx_creator_journeys_owner
  ON public.journeys (created_by, organization_id);

CREATE TABLE public.journey_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  version_label text NOT NULL,
  status public.journey_version_status NOT NULL DEFAULT 'draft',
  central_question text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  audience text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 90,
  learning_domains text[] NOT NULL DEFAULT '{}',
  enduring_understandings text[] NOT NULL DEFAULT '{}',
  prerequisite_concepts text[] NOT NULL DEFAULT '{}',
  artifact_template jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  supersedes_version_id uuid REFERENCES public.journey_versions(id) ON DELETE SET NULL
);
CREATE INDEX idx_creator_versions_parent
  ON public.journey_versions (journey_id, created_at DESC);

ALTER TABLE public.journeys
  ADD CONSTRAINT journeys_current_published_version_fk
  FOREIGN KEY (current_published_version_id)
  REFERENCES public.journey_versions(id) ON DELETE SET NULL;

CREATE TABLE public.journey_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_version_id uuid NOT NULL REFERENCES public.journey_versions(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position > 0),
  slug text NOT NULL,
  title text NOT NULL,
  location_label text NOT NULL,
  purpose text NOT NULL,
  central_concept text NOT NULL,
  learning_objective text NOT NULL,
  opening_prompt text NOT NULL,
  field_action text NOT NULL,
  evidence_requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
  mentor_interventions jsonb NOT NULL DEFAULT '[]'::jsonb,
  safety_notes text[] NOT NULL DEFAULT '{}',
  accessibility_alternatives text[] NOT NULL DEFAULT '{}',
  artifact_contribution text,
  resurfacing_connection text,
  is_optional boolean NOT NULL DEFAULT false,
  is_hidden_until_unlocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (journey_version_id, position),
  UNIQUE (journey_version_id, slug)
);
CREATE INDEX idx_creator_stops_parent
  ON public.journey_stops (journey_version_id, position);

CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_creator_audit_by_org
  ON public.audit_events (organization_id, created_at DESC);

-- This fixed non-sensitive organization is required by the existing adapter.
-- NO user, membership, learner, cohort, or demo records are created here.
INSERT INTO public.organizations (id, name, slug)
VALUES ('00000000-0000-4000-8000-000000000001',
        'Open World Learning Lab', 'owll');

-- Role checks need to inspect protected membership rows without exposing them.
-- Privileged helpers are limited to a NON-exposed schema and verify auth.uid().
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE FUNCTION private.is_org_member(org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.organization_memberships m
    WHERE m.organization_id = org_id
      AND m.profile_id = (SELECT auth.uid())
  );
$$;

CREATE FUNCTION private.has_creator_role(org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT (SELECT auth.uid()) IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.organization_memberships m
    WHERE m.organization_id = org_id
      AND m.profile_id = (SELECT auth.uid())
      AND m.role IN ('owner', 'admin', 'creator')
  );
$$;

REVOKE ALL ON FUNCTION private.is_org_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_creator_role(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_org_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_creator_role(uuid) TO authenticated;

-- Defense in depth: RLS on EVERY table in the exposed public schema.
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Avoid relying on Supabase API auto-exposure defaults.
REVOKE ALL ON TABLE public.organizations, public.profiles,
  public.organization_memberships, public.journeys,
  public.journey_versions, public.journey_stops, public.audit_events
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.organizations,
  public.organization_memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles,
  public.journeys, public.journey_versions, public.journey_stops
TO authenticated;
GRANT SELECT, INSERT ON TABLE public.audit_events TO authenticated;

CREATE POLICY profiles_select_self ON public.profiles FOR SELECT
TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY profiles_insert_self ON public.profiles FOR INSERT
TO authenticated WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE
TO authenticated USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY organizations_select_member ON public.organizations FOR SELECT
TO authenticated USING (private.is_org_member(id));
CREATE POLICY memberships_select_self ON public.organization_memberships FOR SELECT
TO authenticated USING (profile_id = (SELECT auth.uid()));
-- Membership creation/updates are ADMIN BOOTSTRAP ONLY, never client-accessible.

-- Unlike the full institutional schema, early Creator Beta Journeys are
-- strictly PRIVATE TO THEIR CREATOR even within the same organization.
CREATE POLICY journeys_select_owner ON public.journeys FOR SELECT
TO authenticated USING (
  created_by = (SELECT auth.uid())
  AND private.has_creator_role(organization_id)
);
CREATE POLICY journeys_insert_owner ON public.journeys FOR INSERT
TO authenticated WITH CHECK (
  created_by = (SELECT auth.uid())
  AND private.has_creator_role(organization_id)
);
CREATE POLICY journeys_update_owner ON public.journeys FOR UPDATE
TO authenticated USING (
  created_by = (SELECT auth.uid())
  AND private.has_creator_role(organization_id)
) WITH CHECK (
  created_by = (SELECT auth.uid())
  AND private.has_creator_role(organization_id)
);

CREATE POLICY versions_select_owner ON public.journey_versions FOR SELECT
TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.journeys j
    WHERE j.id = journey_id AND j.created_by = (SELECT auth.uid())
  )
);
CREATE POLICY versions_insert_draft ON public.journey_versions FOR INSERT
TO authenticated WITH CHECK (
  status IN ('concept', 'draft', 'field_test', 'private_adult_walk')
  AND created_by = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.journeys j
    WHERE j.id = journey_id AND j.created_by = (SELECT auth.uid())
  )
);
CREATE POLICY versions_update_draft ON public.journey_versions FOR UPDATE
TO authenticated USING (
  status IN ('concept', 'draft', 'field_test', 'private_adult_walk')
  AND EXISTS (
    SELECT 1 FROM public.journeys j
    WHERE j.id = journey_id AND j.created_by = (SELECT auth.uid())
  )
) WITH CHECK (
  status IN ('concept', 'draft', 'field_test', 'private_adult_walk')
  AND EXISTS (
    SELECT 1 FROM public.journeys j
    WHERE j.id = journey_id AND j.created_by = (SELECT auth.uid())
  )
);

CREATE POLICY stops_select_owner ON public.journey_stops FOR SELECT
TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.journey_versions v
    JOIN public.journeys j ON j.id = v.journey_id
    WHERE v.id = journey_version_id AND j.created_by = (SELECT auth.uid())
  )
);
CREATE POLICY stops_insert_draft ON public.journey_stops FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.journey_versions v
    JOIN public.journeys j ON j.id = v.journey_id
    WHERE v.id = journey_version_id
      AND v.status IN ('concept', 'draft', 'field_test', 'private_adult_walk')
      AND j.created_by = (SELECT auth.uid())
  )
);
CREATE POLICY stops_update_draft ON public.journey_stops FOR UPDATE
TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.journey_versions v
    JOIN public.journeys j ON j.id = v.journey_id
    WHERE v.id = journey_version_id
      AND v.status IN ('concept', 'draft', 'field_test', 'private_adult_walk')
      AND j.created_by = (SELECT auth.uid())
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.journey_versions v
    JOIN public.journeys j ON j.id = v.journey_id
    WHERE v.id = journey_version_id
      AND v.status IN ('concept', 'draft', 'field_test', 'private_adult_walk')
      AND j.created_by = (SELECT auth.uid())
  )
);

-- Diagnostic creator audit, NOT a tamper-proof institutional compliance log.
CREATE POLICY audit_select_actor ON public.audit_events FOR SELECT
TO authenticated USING (actor_profile_id = (SELECT auth.uid()));
CREATE POLICY audit_insert_actor ON public.audit_events FOR INSERT
TO authenticated WITH CHECK (
  actor_profile_id = (SELECT auth.uid())
  AND private.has_creator_role(organization_id)
);

-- Existing Creator Beta server adapter calls db.rpc('record_audit_event').
-- Invoker security means all writes still pass through RLS.
CREATE FUNCTION public.record_audit_event(
  p_organization_id uuid, p_entity_type text, p_entity_id uuid,
  p_action text, p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE new_id uuid;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR
     NOT private.has_creator_role(p_organization_id) THEN
    RAISE EXCEPTION 'Not permitted to create creator audit event';
  END IF;
  INSERT INTO public.audit_events
    (organization_id, actor_profile_id, entity_type, entity_id, action, metadata)
  VALUES
    (p_organization_id, (SELECT auth.uid()), p_entity_type,
     p_entity_id, p_action, p_metadata)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;
REVOKE ALL ON FUNCTION public.record_audit_event(
  uuid, text, uuid, text, jsonb
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_audit_event(
  uuid, text, uuid, text, jsonb
) TO authenticated;

COMMIT;
