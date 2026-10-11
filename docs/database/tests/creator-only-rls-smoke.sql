-- Synthetic ADULT ONLY permissions test for docs/database/creator-only-v0.1.proposed.sql.
-- Run against an EPHEMERAL PostgreSQL CI container, never a real Supabase database.
INSERT INTO auth.users(id) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc');

INSERT INTO public.profiles (id, display_name, email) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Adult Creator A', 'a@example.invalid'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Adult Creator B', 'b@example.invalid'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Unassigned Adult C', 'c@example.invalid');

INSERT INTO public.organization_memberships
 (organization_id, profile_id, role)
VALUES
 ('00000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'creator'),
 ('00000000-0000-4000-8000-000000000001', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'creator');

INSERT INTO public.journeys
 (id, organization_id, slug, title, region, location, created_by)
VALUES
 ('11111111-1111-4111-8111-111111111111', '00000000-0000-4000-8000-000000000001',
  'a-draft', 'A private Journey', 'General', 'Home', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('22222222-2222-4222-8222-222222222222', '00000000-0000-4000-8000-000000000001',
  'b-draft', 'B private Journey', 'General', 'Museum', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

INSERT INTO public.journey_versions
 (id, journey_id, version_label, status, central_question, created_by)
VALUES
 ('11111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111',
  'v1','draft','What can we learn here?', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('22222222-2222-4222-8222-222222222223','22222222-2222-4222-8222-222222222222',
  'v1','draft','How does this work?', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

INSERT INTO public.journey_stops
 (id, journey_version_id, position, slug, title,
  location_label, purpose, central_concept, learning_objective,
  opening_prompt, field_action)
VALUES
 ('11111111-1111-4111-8111-111111111113','11111111-1111-4111-8111-111111111112',
  1,'a-encounter','A Encounter','At Home','Examine a source',
  'Inquiry','Notice patterns','What stands out?','Observe it'),
 ('22222222-2222-4222-8222-222222222224','22222222-2222-4222-8222-222222222223',
  1,'b-encounter','B Encounter','At Museum','Examine an exhibit',
  'Inquiry','Notice differences','What changed?','Compare exhibits');

-- All protected tables must have RLS, regardless of grants.
DO $$
DECLARE cnt integer;
BEGIN
 SELECT count(*) INTO cnt
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relkind='r'
   AND c.relrowsecurity AND c.relname IN
   ('organizations','profiles','organization_memberships','journeys',
    'journey_versions','journey_stops','audit_events');
 IF cnt <> 7 THEN RAISE EXCEPTION 'Expected RLS on all seven tables, got %', cnt; END IF;
END;
$$;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);

DO $$
DECLARE n integer; audit_id uuid;
BEGIN
 SELECT count(*) INTO n FROM public.journeys;
 IF n <> 1 THEN RAISE EXCEPTION 'Creator A can access % Journeys, expected 1', n; END IF;
 SELECT count(*) INTO n FROM public.journey_versions;
 IF n <> 1 THEN RAISE EXCEPTION 'Creator A can access % versions, expected 1', n; END IF;
 SELECT count(*) INTO n FROM public.journey_stops;
 IF n <> 1 THEN RAISE EXCEPTION 'Creator A can access % Encounters, expected 1', n; END IF;
 SELECT count(*) INTO n FROM public.profiles;
 IF n <> 1 THEN RAISE EXCEPTION 'Creator A can access other profiles'; END IF;
 SELECT count(*) INTO n FROM public.organization_memberships;
 IF n <> 1 THEN RAISE EXCEPTION 'Creator A can access other memberships'; END IF;

 UPDATE public.journeys SET title='Attempted overwrite'
 WHERE id='22222222-2222-4222-8222-222222222222';
 GET DIAGNOSTICS n = ROW_COUNT;
 IF n <> 0 THEN RAISE EXCEPTION 'Creator A changed B Journey'; END IF;

 UPDATE public.journey_stops SET title='Attempted overwrite'
 WHERE id='22222222-2222-4222-8222-222222222224';
 GET DIAGNOSTICS n = ROW_COUNT;
 IF n <> 0 THEN RAISE EXCEPTION 'Creator A changed B Encounter'; END IF;

 BEGIN
   INSERT INTO public.journeys
    (organization_id,slug,title,region,location,created_by)
   VALUES ('00000000-0000-4000-8000-000000000001','forged',
    'Forged Owner','General','Home','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
   RAISE EXCEPTION 'Forged ownership was allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;

 BEGIN
   UPDATE public.journey_versions SET status='published'
   WHERE id='11111111-1111-4111-8111-111111111112';
   RAISE EXCEPTION 'Creator could publish a draft without review';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;

 BEGIN
   INSERT INTO public.organization_memberships
    (organization_id,profile_id,role)
   VALUES ('00000000-0000-4000-8000-000000000001',
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc','owner');
   RAISE EXCEPTION 'Client could assign privileged membership';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;

 audit_id := public.record_audit_event(
   '00000000-0000-4000-8000-000000000001',
   'journey','11111111-1111-4111-8111-111111111111',
   'test_saved','{"synthetic":true}'::jsonb);
 IF audit_id IS NULL THEN RAISE EXCEPTION 'Audit insert returned no ID'; END IF;
 SELECT count(*) INTO n FROM public.audit_events;
 IF n <> 1 THEN RAISE EXCEPTION 'Own diagnostic audit not readable'; END IF;
END;
$$;

-- A different creator in the SAME org must see ONLY their own records.
SELECT set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
DO $$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM public.journeys;
 IF n <> 1 THEN RAISE EXCEPTION 'Creator B saw % Journeys', n; END IF;
 SELECT count(*) INTO n FROM public.journey_stops;
 IF n <> 1 THEN RAISE EXCEPTION 'Creator B saw % Encounters', n; END IF;
 SELECT count(*) INTO n FROM public.audit_events;
 IF n <> 0 THEN RAISE EXCEPTION 'Creator B saw A diagnostic audit'; END IF;
END;
$$;

-- Signed-in but UNASSIGNED users cannot create Journeys.
SELECT set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',false);
DO $$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM public.journeys;
 IF n <> 0 THEN RAISE EXCEPTION 'Unassigned adult can read Journeys'; END IF;
 BEGIN
   INSERT INTO public.journeys
    (organization_id,slug,title,region,location,created_by)
   VALUES ('00000000-0000-4000-8000-000000000001','unassigned',
    'Should Fail','General','Home','cccccccc-cccc-4ccc-8ccc-cccccccccccc');
   RAISE EXCEPTION 'Unassigned adult created a Journey';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END;
$$;
RESET ROLE;

-- Anonymous requests must NOT have access to protected application tables.
SET ROLE anon;
DO $$
BEGIN
  BEGIN
    PERFORM 1 FROM public.journeys;
    RAISE EXCEPTION 'Anonymous reader could query protected Journeys';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;
RESET ROLE;

SELECT 'creator-only SQL smoke tests passed' AS outcome;
