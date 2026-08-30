-- ITEK Internship OS migration: identity, departments, programmes and tracks
-- Generated from the reviewed greenfield schema; safe to run in order on a clean project.

begin;

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

commit;
