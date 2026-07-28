-- Test helpers for pgTAP RLS suites (local Supabase only)
create schema if not exists tests;
grant usage on schema tests to postgres, service_role;

create or replace function tests.authenticate_as(p_user_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.sub', p_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('role', 'authenticated', true);
end;
$$;

create or replace function tests.clear_authentication()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', '', true);
  perform set_config('role', 'none', true);
end;
$$;

create or replace function tests.create_auth_user(
  p_id uuid,
  p_email text,
  p_display_name text default null
)
returns void
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) values (
    p_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    p_email,
    crypt('test-password', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    coalesce(jsonb_build_object('display_name', p_display_name), '{}'::jsonb),
    now(),
    now()
  )
  on conflict (id) do nothing;

  insert into public.profiles (id, display_name, email)
  values (p_id, coalesce(p_display_name, split_part(p_email, '@', 1)), p_email)
  on conflict (id) do nothing;
end;
$$;

grant execute on all functions in schema tests to postgres, service_role;
