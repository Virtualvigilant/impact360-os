-- ITEK Internship OS migration: completion, certificates, alumni, policies, notifications, risk and audit
-- Generated from the reviewed greenfield schema; safe to run in order on a clean project.

begin;

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

commit;
