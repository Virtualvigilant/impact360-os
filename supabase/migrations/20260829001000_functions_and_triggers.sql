-- ITEK Internship OS migration: updated-at, privilege protection, new-user and application guards
-- Generated from the reviewed greenfield schema; safe to run in order on a clean project.

begin;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active) then
    if auth.uid() is not null
       and current_user not in ('postgres', 'supabase_admin', 'service_role')
       and not public.has_any_role(array['super_admin','programme_admin']::public.app_role[]) then
      raise exception 'Only authorised programme administrators may change roles or account status.';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_privileges
before update on public.profiles
for each row execute function public.protect_profile_privileges();

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','departments','internship_programmes','programme_tracks','opportunities','applications',
    'interviews','offers','placements','onboarding_items','competencies','learning_goals','projects',
    'milestones','tasks','task_comments','internship_check_ins','attendance_records','leave_requests',
    'learning_resources','programme_events','rubrics','evaluations','intern_documents','programme_concerns',
    'assets','asset_assignments','system_access_resources','access_assignments','stipend_payments',
    'completion_requirements','internship_outcomes','alumni_profiles','policies','announcements',
    'data_retention_policies','data_subject_requests'
  ] loop
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'role' in ('super_admin', 'programme_admin', 'recruiter', 'mentor', 'supervisor', 'intern', 'alumni', 'external_reviewer')
        then (new.raw_user_meta_data ->> 'role')::public.app_role
      else 'intern'::public.app_role
    end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = case when excluded.full_name <> '' then excluded.full_name else profiles.full_name end,
    updated_at = now();
  return new;
end;
$$;

create or replace function public.protect_application_system_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[]) then
    new.status := 'submitted';
    new.fit_score := null;
    new.fit_explanation := null;
    new.submitted_at := now();
    new.retention_until := current_date + interval '12 months';
  end if;
  return new;
end;
$$;

create trigger applications_protect_system_fields
before insert on public.applications
for each row execute function public.protect_application_system_fields();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

commit;
