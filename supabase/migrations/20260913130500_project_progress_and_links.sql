-- Migration: Project progress tracking, deployed URL, and member update policy
--
-- Adds `deployed_url` to public.projects and allows project members (interns)
-- and programme staff to update project progress, status, and submission links.

begin;

-- 1. Add deployed_url to projects table if not already present
alter table public.projects add column if not exists deployed_url text;

-- 2. Allow project team members and staff to update projects (status, progress, repository_url, deployed_url)
drop policy if exists projects_member_update on public.projects;
create policy projects_member_update on public.projects for update
using (
  public.is_project_member(projects.id, auth.uid())
  or public.is_programme_staff()
)
with check (
  public.is_project_member(projects.id, auth.uid())
  or public.is_programme_staff()
);

commit;
