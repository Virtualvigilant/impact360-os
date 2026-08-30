-- ITEK Internship OS migration: placements, onboarding, competencies and learning goals
-- Generated from the reviewed greenfield schema; safe to run in order on a clean project.

begin;

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

commit;
