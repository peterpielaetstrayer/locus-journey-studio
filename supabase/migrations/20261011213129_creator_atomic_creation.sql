-- Creator Alpha review-only transactional Journey creation.
-- NOT active until a Supabase-CLI-created migration includes this file.
-- A PostgreSQL function executes atomically within a single RPC transaction.
-- Always SECURITY INVOKER: RLS applies to all new rows.
CREATE OR REPLACE FUNCTION public.create_creator_journey(
  p_slug text,
  p_title text,
  p_location text,
  p_thread text,
  p_audience text,
  p_description text,
  p_version_meta jsonb,
  p_stops jsonb
)
RETURNS TABLE(journey_id uuid, version_id uuid)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_owner uuid := (SELECT auth.uid());
  v_org uuid := '00000000-0000-4000-8000-000000000001'::uuid;
  v_journey_id uuid;
  v_version_id uuid;
  v_stop jsonb;
  v_stop_count integer;
BEGIN
  IF v_owner IS NULL OR NOT private.has_creator_role(v_org) THEN
    RAISE EXCEPTION 'Creator membership required' USING ERRCODE='42501';
  END IF;

  IF p_slug IS NULL OR length(p_slug) > 80
     OR p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
    RAISE EXCEPTION 'Invalid Journey slug' USING ERRCODE='22023';
  END IF;
  IF p_title IS NULL OR length(btrim(p_title)) = 0 OR length(p_title) > 200
     OR p_thread IS NULL OR length(btrim(p_thread)) = 0 THEN
    RAISE EXCEPTION 'Title and Journey Thread are required' USING ERRCODE='22023';
  END IF;
  IF p_version_meta IS NULL OR jsonb_typeof(p_version_meta) <> 'object'
     OR p_stops IS NULL OR jsonb_typeof(p_stops) <> 'array' THEN
    RAISE EXCEPTION 'Invalid Journey metadata or Encounter list' USING ERRCODE='22023';
  END IF;
  v_stop_count := jsonb_array_length(p_stops);
  IF v_stop_count NOT BETWEEN 1 AND 32 THEN
    RAISE EXCEPTION 'Between 1 and 32 Encounters required' USING ERRCODE='22023';
  END IF;

  INSERT INTO public.journeys (
    organization_id, slug, title, region, location, created_by
  ) VALUES (
    v_org, p_slug, p_title, 'General', COALESCE(NULLIF(btrim(p_location), ''), 'Unspecified'), v_owner
  ) RETURNING id INTO v_journey_id;

  INSERT INTO public.journey_versions (
    journey_id, version_label, status, central_question, subtitle,
    description, audience, artifact_template, created_by
  ) VALUES (
    v_journey_id, 'Creator Beta draft', 'draft', p_thread, '',
    COALESCE(p_description,''), COALESCE(p_audience,''), p_version_meta, v_owner
  ) RETURNING id INTO v_version_id;

  FOR v_stop IN SELECT value FROM jsonb_array_elements(p_stops) LOOP
    IF jsonb_typeof(v_stop) <> 'object' OR
       NOT (v_stop ? 'position' AND v_stop ? 'title' AND
            v_stop ? 'slug' AND v_stop ? 'opening_prompt' AND
            v_stop ? 'field_action' AND v_stop ? 'learning_objective') THEN
      RAISE EXCEPTION 'Malformed Encounter' USING ERRCODE='22023';
    END IF;

    INSERT INTO public.journey_stops (
      journey_version_id, position, slug, title, location_label,
      purpose, central_concept, learning_objective, opening_prompt,
      field_action, evidence_requirements, safety_notes,
      accessibility_alternatives, artifact_contribution,
      resurfacing_connection, is_optional, is_hidden_until_unlocked
    ) VALUES (
      v_version_id, (v_stop->>'position')::integer,
      v_stop->>'slug', v_stop->>'title',
      COALESCE(v_stop->>'location_label',''),
      COALESCE(v_stop->>'purpose',''), COALESCE(v_stop->>'central_concept',''),
      v_stop->>'learning_objective', v_stop->>'opening_prompt',
      v_stop->>'field_action', COALESCE(v_stop->'evidence_requirements','{}'::jsonb),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(v_stop->'safety_notes','[]'::jsonb))),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(v_stop->'accessibility_alternatives','[]'::jsonb))),
      v_stop->>'artifact_contribution', v_stop->>'resurfacing_connection',
      COALESCE((v_stop->>'is_optional')::boolean,false),
      COALESCE((v_stop->>'is_hidden_until_unlocked')::boolean,false)
    );
  END LOOP;

  PERFORM public.record_audit_event(
    v_org, 'journey_version', v_version_id, 'version_created',
    jsonb_build_object('source','creator-beta','encounterCount',v_stop_count)
  );

  RETURN QUERY SELECT v_journey_id, v_version_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_creator_journey(
  text,text,text,text,text,text,jsonb,jsonb
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_creator_journey(
  text,text,text,text,text,text,jsonb,jsonb
) TO authenticated;
