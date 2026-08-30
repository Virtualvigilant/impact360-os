-- ITEK Internship OS — greenfield application schema
--
-- DESTRUCTIVE SCOPE
--   This script replaces ITEK application objects in the `public` schema.
--   It intentionally preserves Supabase-managed `auth` and `storage` data.
--
-- BEFORE RUNNING
--   1. Verify the selected Supabase project and take a backup.
--   2. Replace the confirmation value below with RESET_ITEK_INTERNSHIP_OS.
--   3. Run the whole file in one Supabase SQL Editor transaction.
--
-- Kenya-specific obligations must be confirmed against ITEK's exact internship
-- and industrial-attachment model. The schema records compliance decisions; it
-- does not pretend to provide legal advice or hard-code one policy for all cases.

begin;

do $$
declare
  confirmation text := 'RESET_ITEK_INTERNSHIP_OS';
begin
  if confirmation <> 'RESET_ITEK_INTERNSHIP_OS' then
    raise exception 'Reset blocked. Verify the target and replace the confirmation value first.';
  end if;
end $$;

-- Remove the previous Impact360 / internship application model only.
drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.data_subject_requests cascade;
drop table if exists public.data_retention_policies cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.ai_insights cascade;
drop table if exists public.risk_signals cascade;
drop table if exists public.notifications cascade;
drop table if exists public.announcements cascade;
drop table if exists public.policy_acknowledgements cascade;
drop table if exists public.policies cascade;
drop table if exists public.alumni_profiles cascade;
drop table if exists public.certificates cascade;
drop table if exists public.internship_outcomes cascade;
drop table if exists public.completion_requirements cascade;
drop table if exists public.stipend_payments cascade;
drop table if exists public.access_assignments cascade;
drop table if exists public.system_access_resources cascade;
drop table if exists public.asset_assignments cascade;
drop table if exists public.assets cascade;
drop table if exists public.programme_concerns cascade;
drop table if exists public.intern_documents cascade;
drop table if exists public.evaluation_scores cascade;
drop table if exists public.evaluations cascade;
drop table if exists public.rubric_criteria cascade;
drop table if exists public.rubrics cascade;
drop table if exists public.event_attendance cascade;
drop table if exists public.programme_events cascade;
drop table if exists public.learning_resources cascade;
drop table if exists public.leave_requests cascade;
drop table if exists public.attendance_records cascade;
drop table if exists public.feedback_entries cascade;
drop table if exists public.internship_check_ins cascade;
drop table if exists public.task_comments cascade;
drop table if exists public.work_evidence cascade;
drop table if exists public.task_dependencies cascade;
drop table if exists public.task_competencies cascade;
drop table if exists public.tasks cascade;
drop table if exists public.milestones cascade;
drop table if exists public.project_members cascade;
drop table if exists public.projects cascade;
drop table if exists public.learning_goals cascade;
drop table if exists public.programme_competencies cascade;
drop table if exists public.competencies cascade;
drop table if exists public.onboarding_items cascade;
drop table if exists public.placements cascade;
drop table if exists public.offers cascade;
drop table if exists public.interview_scores cascade;
drop table if exists public.interviews cascade;
drop table if exists public.application_reviews cascade;
drop table if exists public.application_documents cascade;
drop table if exists public.applications cascade;
drop table if exists public.opportunities cascade;
drop table if exists public.programme_tracks cascade;
drop table if exists public.internship_programmes cascade;
drop table if exists public.departments cascade;

-- Legacy application objects.
drop table if exists public.team_task_submissions cascade;
drop table if exists public.team_tasks cascade;
drop table if exists public.team_members cascade;
drop table if exists public.teams cascade;
drop table if exists public.submissions cascade;
drop table if exists public.project_assignments cascade;
drop table if exists public.curriculum_modules cascade;
drop table if exists public.member_badges cascade;
drop table if exists public.badges cascade;
drop table if exists public.member_profiles cascade;
drop table if exists public.cohorts cascade;
drop table if exists public.profiles cascade;

do $$
declare routine regprocedure;
begin
  for routine in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'handle_new_user', 'set_updated_at', 'set_internship_updated_at',
        'current_app_role', 'has_any_role', 'is_programme_staff',
        'audit_row_change', 'protect_profile_privileges',
        'protect_application_system_fields'
      )
  loop
    execute format('drop function if exists %s cascade', routine);
  end loop;
end $$;

drop type if exists public.data_request_status cascade;
drop type if exists public.data_request_type cascade;
drop type if exists public.insight_status cascade;
drop type if exists public.risk_level cascade;
drop type if exists public.outcome_recommendation cascade;
drop type if exists public.completion_status cascade;
drop type if exists public.payment_status cascade;
drop type if exists public.access_assignment_status cascade;
drop type if exists public.asset_assignment_status cascade;
drop type if exists public.concern_status cascade;
drop type if exists public.concern_category cascade;
drop type if exists public.document_status cascade;
drop type if exists public.evaluation_status cascade;
drop type if exists public.evaluation_type cascade;
drop type if exists public.attendance_status cascade;
drop type if exists public.leave_status cascade;
drop type if exists public.feedback_source cascade;
drop type if exists public.check_in_status cascade;
drop type if exists public.evidence_type cascade;
drop type if exists public.task_status cascade;
drop type if exists public.priority_level cascade;
drop type if exists public.project_status cascade;
drop type if exists public.goal_status cascade;
drop type if exists public.onboarding_status cascade;
drop type if exists public.placement_status cascade;
drop type if exists public.offer_status cascade;
drop type if exists public.interview_status cascade;
drop type if exists public.application_status cascade;
drop type if exists public.opportunity_status cascade;
drop type if exists public.programme_status cascade;
drop type if exists public.work_arrangement cascade;
drop type if exists public.app_role cascade;
drop type if exists public.user_role cascade;
drop type if exists public.pipeline_stage cascade;
drop type if exists public.track_type cascade;
drop type if exists public.project_difficulty cascade;
drop type if exists public.experience_level cascade;

create type public.app_role as enum (
  'super_admin', 'programme_admin', 'recruiter', 'mentor', 'supervisor',
  'intern', 'alumni', 'external_reviewer'
);
create type public.programme_status as enum ('draft', 'planned', 'open', 'active', 'paused', 'completed', 'archived');
create type public.opportunity_status as enum ('draft', 'published', 'closed', 'filled', 'archived');
create type public.application_status as enum ('draft', 'submitted', 'under_review', 'shortlisted', 'interview', 'assessment', 'selected', 'waitlisted', 'rejected', 'withdrawn');
create type public.interview_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');
create type public.offer_status as enum ('draft', 'sent', 'accepted', 'declined', 'expired', 'withdrawn');
create type public.placement_status as enum ('preboarding', 'onboarding', 'active', 'paused', 'completing', 'completed', 'extended', 'withdrawn', 'terminated');
create type public.onboarding_status as enum ('not_started', 'in_progress', 'submitted', 'approved', 'waived', 'rejected');
create type public.work_arrangement as enum ('onsite', 'hybrid', 'remote');
create type public.goal_status as enum ('not_started', 'in_progress', 'achieved', 'at_risk', 'cancelled');
create type public.project_status as enum ('planned', 'active', 'on_hold', 'completed', 'cancelled');
create type public.priority_level as enum ('low', 'medium', 'high', 'urgent');
create type public.task_status as enum ('backlog', 'assigned', 'in_progress', 'submitted', 'under_review', 'changes_requested', 'approved', 'completed', 'cancelled');
create type public.evidence_type as enum ('repository', 'commit', 'pull_request', 'design', 'prototype', 'document', 'dataset', 'notebook', 'experiment', 'demo', 'report', 'certificate', 'other');
create type public.check_in_status as enum ('draft', 'submitted', 'reviewed');
create type public.feedback_source as enum ('mentor', 'supervisor', 'peer', 'self', 'project_lead', 'client', 'programme_admin');
create type public.attendance_status as enum ('present', 'remote', 'late', 'excused', 'absent');
create type public.leave_status as enum ('pending', 'approved', 'rejected', 'cancelled');
create type public.evaluation_type as enum ('baseline', 'midpoint', 'final', 'project', 'ad_hoc');
create type public.evaluation_status as enum ('draft', 'submitted', 'acknowledged', 'locked');
create type public.document_status as enum ('required', 'submitted', 'approved', 'rejected', 'expired', 'waived');
create type public.concern_category as enum ('workload', 'conduct', 'safety', 'harassment', 'supervision', 'access', 'discrimination', 'wellbeing', 'privacy', 'other');
create type public.concern_status as enum ('open', 'triaged', 'in_review', 'actioned', 'resolved', 'closed');
create type public.asset_assignment_status as enum ('reserved', 'issued', 'returned', 'lost', 'damaged');
create type public.access_assignment_status as enum ('requested', 'provisioned', 'suspended', 'revoked');
create type public.payment_status as enum ('scheduled', 'processing', 'paid', 'failed', 'cancelled');
create type public.completion_status as enum ('in_progress', 'eligible', 'completed', 'extended', 'withdrawn', 'not_completed');
create type public.outcome_recommendation as enum ('none', 'project_work', 'apprenticeship', 'extended_internship', 'freelance', 'contract', 'employment', 'alumni_only');
create type public.risk_level as enum ('low', 'medium', 'high', 'critical');
create type public.insight_status as enum ('generated', 'reviewed', 'accepted', 'dismissed');
create type public.data_request_type as enum ('access', 'correction', 'objection', 'restriction', 'deletion', 'portability');
create type public.data_request_status as enum ('received', 'identity_verification', 'in_progress', 'completed', 'partially_completed', 'declined');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.app_role not null default 'intern',
  avatar_url text,
  phone text,
  timezone text not null default 'Africa/Nairobi',
  locale text not null default 'en-KE',
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  description text,
  lead_id uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.internship_programmes (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references public.departments(id) on delete set null,
  name text not null,
  code text not null unique,
  cohort_label text not null,
  description text,
  programme_type text not null default 'internship',
  start_date date not null,
  end_date date not null,
  application_open_at timestamptz,
  application_close_at timestamptz,
  slots integer not null default 1 check (slots > 0),
  work_arrangement public.work_arrangement not null default 'hybrid',
  expected_hours_per_week numeric(4,1) not null default 40 check (expected_hours_per_week between 1 and 84),
  stipend_enabled boolean not null default false,
  stipend_amount numeric(12,2),
  stipend_currency char(3) not null default 'KES',
  eligibility jsonb not null default '{}'::jsonb,
  required_skills text[] not null default '{}',
  learning_objectives text[] not null default '{}',
  mentor_requirements text,
  evaluation_framework text,
  completion_rules jsonb not null default '{}'::jsonb,
  required_documents text[] not null default '{}',
  policy_ids uuid[] not null default '{}',
  industrial_attachment_applicable boolean not null default false,
  regulator_permission_reference text,
  trainer_registration_reference text,
  status public.programme_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  check (stipend_amount is null or stipend_amount >= 0)
);

create table public.programme_tracks (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.internship_programmes(id) on delete cascade,
  name text not null,
  code text not null,
  description text,
  capacity integer check (capacity is null or capacity > 0),
  learning_objectives text[] not null default '{}',
  required_skills text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (programme_id, code)
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.internship_programmes(id) on delete cascade,
  track_id uuid references public.programme_tracks(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text not null,
  responsibilities text[] not null default '{}',
  qualifications text[] not null default '{}',
  expected_competencies text[] not null default '{}',
  possible_projects text[] not null default '{}',
  work_arrangement public.work_arrangement not null default 'hybrid',
  location text,
  slots integer not null default 1 check (slots > 0),
  opens_at timestamptz,
  closes_at timestamptz,
  status public.opportunity_status not null default 'draft',
  hiring_manager_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete restrict,
  applicant_user_id uuid references auth.users(id) on delete set null,
  application_number text not null unique default ('APP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  full_name text not null,
  email text not null,
  phone text,
  location text,
  date_of_birth date,
  institution text,
  academic_programme text,
  academic_level text,
  expected_graduation_date date,
  skills text[] not null default '{}',
  technologies text[] not null default '{}',
  project_summary text,
  github_url text,
  linkedin_url text,
  portfolio_url text,
  preferred_duration_weeks integer check (preferred_duration_weeks is null or preferred_duration_weeks > 0),
  available_from date,
  school_requirements text,
  preferred_arrangement public.work_arrangement,
  career_interests text[] not null default '{}',
  source text,
  status public.application_status not null default 'submitted',
  fit_score numeric(5,2) check (fit_score between 0 and 100),
  fit_explanation text,
  privacy_notice_version text not null,
  privacy_consent_at timestamptz not null,
  screening_consent boolean not null default false,
  submitted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  retention_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  document_type text not null,
  title text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  created_at timestamptz not null default now()
);

create table public.application_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete restrict,
  recommendation public.application_status not null,
  score numeric(5,2) check (score between 0 and 100),
  evidence jsonb not null default '{}'::jsonb,
  notes text,
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  unique (application_id, reviewer_id)
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  interview_type text not null,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 45 check (duration_minutes > 0),
  location_or_link text,
  panel_ids uuid[] not null default '{}',
  status public.interview_status not null default 'scheduled',
  summary text,
  recording_consent_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interview_scores (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references public.interviews(id) on delete cascade,
  assessor_id uuid not null references public.profiles(id) on delete restrict,
  criterion text not null,
  score numeric(5,2) not null check (score >= 0),
  maximum_score numeric(5,2) not null default 5 check (maximum_score > 0),
  comment text,
  evidence_url text,
  created_at timestamptz not null default now(),
  unique (interview_id, assessor_id, criterion)
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete restrict,
  programme_id uuid not null references public.internship_programmes(id) on delete restrict,
  track_id uuid references public.programme_tracks(id) on delete set null,
  offered_start_date date not null,
  offered_end_date date not null,
  work_arrangement public.work_arrangement not null,
  stipend_amount numeric(12,2),
  stipend_currency char(3) not null default 'KES',
  terms text,
  expires_at timestamptz,
  status public.offer_status not null default 'draft',
  sent_at timestamptz,
  responded_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (offered_end_date >= offered_start_date)
);

create table public.placements (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid not null references public.profiles(id) on delete restrict,
  application_id uuid references public.applications(id) on delete set null,
  programme_id uuid not null references public.internship_programmes(id) on delete restrict,
  track_id uuid references public.programme_tracks(id) on delete set null,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  primary_mentor_id uuid references public.profiles(id) on delete set null,
  supervisor_id uuid references public.profiles(id) on delete set null,
  programme_manager_id uuid references public.profiles(id) on delete set null,
  start_date date not null,
  end_date date not null,
  status public.placement_status not null default 'preboarding',
  current_phase text not null default 'onboarding',
  expected_hours numeric(7,1),
  hours_logged numeric(7,1) not null default 0,
  baseline_notes text,
  risk_level public.risk_level not null default 'low',
  risk_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  unique (intern_id, programme_id)
);

create table public.onboarding_items (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  category text not null,
  title text not null,
  description text,
  is_required boolean not null default true,
  status public.onboarding_status not null default 'not_started',
  due_date date,
  evidence_url text,
  completed_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.competencies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text not null check (category in ('technical', 'professional', 'innovation')),
  description text,
  level_descriptors jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programme_competencies (
  programme_id uuid not null references public.internship_programmes(id) on delete cascade,
  track_id uuid references public.programme_tracks(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete restrict,
  target_level integer not null default 3 check (target_level between 1 and 5),
  weight numeric(5,2) not null default 1 check (weight > 0),
  primary key (programme_id, competency_id)
);

create table public.learning_goals (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  competency_id uuid references public.competencies(id) on delete set null,
  title text not null,
  success_measure text not null,
  target_date date,
  status public.goal_status not null default 'not_started',
  progress integer not null default 0 check (progress between 0 and 100),
  intern_reflection text,
  mentor_notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references public.internship_programmes(id) on delete set null,
  track_id uuid references public.programme_tracks(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  name text not null,
  code text not null unique,
  description text,
  objective text not null,
  project_lead_id uuid references public.profiles(id) on delete set null,
  repository_url text,
  start_date date,
  target_end_date date,
  status public.project_status not null default 'planned',
  progress integer not null default 0 check (progress between 0 and 100),
  is_simulated boolean not null default false,
  confidentiality_level text not null default 'internal',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  placement_id uuid not null references public.placements(id) on delete cascade,
  role_title text,
  allocation_percent integer check (allocation_percent between 0 and 100),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (project_id, placement_id)
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status public.task_status not null default 'backlog',
  order_index integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  milestone_id uuid references public.milestones(id) on delete set null,
  placement_id uuid references public.placements(id) on delete set null,
  task_number text not null unique default ('TASK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  title text not null,
  description text,
  objective text,
  acceptance_criteria text[] not null default '{}',
  priority public.priority_level not null default 'medium',
  status public.task_status not null default 'backlog',
  due_at timestamptz,
  estimated_hours numeric(6,2),
  actual_hours numeric(6,2),
  assigned_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_competencies (
  task_id uuid not null references public.tasks(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete restrict,
  weight numeric(5,2) not null default 1 check (weight > 0),
  primary key (task_id, competency_id)
);

create table public.task_dependencies (
  task_id uuid not null references public.tasks(id) on delete cascade,
  depends_on_task_id uuid not null references public.tasks(id) on delete cascade,
  primary key (task_id, depends_on_task_id),
  check (task_id <> depends_on_task_id)
);

create table public.work_evidence (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  learning_goal_id uuid references public.learning_goals(id) on delete set null,
  evidence_type public.evidence_type not null,
  title text not null,
  description text,
  url text,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  submitted_by uuid references public.profiles(id) on delete set null,
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  is_internal_note boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.internship_check_ins (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  status public.check_in_status not null default 'draft',
  achievements text,
  learning text,
  blockers text,
  next_steps text,
  support_needed text,
  wellbeing_rating integer check (wellbeing_rating between 1 and 5),
  mentor_feedback text,
  mentor_focus text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start),
  unique (placement_id, period_start, period_end)
);

create table public.feedback_entries (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  competency_id uuid references public.competencies(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  source public.feedback_source not null,
  rating numeric(3,2) check (rating between 1 and 5),
  strengths text,
  development_areas text,
  next_action text,
  is_visible_to_intern boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  record_date date not null,
  status public.attendance_status not null,
  check_in_at timestamptz,
  check_out_at timestamptz,
  hours_logged numeric(4,1) not null default 0 check (hours_logged between 0 and 24),
  notes text,
  recorded_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (placement_id, record_date)
);

create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  reason text not null,
  status public.leave_status not null default 'pending',
  decided_by uuid references public.profiles(id) on delete set null,
  decision_notes text,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references public.internship_programmes(id) on delete cascade,
  track_id uuid references public.programme_tracks(id) on delete cascade,
  competency_id uuid references public.competencies(id) on delete set null,
  title text not null,
  resource_type text not null,
  url text,
  content text,
  duration_minutes integer,
  is_required boolean not null default false,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programme_events (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references public.internship_programmes(id) on delete cascade,
  title text not null,
  event_type text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location_or_link text,
  capacity integer,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at >= starts_at)
);

create table public.event_attendance (
  event_id uuid not null references public.programme_events(id) on delete cascade,
  placement_id uuid not null references public.placements(id) on delete cascade,
  status public.attendance_status not null default 'present',
  notes text,
  marked_at timestamptz not null default now(),
  primary key (event_id, placement_id)
);

create table public.rubrics (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references public.internship_programmes(id) on delete cascade,
  name text not null,
  description text,
  scale_max numeric(4,2) not null default 5 check (scale_max > 0),
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rubric_criteria (
  id uuid primary key default gen_random_uuid(),
  rubric_id uuid not null references public.rubrics(id) on delete cascade,
  competency_id uuid references public.competencies(id) on delete set null,
  name text not null,
  description text,
  weight numeric(5,2) not null default 1 check (weight > 0),
  descriptors jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  rubric_id uuid references public.rubrics(id) on delete set null,
  evaluator_id uuid not null references public.profiles(id) on delete restrict,
  evaluation_type public.evaluation_type not null,
  source public.feedback_source not null,
  status public.evaluation_status not null default 'draft',
  overall_score numeric(4,2) check (overall_score between 0 and 5),
  strengths text,
  development_areas text,
  recommendation text,
  evidence_summary text,
  submitted_at timestamptz,
  acknowledged_at timestamptz,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evaluation_scores (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.evaluations(id) on delete cascade,
  criterion_id uuid references public.rubric_criteria(id) on delete set null,
  competency_id uuid references public.competencies(id) on delete set null,
  score numeric(4,2) not null check (score between 0 and 5),
  comment text not null,
  evidence_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.intern_documents (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  document_type text not null,
  title text not null,
  storage_path text,
  status public.document_status not null default 'required',
  is_sensitive boolean not null default false,
  expires_at date,
  notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programme_concerns (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid references public.placements(id) on delete set null,
  reported_by uuid references public.profiles(id) on delete set null,
  category public.concern_category not null,
  summary text not null,
  details text,
  status public.concern_status not null default 'open',
  is_confidential boolean not null default true,
  is_anonymous boolean not null default false,
  assigned_to uuid references public.profiles(id) on delete set null,
  resolution_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  asset_tag text not null unique,
  name text not null,
  category text not null,
  serial_number text,
  condition text,
  status text not null default 'available',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.asset_assignments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete restrict,
  placement_id uuid not null references public.placements(id) on delete cascade,
  status public.asset_assignment_status not null default 'reserved',
  issued_at timestamptz,
  due_back_at timestamptz,
  returned_at timestamptz,
  issue_condition text,
  return_condition text,
  issued_by uuid references public.profiles(id) on delete set null,
  received_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.system_access_resources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  owner_id uuid references public.profiles(id) on delete set null,
  provision_instructions text,
  revoke_instructions text,
  is_sensitive boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.access_assignments (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.system_access_resources(id) on delete restrict,
  placement_id uuid not null references public.placements(id) on delete cascade,
  access_level text,
  status public.access_assignment_status not null default 'requested',
  requested_at timestamptz not null default now(),
  provisioned_at timestamptz,
  revoke_by timestamptz,
  revoked_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  completed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stipend_payments (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency char(3) not null default 'KES',
  status public.payment_status not null default 'scheduled',
  reference text,
  scheduled_at timestamptz,
  paid_at timestamptz,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create table public.completion_requirements (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  category text not null,
  title text not null,
  is_required boolean not null default true,
  is_complete boolean not null default false,
  evidence_url text,
  completed_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.internship_outcomes (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null unique references public.placements(id) on delete cascade,
  completion_status public.completion_status not null default 'in_progress',
  final_score numeric(4,2) check (final_score between 0 and 5),
  strengths text,
  development_areas text,
  mentor_recommendation public.outcome_recommendation not null default 'none',
  intern_feedback text,
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  outcome_id uuid not null unique references public.internship_outcomes(id) on delete cascade,
  certificate_number text not null unique,
  issued_at timestamptz not null default now(),
  issued_by uuid references public.profiles(id) on delete set null,
  storage_path text,
  verification_token uuid not null unique default gen_random_uuid(),
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz not null default now()
);

create table public.alumni_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  latest_outcome_id uuid references public.internship_outcomes(id) on delete set null,
  current_title text,
  current_organization text,
  available_for_projects boolean not null default false,
  available_for_mentoring boolean not null default false,
  contact_consent boolean not null default false,
  contact_consent_at timestamptz,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.policies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  policy_type text not null,
  version text not null,
  content text not null,
  effective_from date not null,
  review_due date,
  is_mandatory boolean not null default true,
  is_published boolean not null default false,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (policy_type, version)
);

create table public.policy_acknowledgements (
  policy_id uuid not null references public.policies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  ip_hash text,
  primary key (policy_id, profile_id)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references public.internship_programmes(id) on delete cascade,
  title text not null,
  body text not null,
  audience_roles public.app_role[] not null default '{}',
  published_at timestamptz,
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  related_type text,
  related_id uuid,
  action_url text,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.risk_signals (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  level public.risk_level not null,
  signal_type text not null,
  reason text not null,
  source_record_type text,
  source_record_id uuid,
  detected_at timestamptz not null default now(),
  acknowledged_by uuid references public.profiles(id) on delete set null,
  acknowledged_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  resolution text
);

create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  scope_type text not null,
  scope_id uuid not null,
  insight_type text not null,
  title text not null,
  summary text not null,
  evidence jsonb not null default '[]'::jsonb,
  recommendation text,
  confidence numeric(4,3) check (confidence between 0 and 1),
  model_reference text,
  status public.insight_status not null default 'generated',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  generated_at timestamptz not null default now(),
  expires_at timestamptz
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_role text,
  action text not null,
  table_name text not null,
  record_id text,
  changed_fields text[] not null default '{}',
  request_id text,
  occurred_at timestamptz not null default now()
);

create table public.data_retention_policies (
  id uuid primary key default gen_random_uuid(),
  record_category text not null unique,
  purpose text not null,
  retention_months integer not null check (retention_months > 0),
  deletion_method text not null,
  legal_or_policy_basis text,
  owner_id uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.data_subject_requests (
  id uuid primary key default gen_random_uuid(),
  requester_profile_id uuid references public.profiles(id) on delete set null,
  requester_email text not null,
  request_type public.data_request_type not null,
  details text,
  status public.data_request_status not null default 'received',
  identity_verified_at timestamptz,
  assigned_to uuid references public.profiles(id) on delete set null,
  due_at timestamptz,
  completed_at timestamptz,
  response_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- High-value indexes.
create index applications_opportunity_status_idx on public.applications (opportunity_id, status, submitted_at desc);
create index placements_programme_status_idx on public.placements (programme_id, status);
create index placements_mentor_idx on public.placements (primary_mentor_id, status);
create index tasks_placement_status_due_idx on public.tasks (placement_id, status, due_at);
create index work_evidence_placement_idx on public.work_evidence (placement_id, created_at desc);
create index check_ins_placement_period_idx on public.internship_check_ins (placement_id, period_end desc);
create index attendance_placement_date_idx on public.attendance_records (placement_id, record_date desc);
create index feedback_placement_idx on public.feedback_entries (placement_id, created_at desc);
create index evaluations_placement_type_idx on public.evaluations (placement_id, evaluation_type, status);
create index concerns_status_idx on public.programme_concerns (status, created_at desc);
create index risk_signals_open_idx on public.risk_signals (placement_id, level) where resolved_at is null;
create index notifications_user_unread_idx on public.notifications (user_id, created_at desc) where is_read = false;

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

-- Operational views: metrics remain explainable and derive from source records.
create view public.intern_operating_summary
with (security_invoker = true)
as
select
  p.id as placement_id,
  p.intern_id,
  pr.full_name,
  ip.name as programme_name,
  pt.name as track_name,
  p.status,
  p.current_phase,
  p.start_date,
  p.end_date,
  p.risk_level,
  p.primary_mentor_id,
  round(coalesce((select avg(e.overall_score) from public.evaluations e where e.placement_id = p.id and e.status in ('submitted','acknowledged','locked')), 0), 2) as performance_score,
  coalesce((select count(*) from public.tasks t where t.placement_id = p.id and t.status = 'completed'), 0) as completed_tasks,
  coalesce((select count(*) from public.tasks t where t.placement_id = p.id and t.due_at < now() and t.status not in ('completed','approved','cancelled')), 0) as overdue_tasks,
  coalesce((select round(avg(g.progress)) from public.learning_goals g where g.placement_id = p.id), 0) as learning_progress,
  coalesce((select round(100.0 * count(*) filter (where a.status in ('present','remote','late')) / nullif(count(*), 0)) from public.attendance_records a where a.placement_id = p.id), 0) as attendance_rate
from public.placements p
join public.profiles pr on pr.id = p.intern_id
join public.internship_programmes ip on ip.id = p.programme_id
left join public.programme_tracks pt on pt.id = p.track_id;

create view public.mentor_capacity
with (security_invoker = true)
as
select
  pr.id as mentor_id,
  pr.full_name,
  count(p.id) filter (where p.status in ('preboarding','onboarding','active','paused','completing')) as active_interns,
  count(p.id) filter (where p.risk_level in ('high','critical')) as high_risk_interns,
  count(ci.id) filter (where ci.status = 'submitted') as check_ins_waiting
from public.profiles pr
left join public.placements p on p.primary_mentor_id = pr.id
left join public.internship_check_ins ci on ci.placement_id = p.id
where pr.role in ('mentor','supervisor')
group by pr.id, pr.full_name;

create view public.programme_health
with (security_invoker = true)
as
select
  ip.id as programme_id,
  ip.name,
  ip.cohort_label,
  ip.status,
  count(distinct p.id) filter (where p.status in ('onboarding','active','paused','completing')) as active_interns,
  count(distinct p.id) filter (where p.risk_level in ('high','critical')) as interns_at_risk,
  count(distinct t.id) filter (where t.due_at < now() and t.status not in ('approved','completed','cancelled')) as overdue_tasks,
  round(coalesce(avg(e.overall_score) filter (where e.status in ('submitted','acknowledged','locked')), 0), 2) as average_performance
from public.internship_programmes ip
left join public.placements p on p.programme_id = ip.id
left join public.tasks t on t.placement_id = p.id
left join public.evaluations e on e.placement_id = p.id
group by ip.id, ip.name, ip.cohort_label, ip.status;

-- Row-level security.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','departments','internship_programmes','programme_tracks','opportunities','applications',
    'application_documents','application_reviews','interviews','interview_scores','offers','placements',
    'onboarding_items','competencies','programme_competencies','learning_goals','projects','project_members',
    'milestones','tasks','task_competencies','task_dependencies','work_evidence','task_comments',
    'internship_check_ins','feedback_entries','attendance_records','leave_requests','learning_resources',
    'programme_events','event_attendance','rubrics','rubric_criteria','evaluations','evaluation_scores',
    'intern_documents','programme_concerns','assets','asset_assignments','system_access_resources',
    'access_assignments','stipend_payments','completion_requirements','internship_outcomes','certificates',
    'alumni_profiles','policies','policy_acknowledgements','announcements','notifications','risk_signals',
    'ai_insights','audit_logs','data_retention_policies','data_subject_requests'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

-- Super/programme administrators manage operational records, except immutable audit entries.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','departments','internship_programmes','programme_tracks','opportunities','applications',
    'application_documents','application_reviews','interviews','interview_scores','offers','placements',
    'onboarding_items','competencies','programme_competencies','learning_goals','projects','project_members',
    'milestones','tasks','task_competencies','task_dependencies','work_evidence','task_comments',
    'internship_check_ins','feedback_entries','attendance_records','leave_requests','learning_resources',
    'programme_events','event_attendance','rubrics','rubric_criteria','evaluations','evaluation_scores',
    'intern_documents','programme_concerns','assets','asset_assignments','system_access_resources',
    'access_assignments','stipend_payments','completion_requirements','internship_outcomes','certificates',
    'alumni_profiles','policies','policy_acknowledgements','announcements','notifications','risk_signals',
    'ai_insights','data_retention_policies','data_subject_requests'
  ] loop
    execute format(
      'create policy admin_manage on public.%I for all using (public.has_any_role(array[''super_admin'',''programme_admin'']::public.app_role[])) with check (public.has_any_role(array[''super_admin'',''programme_admin'']::public.app_role[]))',
      table_name
    );
  end loop;
end $$;

create policy profiles_own_read on public.profiles for select using (id = auth.uid());
create policy profiles_own_insert on public.profiles for insert with check (id = auth.uid());
create policy profiles_own_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_staff_read on public.profiles for select using (public.is_programme_staff());

create policy opportunities_public_read on public.opportunities for select using (status = 'published');
create policy programmes_public_read on public.internship_programmes for select using (status in ('open','active'));
create policy tracks_public_read on public.programme_tracks for select using (is_active = true);
create policy applications_public_submit on public.applications for insert with check (
  status = 'submitted'
  and privacy_consent_at is not null
  and (applicant_user_id is null or applicant_user_id = auth.uid())
);
create policy applications_applicant_read on public.applications for select using (applicant_user_id = auth.uid());
create policy applications_recruiter_manage on public.applications for all using (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[]));
create policy recruitment_staff_manage_reviews on public.application_reviews for all using (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[]));
create policy recruitment_staff_manage_interviews on public.interviews for all using (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[]));
create policy recruitment_staff_manage_scores on public.interview_scores for all using (public.has_any_role(array['super_admin','programme_admin','recruiter','external_reviewer']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin','recruiter','external_reviewer']::public.app_role[]));
create policy recruitment_staff_manage_offers on public.offers for all using (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[]));

create policy placements_participant_read on public.placements for select using (
  intern_id = auth.uid() or primary_mentor_id = auth.uid() or supervisor_id = auth.uid() or programme_manager_id = auth.uid()
);
create policy projects_staff_read on public.projects for select using (public.is_programme_staff());
create policy projects_member_read on public.projects for select using (exists (
  select 1 from public.project_members pm join public.placements p on p.id = pm.placement_id
  where pm.project_id = projects.id and p.intern_id = auth.uid()
));
create policy tasks_participant_read on public.tasks for select using (exists (
  select 1 from public.placements p where p.id = tasks.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy tasks_supervisor_manage on public.tasks for all using (public.has_any_role(array['super_admin','programme_admin','mentor','supervisor']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin','mentor','supervisor']::public.app_role[]));
create policy tasks_intern_update on public.tasks for update using (exists (
  select 1 from public.placements p where p.id = tasks.placement_id and p.intern_id = auth.uid()
)) with check (exists (select 1 from public.placements p where p.id = tasks.placement_id and p.intern_id = auth.uid()));

create policy goals_participant_access on public.learning_goals for all using (exists (
  select 1 from public.placements p where p.id = learning_goals.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
)) with check (exists (
  select 1 from public.placements p where p.id = learning_goals.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy check_ins_participant_access on public.internship_check_ins for all using (exists (
  select 1 from public.placements p where p.id = internship_check_ins.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
)) with check (exists (
  select 1 from public.placements p where p.id = internship_check_ins.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy evidence_participant_access on public.work_evidence for all using (exists (
  select 1 from public.placements p where p.id = work_evidence.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
)) with check (exists (
  select 1 from public.placements p where p.id = work_evidence.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy attendance_participant_access on public.attendance_records for all using (exists (
  select 1 from public.placements p where p.id = attendance_records.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
)) with check (exists (
  select 1 from public.placements p where p.id = attendance_records.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy leave_participant_access on public.leave_requests for all using (exists (
  select 1 from public.placements p where p.id = leave_requests.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
)) with check (exists (
  select 1 from public.placements p where p.id = leave_requests.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy feedback_visible_to_intern on public.feedback_entries for select using (
  is_visible_to_intern and exists (select 1 from public.placements p where p.id = feedback_entries.placement_id and p.intern_id = auth.uid())
);
create policy feedback_supervisors_manage on public.feedback_entries for all using (public.has_any_role(array['mentor','supervisor','programme_admin','super_admin']::public.app_role[])) with check (public.has_any_role(array['mentor','supervisor','programme_admin','super_admin']::public.app_role[]));
create policy evaluation_intern_read on public.evaluations for select using (status <> 'draft' and exists (
  select 1 from public.placements p where p.id = evaluations.placement_id and p.intern_id = auth.uid()
));
create policy evaluation_staff_manage on public.evaluations for all using (public.has_any_role(array['mentor','supervisor','programme_admin','super_admin','external_reviewer']::public.app_role[])) with check (public.has_any_role(array['mentor','supervisor','programme_admin','super_admin','external_reviewer']::public.app_role[]));

create policy documents_participant_read on public.intern_documents for select using (exists (
  select 1 from public.placements p where p.id = intern_documents.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy documents_intern_submit on public.intern_documents for insert with check (exists (
  select 1 from public.placements p where p.id = intern_documents.placement_id and p.intern_id = auth.uid()
));
create policy concerns_report on public.programme_concerns for insert with check (reported_by = auth.uid() or (is_anonymous = true and reported_by is null));
create policy concerns_own_read on public.programme_concerns for select using (reported_by = auth.uid());
create policy concerns_authorized_manage on public.programme_concerns for all using (public.has_any_role(array['super_admin','programme_admin']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin']::public.app_role[]));
create policy outcomes_intern_read on public.internship_outcomes for select using (exists (
  select 1 from public.placements p where p.id = internship_outcomes.placement_id and p.intern_id = auth.uid()
));
create policy certificates_owner_read on public.certificates for select using (exists (
  select 1 from public.internship_outcomes o join public.placements p on p.id = o.placement_id
  where o.id = certificates.outcome_id and p.intern_id = auth.uid()
));
create policy alumni_own_access on public.alumni_profiles for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy policies_published_read on public.policies for select using (is_published = true);
create policy policy_ack_own on public.policy_acknowledgements for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy notifications_own on public.notifications for select using (user_id = auth.uid());
create policy notifications_mark_read on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy audit_admin_read on public.audit_logs for select using (public.has_any_role(array['super_admin','programme_admin']::public.app_role[]));
create policy data_requests_own_read on public.data_subject_requests for select using (requester_profile_id = auth.uid());
create policy data_requests_own_create on public.data_subject_requests for insert with check (requester_profile_id = auth.uid());

-- Canonical ITEK competency framework. Programme managers may tailor weights/targets.
insert into public.competencies (code, name, category, description) values
  ('TECH_PROGRAMMING', 'Programming', 'technical', 'Produces clear, correct and maintainable software.'),
  ('TECH_SYSTEMS', 'Systems thinking', 'technical', 'Understands components, dependencies and system behaviour.'),
  ('TECH_TESTING', 'Testing and quality', 'technical', 'Uses evidence to verify quality, reliability and correctness.'),
  ('TECH_DATA', 'Data literacy', 'technical', 'Collects, handles and interprets data responsibly.'),
  ('TECH_SECURITY', 'Security practice', 'technical', 'Applies secure, privacy-aware working practices.'),
  ('PRO_COMMUNICATION', 'Communication', 'professional', 'Communicates clearly across written, verbal and visual formats.'),
  ('PRO_CRITICAL', 'Critical thinking', 'professional', 'Frames problems, tests assumptions and uses evidence.'),
  ('PRO_TEAMWORK', 'Teamwork', 'professional', 'Contributes reliably and collaborates across disciplines.'),
  ('PRO_PROFESSIONALISM', 'Professionalism', 'professional', 'Demonstrates integrity, accountability and dependable judgment.'),
  ('PRO_LEADERSHIP', 'Leadership', 'professional', 'Creates clarity, supports others and takes appropriate ownership.'),
  ('PRO_SELF', 'Career and self-development', 'professional', 'Seeks feedback and directs continuous learning.'),
  ('INN_PRODUCT', 'Product thinking', 'innovation', 'Connects technical work to user and business value.'),
  ('INN_RESEARCH', 'Research', 'innovation', 'Investigates uncertainty systematically and communicates findings.'),
  ('INN_CREATIVITY', 'Creativity', 'innovation', 'Generates and tests useful, original approaches.');

insert into public.data_retention_policies (record_category, purpose, retention_months, deletion_method, legal_or_policy_basis)
values
  ('unsuccessful_applications', 'Recruitment administration and defensible selection records', 12, 'Delete or irreversibly anonymise', 'ITEK policy; verify current legal basis'),
  ('internship_records', 'Programme delivery, evaluation and completion evidence', 84, 'Review, minimise, then securely delete', 'ITEK policy; verify current legal basis'),
  ('sensitive_concerns', 'Safeguarding, investigation and accountability', 84, 'Restricted review and secure deletion', 'ITEK safeguarding and legal obligations'),
  ('audit_logs', 'Security and accountability', 24, 'Secure deletion after retention review', 'ITEK security policy');

commit;
