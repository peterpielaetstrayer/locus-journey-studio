-- Atomic creator operation: execute only in disposable Postgres / Supabase test DB.
-- Requires the adult fixture identities and memberships from creator-only-rls-smoke.sql.
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);

DO $$
DECLARE
  v_before integer;
  v_id uuid;
  v_version uuid;
  v_stops jsonb := '[
    {"position":1,"slug":"notice","title":"Notice first","location_label":"Field",
     "opening_prompt":"What did you notice?","field_action":"Observe",
     "learning_objective":"Gather evidence","evidence_requirements":{"source":"demo"},
     "safety_notes":["Stay on trails"]},
    {"position":2,"slug":"reason","title":"Reason from evidence","location_label":"Field",
     "opening_prompt":"What explains the pattern?","field_action":"Compare",
     "learning_objective":"Make a claim","evidence_requirements":{"source":"demo"}}
  ]'::jsonb;
BEGIN
  SELECT count(*) INTO v_before FROM public.journeys;

  SELECT journey_id, version_id INTO v_id, v_version
  FROM public.create_creator_journey(
    'atomic-test-success','Atomic testing','Field',
    'What patterns can we explain?','Adult learner',
    'Test Journey','{"creatorBetaVersion":"0.2","threadType":"question"}'::jsonb,
    v_stops
  );
  IF v_id IS NULL OR v_version IS NULL THEN
    RAISE EXCEPTION 'Atomic creator RPC did not return both IDs';
  END IF;
  IF (SELECT count(*) FROM public.journeys) <> v_before + 1 THEN
    RAISE EXCEPTION 'Expected one new creator Journey';
  END IF;
  IF (SELECT count(*) FROM public.journey_stops
      WHERE journey_version_id=v_version) <> 2 THEN
    RAISE EXCEPTION 'Expected two persisted Encounters';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.audit_events
       WHERE entity_type='journey_version' AND entity_id=v_version) THEN
    RAISE EXCEPTION 'Expected one committed diagnostic audit';
  END IF;

  -- Force a UNIQUE(version,position) error after a prior Encounter insert.
  -- Entire RPC MUST roll back the Journey, version, and first Encounter.
  BEGIN
    PERFORM * FROM public.create_creator_journey(
      'atomic-test-must-rollback','Atomic failed','Field',
      'What went wrong?','Adults','Should leave no records',
      '{}'::jsonb,
      jsonb_build_array(
        jsonb_build_object(
          'position',1,'slug','first','title','First',
          'opening_prompt','First question','field_action','Look',
          'learning_objective','Notice'
        ),
        jsonb_build_object(
          'position',1,'slug','second','title','Second',
          'opening_prompt','Second question','field_action','Look',
          'learning_objective','Notice'
        )
      )
    );
    RAISE EXCEPTION 'Invalid Journey creation unexpectedly succeeded';
  EXCEPTION
    WHEN unique_violation THEN NULL;
  END;

  IF EXISTS (SELECT 1 FROM public.journeys
     WHERE slug='atomic-test-must-rollback') THEN
    RAISE EXCEPTION 'Atomic RPC left partial Journey after failed Encounter';
  END IF;

  -- Malformed payload also must create no records.
  BEGIN
    PERFORM * FROM public.create_creator_journey(
      'atomic-invalid-json','Bad payload','Field','Thread',
      'Adult','', '{}'::jsonb,'{}'::jsonb);
    RAISE EXCEPTION 'Invalid JSON unexpectedly succeeded';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;

  IF EXISTS (SELECT 1 FROM public.journeys
      WHERE slug='atomic-invalid-json') THEN
    RAISE EXCEPTION 'Invalid RPC request left an orphaned Journey';
  END IF;
END;
$$;

-- Authenticated non-member cannot create Journeys via privileged function.
SELECT set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',false);
DO $$
BEGIN
  BEGIN
    PERFORM * FROM public.create_creator_journey(
      'atomic-no-member','Unassigned','Field','Thread','Adult','',
      '{}'::jsonb,'[{"position":1}]'::jsonb
    );
    RAISE EXCEPTION 'Unassigned creator was allowed to create';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;
RESET ROLE;

SET ROLE anon;
DO $$
BEGIN
  BEGIN
    PERFORM * FROM public.create_creator_journey(
      'atomic-anon','Anonymous','Field','Thread','Adult','',
      '{}'::jsonb,'[{"position":1}]'::jsonb);
    RAISE EXCEPTION 'Anonymous was allowed to execute creator RPC';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;
RESET ROLE;

SELECT 'Atomic Journey creation and rollback checks passed' AS outcome;
