-- ITEK Internship OS migration: check-ins, feedback, attendance, leave, resources and events
-- Generated from the reviewed greenfield schema; safe to run in order on a clean project.

begin;

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

commit;
