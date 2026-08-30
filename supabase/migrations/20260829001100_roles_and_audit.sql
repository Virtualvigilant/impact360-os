-- ITEK Internship OS migration: role helpers, profile backfill and immutable audit trail
-- Generated from the reviewed greenfield schema; safe to run in order on a clean project.

begin;

-- Backfill profiles for any pre-existing auth users
insert into public.profiles (id, email, full_name, role)
select
  id,
  coalesce(email, ''),
  coalesce(raw_user_meta_data ->> 'full_name', ''),
  case
    when raw_user_meta_data ->> 'role' in ('super_admin', 'programme_admin', 'recruiter', 'mentor', 'supervisor', 'intern', 'alumni', 'external_reviewer')
      then (raw_user_meta_data ->> 'role')::public.app_role
    else 'intern'::public.app_role
  end
from auth.users
on conflict (id) do nothing;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active = true;
$$;

create or replace function public.has_any_role(allowed public.app_role[])
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(public.current_app_role() = any(allowed), false);
$$;

create or replace function public.is_programme_staff()
returns boolean
language sql
stable
as $$
  select public.has_any_role(array['super_admin','programme_admin','recruiter','mentor','supervisor']::public.app_role[]);
$$;

create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  old_row jsonb := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  new_row jsonb := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  fields text[];
  row_id text;
begin
  select coalesce(array_agg(key order by key), '{}') into fields
  from (
    select key from jsonb_object_keys(old_row || new_row) key
    where old_row -> key is distinct from new_row -> key
  ) changed;
  row_id := coalesce(new_row ->> 'id', old_row ->> 'id');
  insert into public.audit_logs (actor_id, actor_role, action, table_name, record_id, changed_fields)
  values (auth.uid(), public.current_app_role()::text, lower(tg_op), tg_table_name, row_id, fields);
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'internship_programmes','opportunities','applications','application_reviews','interviews','offers',
    'placements','tasks','work_evidence','evaluations','evaluation_scores','intern_documents',
    'programme_concerns','asset_assignments','access_assignments','stipend_payments',
    'internship_outcomes','certificates','policies','data_subject_requests'
  ] loop
    execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function public.audit_row_change()', table_name, table_name);
  end loop;
end $$;

commit;
