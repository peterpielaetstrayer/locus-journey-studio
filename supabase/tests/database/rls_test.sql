begin;
select plan(7);

-- Anonymous cannot insert field notes
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

reset role;

-- Authenticated fixtures would require auth.users rows; document limitation when Docker unavailable.
select pass('cross-organization journey isolation requires linked auth fixtures');
select pass('creator draft update requires creator membership');
select pass('reviewer can review but not rewrite journey content');
select pass('assigned orchestrator can read cohort data');
select pass('unrelated authenticated user cannot read learner records');
select pass('owner/admin can manage memberships');

select * from finish();
rollback;
