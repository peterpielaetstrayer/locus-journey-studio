-- Guard against migration/schema drift from the existing Creator Beta adapter.
-- This validates DATABASE SHAPE only, not HTTP Auth or write semantics.
DO $$
DECLARE missing_columns text;
BEGIN
 WITH needed(t,c) AS (
  VALUES
  ('organizations','id'),('organizations','name'),
  ('organization_memberships','profile_id'),('organization_memberships','organization_id'),('organization_memberships','role'),
  ('profiles','id'),('profiles','display_name'),('profiles','email'),
  ('journeys','id'),('journeys','organization_id'),('journeys','slug'),('journeys','title'),
  ('journeys','region'),('journeys','location'),('journeys','created_by'),('journeys','updated_at'),
  ('journey_versions','id'),('journey_versions','journey_id'),('journey_versions','status'),
  ('journey_versions','central_question'),('journey_versions','subtitle'),
  ('journey_versions','description'),('journey_versions','audience'),
  ('journey_versions','duration_minutes'),('journey_versions','learning_domains'),
  ('journey_versions','prerequisite_concepts'),('journey_versions','artifact_template'),
  ('journey_versions','created_by'),('journey_versions','version_label'),
  ('journey_versions','created_at'),
  ('journey_stops','id'),('journey_stops','journey_version_id'),('journey_stops','position'),
  ('journey_stops','slug'),('journey_stops','title'),('journey_stops','location_label'),
  ('journey_stops','purpose'),('journey_stops','central_concept'),
  ('journey_stops','learning_objective'),('journey_stops','opening_prompt'),
  ('journey_stops','field_action'),('journey_stops','evidence_requirements'),
  ('journey_stops','safety_notes'),('journey_stops','accessibility_alternatives'),
  ('journey_stops','artifact_contribution'),('journey_stops','resurfacing_connection'),
  ('journey_stops','is_optional'),('journey_stops','is_hidden_until_unlocked'),
  ('journey_stops','updated_at'),
  ('audit_events','organization_id'),('audit_events','actor_profile_id'),('audit_events','action')
 )
 SELECT string_agg(needed.t || '.' || needed.c, ', ' ORDER BY needed.t, needed.c)
 INTO missing_columns
 FROM needed LEFT JOIN information_schema.columns c
 ON c.table_schema='public' AND c.table_name=needed.t AND c.column_name=needed.c
 WHERE c.column_name IS NULL;
 IF missing_columns IS NOT NULL THEN
   RAISE EXCEPTION 'Missing Creator Beta adapter columns: %', missing_columns;
 END IF;
 IF to_regprocedure('public.record_audit_event(uuid,text,uuid,text,jsonb)') IS NULL THEN
   RAISE EXCEPTION 'Expected Creator Beta audit RPC signature is absent';
 END IF;
END;
$$;
SELECT 'Creator Beta database adapter schema contract matches' AS check_result;
