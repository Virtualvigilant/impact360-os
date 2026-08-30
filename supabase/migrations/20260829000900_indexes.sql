-- ITEK Internship OS migration: high-value indexes
-- Generated from the reviewed greenfield schema; safe to run in order on a clean project.

begin;

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

commit;
