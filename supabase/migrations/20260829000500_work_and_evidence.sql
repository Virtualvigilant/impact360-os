-- ITEK Internship OS migration: projects, milestones, tasks, evidence and comments
-- Generated from the reviewed greenfield schema; safe to run in order on a clean project.

begin;

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

commit;
