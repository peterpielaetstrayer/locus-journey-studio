begin;

select plan(48);

-- ---------------------------------------------------------------------------
-- Fixture users
-- ---------------------------------------------------------------------------

select tests.create_auth_user('a0000000-0000-4000-8000-000000000001', 'owner-a@test.locus', 'Owner A');
select tests.create_auth_user('a0000000-0000-4000-8000-000000000002', 'admin-a@test.locus', 'Admin A');
select tests.create_auth_user('a0000000-0000-4000-8000-000000000003', 'creator-a@test.locus', 'Creator A');
select tests.create_auth_user('a0000000-0000-4000-8000-000000000004', 'orch-assigned@test.locus', 'Orch Assigned');
select tests.create_auth_user('a0000000-0000-4000-8000-000000000005', 'orch-free@test.locus', 'Orch Unassigned');
select tests.create_auth_user('a0000000-0000-4000-8000-000000000006', 'reviewer-a@test.locus', 'Reviewer A');
select tests.create_auth_user('b0000000-0000-4000-8000-000000000001', 'owner-b@test.locus', 'Owner B');

insert into public.organization_memberships (organization_id, profile_id, role) values
  ('00000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'owner'),
  ('00000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'admin'),
  ('00000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 'creator'),
  ('00000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'orchestrator'),
  ('00000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', 'orchestrator'),
  ('00000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000006', 'reviewer')
on conflict do nothing;

insert into public.organizations (id, name, slug)
values ('00000000-0000-4000-8000-000000000002', 'Other Org', 'other-org')
on conflict (slug) do nothing;

insert into public.organization_memberships (organization_id, profile_id, role)
values ('00000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'owner')
on conflict do nothing;

insert into public.journeys (id, organization_id, slug, title, region, location)
values (
  '00000000-0000-4000-8000-000000000012',
  '00000000-0000-4000-8000-000000000002',
  'other-journey',
  'Other Journey',
  'Elsewhere',
  'Elsewhere Park'
) on conflict do nothing;

insert into public.journey_versions (id, journey_id, version_label, status, central_question)
values (
  '00000000-0000-4000-8000-000000000013',
  '00000000-0000-4000-8000-000000000012',
  'Org B Draft',
  'draft',
  'Org B question?'
) on conflict do nothing;

update public.cohort_memberships
set assigned_orchestrator_id = 'a0000000-0000-4000-8000-000000000004'
where id = '00000000-0000-4000-8000-000000000041';

insert into public.field_notes (
  id, journey_enrollment_id, journey_stop_id, learner_profile_id,
  created_by_profile_id, capture_type, observation, confidence, visibility
) values (
  '00000000-0000-4000-8000-000000000071',
  '00000000-0000-4000-8000-000000000060',
  '00000000-0000-4000-8000-000000000021',
  '00000000-0000-4000-8000-000000000030',
  'a0000000-0000-4000-8000-000000000004',
  'text',
  'Private mentor note',
  2,
  'private'
) on conflict (id) do nothing;

insert into public.media_assets (
  id, organization_id, owner_profile_id, journey_enrollment_id,
  bucket, object_path, mime_type, size_bytes, visibility
) values (
  '00000000-0000-4000-8000-000000000100',
  '00000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000060',
  'field-media',
  '00000000-0000-4000-8000-000000000001/a0000000-0000-4000-8000-000000000004/00000000-0000-4000-8000-000000000060/test-photo.jpg',
  'image/jpeg',
  1024,
  'private'
) on conflict (id) do nothing;

insert into storage.objects (id, bucket_id, name, owner, metadata)
values (
  gen_random_uuid(),
  'field-media',
  '00000000-0000-4000-8000-000000000001/a0000000-0000-4000-8000-000000000004/00000000-0000-4000-8000-000000000060/test-photo.jpg',
  'a0000000-0000-4000-8000-000000000004',
  '{}'::jsonb
) on conflict do nothing;

insert into public.journey_versions (id, journey_id, version_label, status, central_question)
values (
  '00000000-0000-4000-8000-000000000099',
  '00000000-0000-4000-8000-000000000010',
  'Published Immutable',
  'published',
  'Published question'
) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Anonymous access denied
-- ---------------------------------------------------------------------------

select tests.clear_authentication();
set local role anon;

select throws_ok(
  $$ insert into public.field_notes (
    journey_enrollment_id, journey_stop_id, learner_profile_id,
    capture_type, observation, confidence
  ) values (
    '00000000-0000-4000-8000-000000000060',
    '00000000-0000-4000-8000-000000000021',
    '00000000-0000-4000-8000-000000000030',
    'text', 'blocked', 2
  ) $$,
  '42501',
  null,
  'anonymous cannot insert field notes'
);

select is_empty(
  $$ select * from public.journey_versions where id = '00000000-0000-4000-8000-000000000011' $$,
  'anonymous cannot select journey versions'
);

reset role;

-- ---------------------------------------------------------------------------
-- Organization isolation
-- ---------------------------------------------------------------------------

select tests.authenticate_as('a0000000-0000-4000-8000-000000000003');

select is_empty(
  $$ select * from public.journey_versions where id = '00000000-0000-4000-8000-000000000013' $$,
  'org A creator cannot read org B journey version'
);

select tests.authenticate_as('b0000000-0000-4000-8000-000000000001');

select is_empty(
  $$ select * from public.field_notes where id = '00000000-0000-4000-8000-000000000070' $$,
  'org B member cannot read org A field notes'
);

-- ---------------------------------------------------------------------------
-- Creator permissions
-- ---------------------------------------------------------------------------

select tests.authenticate_as('a0000000-0000-4000-8000-000000000003');

select results_eq(
  $$ select count(*)::int from public.journey_versions where id = '00000000-0000-4000-8000-000000000011' $$,
  array[1],
  'creator can read editable org A journey version'
);

select lives_ok(
  $$ update public.journey_versions
     set central_question = 'Updated by creator test'
     where id = '00000000-0000-4000-8000-000000000011' $$,
  'creator can update editable draft version'
);

select throws_ok(
  $$ update public.journey_versions
     set central_question = 'Should fail'
     where id = '00000000-0000-4000-8000-000000000099' $$,
  'P0001',
  null,
  'creator cannot edit published version'
);

select is_empty(
  $$ select * from public.field_notes where id = '00000000-0000-4000-8000-000000000070' $$,
  'creator cannot read mentor field notes'
);

select is_empty(
  $$ select * from public.media_assets where id = '00000000-0000-4000-8000-000000000100' $$,
  'creator cannot read learner media assets'
);

-- ---------------------------------------------------------------------------
-- Reviewer permissions
-- ---------------------------------------------------------------------------

select tests.authenticate_as('a0000000-0000-4000-8000-000000000006');

select results_eq(
  $$ select count(*)::int from public.journey_versions where id = '00000000-0000-4000-8000-000000000011' $$,
  array[1],
  'reviewer can read journey version content'
);

select lives_ok(
  $$ insert into public.journey_reviews (
    journey_version_id, reviewer_profile_id, category, status, notes
  ) values (
    '00000000-0000-4000-8000-000000000011',
    'a0000000-0000-4000-8000-000000000006',
    'learning_design',
    'approved',
    'Review ok'
  ) on conflict (journey_version_id, reviewer_profile_id, category)
  do update set status = excluded.status $$,
  'reviewer can upsert own review'
);

select throws_ok(
  $$ update public.journey_stops
     set opening_prompt = 'blocked'
     where id = '00000000-0000-4000-8000-000000000022' $$,
  '42501',
  null,
  'reviewer cannot edit journey stops'
);

select is_empty(
  $$ select * from public.field_notes where id = '00000000-0000-4000-8000-000000000070' $$,
  'reviewer cannot read learner field notes'
);

-- ---------------------------------------------------------------------------
-- Orchestrator permissions
-- ---------------------------------------------------------------------------

select tests.authenticate_as('a0000000-0000-4000-8000-000000000004');

select results_eq(
  $$ select count(*)::int from public.field_notes where id = '00000000-0000-4000-8000-000000000070' $$,
  array[1],
  'assigned orchestrator can read mentor-visible field note'
);

select results_eq(
  $$ select count(*)::int from public.field_notes where id = '00000000-0000-4000-8000-000000000071' $$,
  array[1],
  'assigned orchestrator can read private field note for assigned enrollment'
);

select tests.authenticate_as('a0000000-0000-4000-8000-000000000005');

select is_empty(
  $$ select * from public.field_notes where id = '00000000-0000-4000-8000-000000000070' $$,
  'unassigned orchestrator cannot read field notes'
);

select is_empty(
  $$ select * from public.journey_enrollments where id = '00000000-0000-4000-8000-000000000060' $$,
  'unassigned orchestrator cannot read enrollments'
);

-- ---------------------------------------------------------------------------
-- Membership administration
-- ---------------------------------------------------------------------------

select tests.authenticate_as('a0000000-0000-4000-8000-000000000001');

select lives_ok(
  $$ insert into public.organization_memberships (organization_id, profile_id, role)
     values ('00000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', 'reviewer')
     on conflict do nothing $$,
  'owner can manage memberships'
);

select tests.authenticate_as('a0000000-0000-4000-8000-000000000003');

select throws_ok(
  $$ insert into public.organization_memberships (organization_id, profile_id, role)
     values ('00000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', 'admin') $$,
  '42501',
  null,
  'creator cannot manage memberships'
);

select tests.authenticate_as('a0000000-0000-4000-8000-000000000006');

select throws_ok(
  $$ delete from public.organization_memberships
     where organization_id = '00000000-0000-4000-8000-000000000001'
       and profile_id = 'a0000000-0000-4000-8000-000000000005'
       and role = 'orchestrator' $$,
  '42501',
  null,
  'reviewer cannot delete memberships'
);

-- ---------------------------------------------------------------------------
-- Storage access matrix
-- ---------------------------------------------------------------------------

select tests.authenticate_as('a0000000-0000-4000-8000-000000000004');

select results_eq(
  $$ select count(*)::int from storage.objects
     where bucket_id = 'field-media'
       and name = '00000000-0000-4000-8000-000000000001/a0000000-0000-4000-8000-000000000004/00000000-0000-4000-8000-000000000060/test-photo.jpg' $$,
  array[1],
  'assigned orchestrator can read storage object linked to media_assets'
);

select tests.authenticate_as('a0000000-0000-4000-8000-000000000003');

select is_empty(
  $$ select * from storage.objects
     where bucket_id = 'field-media'
       and name = '00000000-0000-4000-8000-000000000001/a0000000-0000-4000-8000-000000000004/00000000-0000-4000-8000-000000000060/test-photo.jpg' $$,
  'creator cannot read storage object via org membership'
);

select tests.authenticate_as('a0000000-0000-4000-8000-000000000006');

select is_empty(
  $$ select * from storage.objects
     where bucket_id = 'field-media'
       and name = '00000000-0000-4000-8000-000000000001/a0000000-0000-4000-8000-000000000004/00000000-0000-4000-8000-000000000060/test-photo.jpg' $$,
  'reviewer cannot read storage object'
);

select tests.authenticate_as('b0000000-0000-4000-8000-000000000001');

select is_empty(
  $$ select * from storage.objects
     where bucket_id = 'field-media'
       and name = '00000000-0000-4000-8000-000000000001/a0000000-0000-4000-8000-000000000004/00000000-0000-4000-8000-000000000060/test-photo.jpg' $$,
  'other organization cannot read storage object'
);

-- Former member without org membership cannot delete
delete from public.organization_memberships
where organization_id = '00000000-0000-4000-8000-000000000001'
  and profile_id = 'a0000000-0000-4000-8000-000000000004'
  and role = 'orchestrator';

select tests.authenticate_as('a0000000-0000-4000-8000-000000000004');

select throws_ok(
  $$ delete from storage.objects
     where bucket_id = 'field-media'
       and name = '00000000-0000-4000-8000-000000000001/a0000000-0000-4000-8000-000000000004/00000000-0000-4000-8000-000000000060/test-photo.jpg' $$,
  '42501',
  null,
  'removed org member cannot delete storage object'
);

-- ---------------------------------------------------------------------------
-- Publishing workflow
-- ---------------------------------------------------------------------------

-- restore orchestrator membership removed above
insert into public.organization_memberships (organization_id, profile_id, role)
values ('00000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'orchestrator')
on conflict do nothing;

select tests.authenticate_as('a0000000-0000-4000-8000-000000000003');

select throws_ok(
  $$ update public.journey_versions set status = 'published'
     where id = '00000000-0000-4000-8000-000000000011' $$,
  'P0001',
  null,
  'creator cannot directly publish journey version'
);

select tests.authenticate_as('a0000000-0000-4000-8000-000000000001');

select throws_ok(
  $$ select public.publish_journey_version('00000000-0000-4000-8000-000000000011') $$,
  'P0001',
  null,
  'owner cannot publish without required review approvals'
);

-- ---------------------------------------------------------------------------
-- Private helpers not callable by anon; private schema excluded from Data API
-- ---------------------------------------------------------------------------

select tests.clear_authentication();
set local role anon;

select throws_ok(
  $$ select private.enrollment_org_id('00000000-0000-4000-8000-000000000060') $$,
  '42501',
  null,
  'anonymous cannot execute private helper functions'
);

reset role;

select * from finish();
rollback;
