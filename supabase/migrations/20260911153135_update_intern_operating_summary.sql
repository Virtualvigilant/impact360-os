create or replace view public.intern_operating_summary
with (security_invoker = true)
as
select
  p.id as placement_id,
  pr.id as intern_id,
  pr.full_name,
  pr.email,
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
from public.profiles pr
left join public.placements p on p.intern_id = pr.id
left join public.internship_programmes ip on ip.id = p.programme_id
left join public.programme_tracks pt on pt.id = p.track_id
where pr.role = 'intern';
