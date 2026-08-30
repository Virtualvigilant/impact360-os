-- ITEK Internship OS migration: row-level security policies
-- Generated from the reviewed greenfield schema; safe to run in order on a clean project.

begin;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','departments','internship_programmes','programme_tracks','opportunities','applications',
    'application_documents','application_reviews','interviews','interview_scores','offers','placements',
    'onboarding_items','competencies','programme_competencies','learning_goals','projects','project_members',
    'milestones','tasks','task_competencies','task_dependencies','work_evidence','task_comments',
    'internship_check_ins','feedback_entries','attendance_records','leave_requests','learning_resources',
    'programme_events','event_attendance','rubrics','rubric_criteria','evaluations','evaluation_scores',
    'intern_documents','programme_concerns','assets','asset_assignments','system_access_resources',
    'access_assignments','stipend_payments','completion_requirements','internship_outcomes','certificates',
    'alumni_profiles','policies','policy_acknowledgements','announcements','notifications','risk_signals',
    'ai_insights','audit_logs','data_retention_policies','data_subject_requests'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

-- Super/programme administrators manage operational records, except immutable audit entries.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','departments','internship_programmes','programme_tracks','opportunities','applications',
    'application_documents','application_reviews','interviews','interview_scores','offers','placements',
    'onboarding_items','competencies','programme_competencies','learning_goals','projects','project_members',
    'milestones','tasks','task_competencies','task_dependencies','work_evidence','task_comments',
    'internship_check_ins','feedback_entries','attendance_records','leave_requests','learning_resources',
    'programme_events','event_attendance','rubrics','rubric_criteria','evaluations','evaluation_scores',
    'intern_documents','programme_concerns','assets','asset_assignments','system_access_resources',
    'access_assignments','stipend_payments','completion_requirements','internship_outcomes','certificates',
    'alumni_profiles','policies','policy_acknowledgements','announcements','notifications','risk_signals',
    'ai_insights','data_retention_policies','data_subject_requests'
  ] loop
    execute format(
      'create policy admin_manage on public.%I for all using (public.has_any_role(array[''super_admin'',''programme_admin'']::public.app_role[])) with check (public.has_any_role(array[''super_admin'',''programme_admin'']::public.app_role[]))',
      table_name
    );
  end loop;
end $$;

create policy profiles_own_read on public.profiles for select using (id = auth.uid());
create policy profiles_own_insert on public.profiles for insert with check (id = auth.uid());
create policy profiles_own_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_staff_read on public.profiles for select using (public.is_programme_staff());

create policy opportunities_public_read on public.opportunities for select using (status = 'published');
create policy programmes_public_read on public.internship_programmes for select using (status in ('open','active'));
create policy tracks_public_read on public.programme_tracks for select using (is_active = true);
create policy applications_public_submit on public.applications for insert with check (
  status = 'submitted'
  and privacy_consent_at is not null
  and (applicant_user_id is null or applicant_user_id = auth.uid())
);
create policy applications_applicant_read on public.applications for select using (applicant_user_id = auth.uid());
create policy applications_recruiter_manage on public.applications for all using (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[]));
create policy recruitment_staff_manage_reviews on public.application_reviews for all using (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[]));
create policy recruitment_staff_manage_interviews on public.interviews for all using (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[]));
create policy recruitment_staff_manage_scores on public.interview_scores for all using (public.has_any_role(array['super_admin','programme_admin','recruiter','external_reviewer']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin','recruiter','external_reviewer']::public.app_role[]));
create policy recruitment_staff_manage_offers on public.offers for all using (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin','recruiter']::public.app_role[]));

create policy placements_participant_read on public.placements for select using (
  intern_id = auth.uid() or primary_mentor_id = auth.uid() or supervisor_id = auth.uid() or programme_manager_id = auth.uid()
);
create policy projects_staff_read on public.projects for select using (public.is_programme_staff());
create policy projects_member_read on public.projects for select using (exists (
  select 1 from public.project_members pm join public.placements p on p.id = pm.placement_id
  where pm.project_id = projects.id and p.intern_id = auth.uid()
));
create policy tasks_participant_read on public.tasks for select using (exists (
  select 1 from public.placements p where p.id = tasks.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy tasks_supervisor_manage on public.tasks for all using (public.has_any_role(array['super_admin','programme_admin','mentor','supervisor']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin','mentor','supervisor']::public.app_role[]));
create policy tasks_intern_update on public.tasks for update using (exists (
  select 1 from public.placements p where p.id = tasks.placement_id and p.intern_id = auth.uid()
)) with check (exists (select 1 from public.placements p where p.id = tasks.placement_id and p.intern_id = auth.uid()));

create policy goals_participant_access on public.learning_goals for all using (exists (
  select 1 from public.placements p where p.id = learning_goals.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
)) with check (exists (
  select 1 from public.placements p where p.id = learning_goals.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy check_ins_participant_access on public.internship_check_ins for all using (exists (
  select 1 from public.placements p where p.id = internship_check_ins.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
)) with check (exists (
  select 1 from public.placements p where p.id = internship_check_ins.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy evidence_participant_access on public.work_evidence for all using (exists (
  select 1 from public.placements p where p.id = work_evidence.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
)) with check (exists (
  select 1 from public.placements p where p.id = work_evidence.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy attendance_participant_access on public.attendance_records for all using (exists (
  select 1 from public.placements p where p.id = attendance_records.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
)) with check (exists (
  select 1 from public.placements p where p.id = attendance_records.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy leave_participant_access on public.leave_requests for all using (exists (
  select 1 from public.placements p where p.id = leave_requests.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
)) with check (exists (
  select 1 from public.placements p where p.id = leave_requests.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy feedback_visible_to_intern on public.feedback_entries for select using (
  is_visible_to_intern and exists (select 1 from public.placements p where p.id = feedback_entries.placement_id and p.intern_id = auth.uid())
);
create policy feedback_supervisors_manage on public.feedback_entries for all using (public.has_any_role(array['mentor','supervisor','programme_admin','super_admin']::public.app_role[])) with check (public.has_any_role(array['mentor','supervisor','programme_admin','super_admin']::public.app_role[]));
create policy evaluation_intern_read on public.evaluations for select using (status <> 'draft' and exists (
  select 1 from public.placements p where p.id = evaluations.placement_id and p.intern_id = auth.uid()
));
create policy evaluation_staff_manage on public.evaluations for all using (public.has_any_role(array['mentor','supervisor','programme_admin','super_admin','external_reviewer']::public.app_role[])) with check (public.has_any_role(array['mentor','supervisor','programme_admin','super_admin','external_reviewer']::public.app_role[]));

create policy documents_participant_read on public.intern_documents for select using (exists (
  select 1 from public.placements p where p.id = intern_documents.placement_id
  and (p.intern_id = auth.uid() or p.primary_mentor_id = auth.uid() or p.supervisor_id = auth.uid())
));
create policy documents_intern_submit on public.intern_documents for insert with check (exists (
  select 1 from public.placements p where p.id = intern_documents.placement_id and p.intern_id = auth.uid()
));
create policy concerns_report on public.programme_concerns for insert with check (reported_by = auth.uid() or (is_anonymous = true and reported_by is null));
create policy concerns_own_read on public.programme_concerns for select using (reported_by = auth.uid());
create policy concerns_authorized_manage on public.programme_concerns for all using (public.has_any_role(array['super_admin','programme_admin']::public.app_role[])) with check (public.has_any_role(array['super_admin','programme_admin']::public.app_role[]));
create policy outcomes_intern_read on public.internship_outcomes for select using (exists (
  select 1 from public.placements p where p.id = internship_outcomes.placement_id and p.intern_id = auth.uid()
));
create policy certificates_owner_read on public.certificates for select using (exists (
  select 1 from public.internship_outcomes o join public.placements p on p.id = o.placement_id
  where o.id = certificates.outcome_id and p.intern_id = auth.uid()
));
create policy alumni_own_access on public.alumni_profiles for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy policies_published_read on public.policies for select using (is_published = true);
create policy policy_ack_own on public.policy_acknowledgements for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy notifications_own on public.notifications for select using (user_id = auth.uid());
create policy notifications_mark_read on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy audit_admin_read on public.audit_logs for select using (public.has_any_role(array['super_admin','programme_admin']::public.app_role[]));
create policy data_requests_own_read on public.data_subject_requests for select using (requester_profile_id = auth.uid());
create policy data_requests_own_create on public.data_subject_requests for insert with check (requester_profile_id = auth.uid());

commit;
