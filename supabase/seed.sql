-- ITEK Internship OS seed: reference data every project needs.
-- Idempotent: safe to re-run.

begin;
-- Canonical ITEK competency framework. Programme managers may tailor weights/targets.
insert into public.competencies (code, name, category, description) values
  ('TECH_PROGRAMMING', 'Programming', 'technical', 'Produces clear, correct and maintainable software.'),
  ('TECH_SYSTEMS', 'Systems thinking', 'technical', 'Understands components, dependencies and system behaviour.'),
  ('TECH_TESTING', 'Testing and quality', 'technical', 'Uses evidence to verify quality, reliability and correctness.'),
  ('TECH_DATA', 'Data literacy', 'technical', 'Collects, handles and interprets data responsibly.'),
  ('TECH_SECURITY', 'Security practice', 'technical', 'Applies secure, privacy-aware working practices.'),
  ('PRO_COMMUNICATION', 'Communication', 'professional', 'Communicates clearly across written, verbal and visual formats.'),
  ('PRO_CRITICAL', 'Critical thinking', 'professional', 'Frames problems, tests assumptions and uses evidence.'),
  ('PRO_TEAMWORK', 'Teamwork', 'professional', 'Contributes reliably and collaborates across disciplines.'),
  ('PRO_PROFESSIONALISM', 'Professionalism', 'professional', 'Demonstrates integrity, accountability and dependable judgment.'),
  ('PRO_LEADERSHIP', 'Leadership', 'professional', 'Creates clarity, supports others and takes appropriate ownership.'),
  ('PRO_SELF', 'Career and self-development', 'professional', 'Seeks feedback and directs continuous learning.'),
  ('INN_PRODUCT', 'Product thinking', 'innovation', 'Connects technical work to user and business value.'),
  ('INN_RESEARCH', 'Research', 'innovation', 'Investigates uncertainty systematically and communicates findings.'),
  ('INN_CREATIVITY', 'Creativity', 'innovation', 'Generates and tests useful, original approaches.')
on conflict (code) do nothing;

insert into public.data_retention_policies (record_category, purpose, retention_months, deletion_method, legal_or_policy_basis)
values
  ('unsuccessful_applications', 'Recruitment administration and defensible selection records', 12, 'Delete or irreversibly anonymise', 'ITEK policy; verify current legal basis'),
  ('internship_records', 'Programme delivery, evaluation and completion evidence', 84, 'Review, minimise, then securely delete', 'ITEK policy; verify current legal basis'),
  ('sensitive_concerns', 'Safeguarding, investigation and accountability', 84, 'Restricted review and secure deletion', 'ITEK safeguarding and legal obligations'),
  ('audit_logs', 'Security and accountability', 24, 'Secure deletion after retention review', 'ITEK security policy')
on conflict (record_category) do nothing;


commit;
