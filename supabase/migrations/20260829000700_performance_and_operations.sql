-- ITEK Internship OS migration: rubrics, evaluations, documents, concerns, assets, access and stipends
-- Generated from the reviewed greenfield schema; safe to run in order on a clean project.

begin;

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

commit;
