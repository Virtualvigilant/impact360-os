-- ITEK Internship OS migration: close the self-service privilege escalation path.
--
-- PROBLEM
--   `handle_new_user()` read the new role straight out of `auth.users.raw_user_meta_data`.
--   That payload is supplied by the browser at sign-up:
--       supabase.auth.signUp({ options: { data: { role: 'super_admin' } } })
--   `protect_profile_privileges()` only fired on UPDATE, and `profiles_own_insert`
--   allowed a self-insert with any role, so nothing rejected the elevated value.
--   Any anonymous visitor could mint a super_admin account.
--
-- FIX
--   1. Every account created through sign-up is an `intern`. Role is never read from
--      client-controlled metadata.
--   2. Privilege protection also covers INSERT, so a self-insert cannot set a role.
--   3. Elevation happens through one audited, security-definer function that only an
--      existing super_admin / programme_admin may call.

begin;

-- Give the audit trail room to record why a privilege change was made.
alter table public.audit_logs add column if not exists context text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- `role` is deliberately NOT read from raw_user_meta_data: that field is
  -- attacker-controlled. Every self-service account starts as an intern and is
  -- elevated later through public.assign_role() by an authorised administrator.
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'intern'::public.app_role
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = case when excluded.full_name <> '' then excluded.full_name else profiles.full_name end,
    updated_at = now();
  return new;
end;
$$;

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  privileged boolean;
begin
  privileged :=
    auth.uid() is null
    or current_user in ('postgres', 'supabase_admin', 'service_role')
    or public.has_any_role(array['super_admin','programme_admin']::public.app_role[]);

  if tg_op = 'INSERT' then
    -- A self-registering account may only ever insert itself as an intern.
    if not privileged and (new.role is distinct from 'intern'::public.app_role or new.is_active is false) then
      raise exception 'Roles are assigned by ITEK programme administrators, not at sign-up.';
    end if;
    return new;
  end if;

  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and not privileged then
    raise exception 'Only authorised programme administrators may change roles or account status.';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_privileges on public.profiles;
create trigger profiles_protect_privileges
before insert or update on public.profiles
for each row execute function public.protect_profile_privileges();

-- The single audited path for changing someone's role.
create or replace function public.assign_role(target_profile_id uuid, new_role public.app_role, reason text default null)
returns public.profiles
language plpgsql
security definer set search_path = public
as $$
declare
  updated public.profiles;
begin
  if not public.has_any_role(array['super_admin','programme_admin']::public.app_role[]) then
    raise exception 'Only super_admin or programme_admin may assign roles.';
  end if;

  -- Only a super_admin may create or remove another super_admin.
  if (new_role = 'super_admin'::public.app_role
      or (select role from public.profiles where id = target_profile_id) = 'super_admin'::public.app_role)
     and public.current_app_role() <> 'super_admin'::public.app_role then
    raise exception 'Only a super_admin may grant or revoke super_admin.';
  end if;

  update public.profiles
     set role = new_role, updated_at = now()
   where id = target_profile_id
  returning * into updated;

  if updated.id is null then
    raise exception 'Profile % not found.', target_profile_id;
  end if;

  insert into public.audit_logs (actor_id, actor_role, action, table_name, record_id, changed_fields, context)
  values (auth.uid(), public.current_app_role()::text, 'assign_role', 'profiles',
          target_profile_id::text, array['role'], coalesce(reason, 'no reason supplied'));

  return updated;
end;
$$;

revoke all on function public.assign_role(uuid, public.app_role, text) from public;
grant execute on function public.assign_role(uuid, public.app_role, text) to authenticated;

commit;
