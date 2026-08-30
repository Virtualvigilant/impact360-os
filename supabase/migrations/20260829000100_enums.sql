-- ITEK Internship OS migration: enum types
-- Generated from the reviewed greenfield schema; safe to run in order on a clean project.

begin;

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

commit;
