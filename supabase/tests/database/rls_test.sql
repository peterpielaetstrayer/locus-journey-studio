BEGIN;
SELECT plan(20);

-- All users are synthetic adult integration-test identities, with no learner data.
SELECT tests.create_auth_user('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'adult-a@test.invalid', 'Adult A');
SELECT tests.create_auth_user('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'adult-b@test.invalid', 'Adult B');
SELECT tests.create_auth_user('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'adult-c@test.invalid', 'Adult C');

INSERT INTO public.organization_memberships (organization_id, profile_id, role) VALUES
 ('00000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'creator'),
 ('00000000-0000-4000-8000-000000000001', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'creator');

INSERT INTO public.journeys
 (id, organization_id, slug, title, region, location, created_by)
VALUES
 ('11111111-1111-4111-8111-111111111111', '00000000-0000-4000-8000-000000000001', 'test-a', 'Adult A Journey', 'General', 'Indoor', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('22222222-2222-4222-8222-222222222222', '00000000-0000-4000-8000-000000000001', 'test-b', 'Adult B Journey', 'General', 'Museum', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

INSERT INTO public.journey_versions
 (id, journey_id, version_label, status, central_question, created_by)
VALUES
 ('11111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111', 'Draft', 'draft', 'What is water?', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('22222222-2222-4222-8222-222222222223', '22222222-2222-4222-8222-222222222222', 'Draft', 'draft', 'What is art?', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

INSERT INTO public.journey_stops
 (id, journey_version_id, position, slug, title, location_label, purpose,
  central_concept, learning_objective, opening_prompt, field_action)
VALUES
 ('11111111-1111-4111-8111-111111111113',
  '11111111-1111-4111-8111-111111111112', 1, 'observe', 'Observation A',
  'At home', 'Study a source', 'Observation', 'Develop a question', 'What do you see?', 'Observe'),
 ('22222222-2222-4222-8222-222222222224',
  '22222222-2222-4222-8222-222222222223', 1, 'observe', 'Observation B',
  'Museum', 'Study an exhibit', 'Observation', 'Develop a question', 'What do you see?', 'Observe');

SELECT is(
 (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity AND c.relname
  IN ('organizations','profiles','organization_memberships','journeys','journey_versions','journey_stops','audit_events')),
 7, 'RLS is enabled on all seven public alpha tables');

SELECT is(
 (SELECT count(*)::int FROM information_schema.tables
  WHERE table_schema='public' AND table_type='BASE TABLE'),
 7, 'creator alpha has exactly seven public application tables');

-- Browser anon must not receive SQL privileges.
SELECT tests.clear_authentication();
SET LOCAL ROLE anon;
SELECT throws_ok(
 $$ SELECT id FROM public.journeys $$, '42501', NULL,
 'anon cannot select creator Journeys');
RESET ROLE;

-- Authenticated creator A has access to own content and self profile.
SELECT tests.authenticate_as('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
SELECT is((SELECT count(*)::int FROM public.journeys), 1, 'A reads only their Journey');
SELECT is((SELECT count(*)::int FROM public.journey_versions), 1, 'A reads only their version');
SELECT is((SELECT count(*)::int FROM public.journey_stops), 1, 'A reads only their Encounter');
SELECT is((SELECT count(*)::int FROM public.profiles), 1, 'A reads only self profile');
SELECT is((SELECT count(*)::int FROM public.organization_memberships), 1, 'A reads only self membership');

SELECT lives_ok(
 $$ UPDATE public.journey_versions SET central_question = 'Revised inquiry'
    WHERE id='11111111-1111-4111-8111-111111111112' $$,
 'A can edit their own draft');
SELECT is((SELECT central_question FROM public.journey_versions WHERE
  id='11111111-1111-4111-8111-111111111112'),
 'Revised inquiry', 'A saved edit is readable');

SELECT throws_ok(
 $$ INSERT INTO public.journeys
   (organization_id,slug,title,region,location,created_by)
   VALUES ('00000000-0000-4000-8000-000000000001','forged',
   'Wrong owner','General','Home','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') $$,
 '42501', NULL, 'A cannot impersonate B as owner');

SELECT throws_ok(
 $$ INSERT INTO public.organization_memberships
   (organization_id,profile_id,role)
   VALUES ('00000000-0000-4000-8000-000000000001',
   'cccccccc-cccc-4ccc-8ccc-cccccccccccc','owner') $$,
 '42501', NULL, 'A cannot grant creator/admin membership');

SELECT throws_ok(
 $$ UPDATE public.journey_versions SET status='published'
   WHERE id='11111111-1111-4111-8111-111111111112' $$,
 '42501', NULL, 'A cannot publish a draft');

SELECT lives_ok(
 $$ SELECT public.record_audit_event(
   '00000000-0000-4000-8000-000000000001',
   'journey', '11111111-1111-4111-8111-111111111111',
   'saved', '{"synthetic":true}'::jsonb) $$,
 'A can write own diagnostic audit event');
SELECT is((SELECT count(*)::int FROM public.audit_events),1,
 'A reads only their diagnostic event');

-- B is a legitimate creator in the same OWLL organization: must remain isolated.
SELECT tests.authenticate_as('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
SELECT is((SELECT count(*)::int FROM public.journeys), 1,
 'B reads exactly their own Journey');
SELECT is((SELECT count(*)::int FROM public.journey_stops), 1,
 'B reads exactly their own Encounter');
SELECT is((SELECT count(*)::int FROM public.audit_events), 0,
 'B cannot read A diagnostic audit log');

-- C is signed in but has no trusted owner-created membership.
SELECT tests.authenticate_as('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
SELECT is((SELECT count(*)::int FROM public.journeys), 0,
 'Unassigned adult reads no Journeys');
SELECT throws_ok(
 $$ INSERT INTO public.journeys
   (organization_id,slug,title,region,location,created_by)
   VALUES ('00000000-0000-4000-8000-000000000001',
    'unassigned','Not allowed','General','Indoor',
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc') $$,
 '42501', NULL, 'Unassigned adult cannot create a Journey');

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
