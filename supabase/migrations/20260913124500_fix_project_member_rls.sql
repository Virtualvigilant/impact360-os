-- Migration: Fix project membership and related RLS policies
-- 
-- PROBLEM:
--   1. `public.project_members` has RLS enabled but only an admin policy (`admin_manage`).
--      When an intern queries `public.projects`, the policy `projects_member_read` runs
--      an `exists(select 1 from public.project_members ...)` subquery as the intern.
--      Under RLS, `public.project_members` returns 0 rows to non-admin interns, so
--      `exists(...)` is ALWAYS false and interns can never see any projects.
--   2. `public.milestones` and `public.project_members` have no select policies for project members.
--   3. `public.profiles` only allows reading own profile or staff, preventing interns from
--      seeing project lead names, task assigner names, and teammate names.
--
-- FIX:
--   1. Add `is_project_member(check_project_id, check_user_id)` as a SECURITY DEFINER function
--      so membership lookups bypass RLS restrictions safely and avoid infinite recursion.
--   2. Update `projects_member_read` to allow project members and programme participants to read projects.
--   3. Add `project_members_select` so staff and team members can view project members.
--   4. Add `milestones_select` and `tasks_project_member_read` so project members can see milestones and tasks.
--   5. Add `profiles_authenticated_read` so active users can see teammates' names and avatars.

begin;

-- 1. Helper function to check project membership without RLS recursion
create or replace function public.is_project_member(check_project_id uuid, check_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.project_members pm
    join public.placements p on p.id = pm.placement_id
    where pm.project_id = check_project_id
      and p.intern_id = check_user_id
  );
$$;

-- 2. Projects read policy for members and programme participants
drop policy if exists projects_member_read on public.projects;
create policy projects_member_read on public.projects for select using (
  public.is_project_member(projects.id, auth.uid())
  or (
    projects.programme_id is not null and exists (
      select 1 from public.placements p
      where p.programme_id = projects.programme_id and p.intern_id = auth.uid()
    )
  )
);

-- 3. Project members read policy
drop policy if exists project_members_select on public.project_members;
create policy project_members_select on public.project_members for select using (
  public.is_programme_staff()
  or public.is_project_member(project_members.project_id, auth.uid())
);

-- 4. Milestones read policy
drop policy if exists milestones_select on public.milestones;
create policy milestones_select on public.milestones for select using (
  public.is_programme_staff()
  or public.is_project_member(milestones.project_id, auth.uid())
);

-- 5. Tasks read policy for project members
drop policy if exists tasks_project_member_read on public.tasks;
create policy tasks_project_member_read on public.tasks for select using (
  tasks.project_id is not null and public.is_project_member(tasks.project_id, auth.uid())
);

-- 6. Allow authenticated users to view active profiles (display names, roles, avatars)
drop policy if exists profiles_authenticated_read on public.profiles;
create policy profiles_authenticated_read on public.profiles for select using (
  auth.role() = 'authenticated' and is_active = true
);

commit;
