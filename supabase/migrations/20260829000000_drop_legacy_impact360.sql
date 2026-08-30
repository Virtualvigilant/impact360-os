-- ITEK Internship OS migration: remove the legacy Impact360 application model.
--
-- DESTRUCTIVE. This drops ITEK application objects in `public` only; Supabase-managed
-- `auth` and `storage` data is preserved. Take a verified backup before running it.
--
-- This migration is a no-op on a project that has never held the legacy model, so it
-- is safe to keep at the head of the migration chain.

begin;

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

commit;
