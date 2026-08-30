-- ITEK Internship OS migration: explainable operational views
-- Generated from the reviewed greenfield schema; safe to run in order on a clean project.

begin;

-- Operational views: metrics remain explainable and derive from source records.
create view public.intern_operating_summary
with (security_invoker = true)
as
select
  p.id as placement_id,
  p.intern_id,
  pr.full_name,
  ip.name as programme_name,
  pt.name as track_name,
  p.status,
  p.current_phase,
  p.start_date,
  p.end_date,
  p.risk_level,
  p.primary_mentor_id,
  round(coalesce((select avg(e.overall_score) from public.evaluations e where e.placement_id = p.id and e.status in ('submitted','acknowledged','locked')), 0), 2) as performance_score,
  coalesce((select count(*) from public.tasks t where t.placement_id = p.id and t.status = 'completed'), 0) as completed_tasks,
  coalesce((select count(*) from public.tasks t where t.placement_id = p.id and t.due_at < now() and t.status not in ('completed','approved','cancelled')), 0) as overdue_tasks,
  coalesce((select round(avg(g.progress)) from public.learning_goals g where g.placement_id = p.id), 0) as learning_progress,
  coalesce((select round(100.0 * count(*) filter (where a.status in ('present','remote','late')) / nullif(count(*), 0)) from public.attendance_records a where a.placement_id = p.id), 0) as attendance_rate
from public.placements p
join public.profiles pr on pr.id = p.intern_id
join public.internship_programmes ip on ip.id = p.programme_id
left join public.programme_tracks pt on pt.id = p.track_id;

create view public.mentor_capacity
with (security_invoker = true)
as
select
  pr.id as mentor_id,
  pr.full_name,
  count(p.id) filter (where p.status in ('preboarding','onboarding','active','paused','completing')) as active_interns,
  count(p.id) filter (where p.risk_level in ('high','critical')) as high_risk_interns,
  count(ci.id) filter (where ci.status = 'submitted') as check_ins_waiting
from public.profiles pr
left join public.placements p on p.primary_mentor_id = pr.id
left join public.internship_check_ins ci on ci.placement_id = p.id
where pr.role in ('mentor','supervisor')
group by pr.id, pr.full_name;

create view public.programme_health
with (security_invoker = true)
as
select
  ip.id as programme_id,
  ip.name,
  ip.cohort_label,
  ip.status,
  count(distinct p.id) filter (where p.status in ('onboarding','active','paused','completing')) as active_interns,
  count(distinct p.id) filter (where p.risk_level in ('high','critical')) as interns_at_risk,
  count(distinct t.id) filter (where t.due_at < now() and t.status not in ('approved','completed','cancelled')) as overdue_tasks,
  round(coalesce(avg(e.overall_score) filter (where e.status in ('submitted','acknowledged','locked')), 0), 2) as average_performance
from public.internship_programmes ip
left join public.placements p on p.programme_id = ip.id
left join public.tasks t on t.placement_id = p.id
left join public.evaluations e on e.placement_id = p.id
group by ip.id, ip.name, ip.cohort_label, ip.status;


commit;
