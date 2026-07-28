-- Canonical seed data for Water Writes the Landscape prototype
-- Auth users are NOT seeded — create adults via Supabase Auth dashboard or CLI.

-- Fixed UUIDs for reproducible references
-- org: 00000000-0000-4000-8000-000000000001
-- journey: 00000000-0000-4000-8000-000000000010
-- version: 00000000-0000-4000-8000-000000000011
-- cohort: 00000000-0000-4000-8000-000000000040

insert into public.organizations (id, name, slug)
values ('00000000-0000-4000-8000-000000000001', 'Open World Learning Lab', 'owll')
on conflict (slug) do nothing;

insert into public.learner_profiles (
  id, organization_id, display_name, age_band, interests, strengths, growth_areas,
  preferred_capture_modes, accessibility_preferences, identity_pathways, adaptation_profile, is_demo
) values
  (
    '00000000-0000-4000-8000-000000000030',
    '00000000-0000-4000-8000-000000000001',
    'Maya Chen', '12-15',
    array['wildlife photography', 'wetland ecology', 'drawing'],
    array['visual observation', 'quick hypothesis formation'],
    array['evidence selection', 'causal reasoning'],
    array['photo', 'text'], array[]::text[], array['Emerging Naturalist'],
    'curious', true
  ),
  (
    '00000000-0000-4000-8000-000000000031',
    '00000000-0000-4000-8000-000000000001',
    'Eli Brooks', '12-15',
    array['trails', 'movement', 'discovery games'],
    array['field energy', 'finding unusual details'],
    array['sustained focus', 'written reflection'],
    array['voice', 'photo'], array['movement breaks'], array['Explorer'],
    'movement', true
  ),
  (
    '00000000-0000-4000-8000-000000000032',
    '00000000-0000-4000-8000-000000000001',
    'Jordan Reyes', '12-15',
    array['systems diagrams', 'environmental science', 'writing'],
    array['careful analysis', 'structured thinking'],
    array['speed of hypothesis', 'field confidence'],
    array['text', 'sketch'], array['explicit step labels'], array['Systems Thinker'],
    'structured', true
  )
on conflict (id) do nothing;

insert into public.journeys (
  id, organization_id, slug, title, region, location
) values (
  '00000000-0000-4000-8000-000000000010',
  '00000000-0000-4000-8000-000000000001',
  'water-writes-the-landscape',
  'Water Writes the Landscape',
  'Virginia Beach',
  'First Landing State Park'
) on conflict (organization_id, slug) do nothing;

insert into public.journey_versions (
  id, journey_id, version_label, status, central_question, subtitle, description,
  audience, duration_minutes, learning_domains, enduring_understandings, prerequisite_concepts,
  artifact_template
) values (
  '00000000-0000-4000-8000-000000000011',
  '00000000-0000-4000-8000-000000000010',
  'v0.1 Field-Test Draft',
  'field_test',
  'How can you tell that water is shaping a place—even when you cannot see it moving?',
  'Virginia Beach Living Systems Journey',
  'Investigate how water shapes soil, plants, habitat, decomposition, human movement, and the visible character of a place at First Landing State Park.',
  'Ages 12–15 (adaptable for families, cohorts, adults)',
  90,
  array['Ecology', 'Hydrology', 'Systems thinking', 'Scientific reasoning'],
  array[
    'Water shapes landscapes through visible and invisible processes.',
    'Water availability influences soil, plant distribution, decomposition, habitat, and human design.',
    'Scientific explanations improve through comparison and evidence.',
    'Landscapes operate as connected systems.'
  ],
  array['Observation', 'Cause and effect', 'Evidence'],
  '{"type":"micro-landscape-systems-card"}'::jsonb
) on conflict (id) do nothing;

insert into public.journey_stops (
  id, journey_version_id, position, slug, title, location_label, purpose,
  central_concept, learning_objective, opening_prompt, field_action,
  safety_notes, accessibility_alternatives, artifact_contribution,
  resurfacing_connection, is_optional, is_hidden_until_unlocked
) values
  ('00000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000011', 1, 'threshold', 'The Threshold', 'Trail entrance, maritime forest edge', 'Attend and notice before naming or explaining.', 'Observation', 'Capture sensory observations without premature explanation.', 'For the next three minutes, walk without trying to name or explain anything.', 'Capture three observations, one sound, one pattern, and one surprising detail.', array['Stay on designated trail', 'Two screened adults present'], array['Seated observation from boardwalk edge'], null, null, false, false),
  ('00000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000011', 2, 'water-fingerprints', 'Water Fingerprints', 'Boardwalk overlook, bald-cypress wetland', 'Gather evidence that water shaped this place.', 'Evidence of hydrological influence', 'Record observations, interpretations, and alternative explanations.', 'Find three clues that water shaped this place.', 'For each clue record the observation, location, interpretation, alternative explanation, and confidence.', array['No water entry', 'No off-trail movement'], array['Observe from boardwalk railing'], 'Strongest evidence selection', null, false, true),
  ('00000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000011', 3, 'cypress-knee', 'Cypress-Knee Mystery', 'Cypress grove, standing water edge', 'Hypothesize about unfamiliar structures.', 'Adaptation and function', 'Form and test hypotheses about cypress knees.', 'What do you think these structures do?', 'What evidence would make your explanation more convincing?', array['Do not climb on knees', 'Do not handle wildlife'], array['Compare photos of two knee examples'], null, 'Wetland structures reappear at shoreline', false, true),
  ('00000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000011', 4, 'two-worlds', 'Twenty Steps, Two Worlds', 'Transition zone, wet to dry', 'Compare microenvironments.', 'Microenvironment comparison', 'Compare wetter and drier zones across multiple variables.', 'What changed? What stayed the same? What might explain the difference?', 'Compare soil, roots, plant distribution, leaf litter, decomposition, light, and trail surface.', array['Stay on trail surface'], array['Compare two labeled photo stations'], null, null, false, true),
  ('00000000-0000-4000-8000-000000000024', '00000000-0000-4000-8000-000000000011', 5, 'hidden-flow', 'The Hidden Flow', 'Still water observation point', 'Reason about invisible processes.', 'Invisible hydrological activity', 'Identify processes that continue despite apparent stillness.', 'The water appears still. What might still be happening?', 'What became visible after you stopped trying to move forward?', array['Quiet-attention option available'], array['Extended stillness from seated position'], null, null, true, true),
  ('00000000-0000-4000-8000-000000000025', '00000000-0000-4000-8000-000000000011', 6, 'human-path', 'The Human Path', 'Elevated boardwalk section', 'Connect ecology and human design.', 'Human infrastructure and environment', 'Explain why the trail is built this way.', 'Why is the trail built this way?', 'Improve one part of the visitor experience without damaging the ecosystem.', array['Design challenge is observational only'], array['Discuss design from accessible overlook'], null, null, false, true),
  ('00000000-0000-4000-8000-000000000026', '00000000-0000-4000-8000-000000000011', 7, 'build-system', 'Build the System', 'Trail junction, systems map station', 'Model causality across the landscape.', 'Systems mapping', 'Connect five nodes with four causal links and one uncertainty.', 'How do rainfall, water level, soil, plants, and trail design connect?', 'Build a systems map with five nodes, four connections, one uncertainty, and one prediction.', array[]::text[], array['Text-based node list alternative to drag map'], 'Systems diagram', null, false, true),
  ('00000000-0000-4000-8000-000000000027', '00000000-0000-4000-8000-000000000011', 8, 'exit-claim', 'Exit Claim', 'Trail exit, reflection point', 'Explain and revise understanding.', 'Scientific explanation', 'Make a claim supported by evidence and acknowledge remaining questions.', 'Water organizes this landscape by…', 'Provide a claim, two observations, a causal connection, and one remaining question.', array[]::text[], array['Voice capture for exit claim'], 'Revised explanation', null, false, true)
on conflict (id) do nothing;

insert into public.adaptive_branches (
  id, journey_stop_id, name, learner_type, activation_type, trigger_description,
  prompt, action, evidence_expectation, return_to_core
) values
  ('00000000-0000-4000-8000-000000000050', '00000000-0000-4000-8000-000000000022', 'Curious Explorer', 'advanced', 'ai-recommended', 'Learner with strong evidence and causal reasoning', 'Design a field study', 'Design a field test that could distinguish between two competing explanations for cypress knees.', 'Study design with measurable comparison', true),
  ('00000000-0000-4000-8000-000000000051', '00000000-0000-4000-8000-000000000022', 'Needs Structure', 'structured', 'ai-recommended', 'Learner who benefits from stepwise support', 'Compare two examples', 'Step 1: Choose two knee examples. Step 2: Name one similarity. Step 3: Name one difference.', 'Structured comparison with labeled steps', true),
  ('00000000-0000-4000-8000-000000000052', '00000000-0000-4000-8000-000000000022', 'Reluctant Learner', 'reluctant', 'mentor-choice', 'Learner showing disengagement', 'Find the strangest example', 'Find the strangest cypress knee within ten safe steps. Capture it and explain why it matters.', 'One compelling observation with personal relevance', true),
  ('00000000-0000-4000-8000-000000000053', '00000000-0000-4000-8000-000000000022', 'Artistic Path', 'artistic', 'learner-choice', 'Learner prefers visual capture before explanation', 'Sketch before explaining', 'Sketch one cypress knee and its surroundings before writing any explanation.', 'Sketch plus delayed written hypothesis', true)
on conflict (id) do nothing;

insert into public.cohorts (
  id, organization_id, journey_version_id, name, status
) values (
  '00000000-0000-4000-8000-000000000040',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000011',
  'Virginia Beach Founding Group',
  'active'
) on conflict (id) do nothing;

insert into public.cohort_memberships (id, cohort_id, learner_profile_id)
values
  ('00000000-0000-4000-8000-000000000041', '00000000-0000-4000-8000-000000000040', '00000000-0000-4000-8000-000000000030'),
  ('00000000-0000-4000-8000-000000000042', '00000000-0000-4000-8000-000000000040', '00000000-0000-4000-8000-000000000031'),
  ('00000000-0000-4000-8000-000000000043', '00000000-0000-4000-8000-000000000040', '00000000-0000-4000-8000-000000000032')
on conflict (id) do nothing;

insert into public.journey_enrollments (
  id, cohort_id, learner_profile_id, journey_version_id, status, current_stop_id, started_at
) values
  ('00000000-0000-4000-8000-000000000060', '00000000-0000-4000-8000-000000000040', '00000000-0000-4000-8000-000000000030', '00000000-0000-4000-8000-000000000011', 'active', '00000000-0000-4000-8000-000000000020', now()),
  ('00000000-0000-4000-8000-000000000061', '00000000-0000-4000-8000-000000000040', '00000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000011', 'active', '00000000-0000-4000-8000-000000000021', now()),
  ('00000000-0000-4000-8000-000000000062', '00000000-0000-4000-8000-000000000040', '00000000-0000-4000-8000-000000000032', '00000000-0000-4000-8000-000000000011', 'active', '00000000-0000-4000-8000-000000000022', now())
on conflict (id) do nothing;

insert into public.field_notes (
  id, journey_enrollment_id, journey_stop_id, learner_profile_id,
  capture_type, observation, inference, evidence, confidence, visibility, mentor_reviewed
) values (
  '00000000-0000-4000-8000-000000000070',
  '00000000-0000-4000-8000-000000000060',
  '00000000-0000-4000-8000-000000000021',
  '00000000-0000-4000-8000-000000000030',
  'text',
  'Dark, saturated soil near the boardwalk railing with cypress roots spreading horizontally.',
  'Water stays here longer than on higher ground.',
  '["Soil is darker and softer", "Roots spread wide not deep", "Moss on lower trunks"]'::jsonb,
  3,
  'mentor',
  false
) on conflict (id) do nothing;

insert into public.mentor_interventions (
  id, journey_enrollment_id, journey_stop_id, learner_profile_id,
  category, recommendation_source, reason, message, status
) values (
  '00000000-0000-4000-8000-000000000080',
  '00000000-0000-4000-8000-000000000061',
  '00000000-0000-4000-8000-000000000021',
  '00000000-0000-4000-8000-000000000031',
  'engage',
  'simulated-ai',
  'Simulated inactivity detected — movement-based discovery may help.',
  'Find one detail within ten safe steps that you have not noticed yet. Capture it before explaining.',
  'recommended'
) on conflict (id) do nothing;

insert into public.artifacts (
  id, journey_enrollment_id, learner_profile_id, journey_version_id,
  title, original_hypothesis, strongest_evidence, revised_explanation,
  systems_map, remaining_question, status
) values (
  '00000000-0000-4000-8000-000000000090',
  '00000000-0000-4000-8000-000000000062',
  '00000000-0000-4000-8000-000000000032',
  '00000000-0000-4000-8000-000000000011',
  'Micro-Landscape Systems Card',
  'Cypress knees might help the tree breathe in flooded soil.',
  '["Knees cluster near standing water", "Wetter zone has different root patterns"]'::jsonb,
  'Water level shapes which plants survive here and how roots adapt — the boardwalk itself is a response to that water.',
  '{"nodes":[],"edges":[]}'::jsonb,
  'Do cypress knees function differently during drought years?',
  'draft'
) on conflict (id) do nothing;

-- Journey reviews are created when an authenticated reviewer signs in.
-- See docs/backend-setup.md for linking the first adult user.
