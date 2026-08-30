-- ITEK Internship OS migration: opportunities, applications, interviews and offers
-- Generated from the reviewed greenfield schema; safe to run in order on a clean project.

begin;

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

commit;
