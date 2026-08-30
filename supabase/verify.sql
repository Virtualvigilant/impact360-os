-- ITEK Internship OS — post-deployment verification.
--
-- Run this in the Supabase SQL Editor AFTER applying every migration and the seed.
-- It changes nothing. Each check returns PASS or FAIL with what it found, so a partial
-- or out-of-order push is visible immediately rather than at the first broken page.

with expected as (
  select 55 as tables, 32 as enums, 3 as views, 12 as indexes
),
found as (
  select
    (select count(*) from pg_tables where schemaname = 'public')                                as tables,
    (select count(*) from pg_type t
       join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public' and t.typtype = 'e')                                           as enums,
    (select count(*) from pg_views where schemaname = 'public')                                 as views,
    (select count(*) from pg_indexes
      where schemaname = 'public' and indexname like '%_idx')                                   as indexes,
    (select count(*) from pg_tables
      where schemaname = 'public' and rowsecurity = false)                                      as tables_without_rls,
    (select count(*) from pg_policies where schemaname = 'public')                              as policies,
    (select count(*) from public.competencies)                                                  as competencies,
    (select count(*) from public.data_retention_policies)                                       as retention_rules,
    (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in ('handle_new_user','set_updated_at','current_app_role','has_any_role',
                          'is_programme_staff','audit_row_change','protect_profile_privileges',
                          'protect_application_system_fields','assign_role'))                   as functions,
    (select count(*) from pg_trigger where tgname = 'on_auth_user_created')                     as auth_trigger,
    (select count(*) from pg_trigger where tgname = 'profiles_protect_privileges')              as privilege_trigger,
    (select count(*) from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public'
        and tablename = 'notifications')                                                        as realtime_notifications,
    (select count(*) from storage.buckets where id in ('intern-documents','work-evidence'))     as storage_buckets,
    (select count(*) from public.profiles where role = 'super_admin')                           as super_admins
)
select check_name, status, detail from (
  values
    ('Tables created',
     case when (select tables from found) >= (select tables from expected) then 'PASS' else 'FAIL' end,
     (select tables from found) || ' of ' || (select tables from expected) || ' expected'),

    ('Enum types created',
     case when (select enums from found) >= (select enums from expected) then 'PASS' else 'FAIL' end,
     (select enums from found) || ' of ' || (select enums from expected) || ' expected'),

    ('Operational views created',
     case when (select views from found) >= (select views from expected) then 'PASS' else 'FAIL' end,
     (select views from found) || ' of ' || (select views from expected) || ' expected'),

    ('Row-level security on every table',
     case when (select tables_without_rls from found) = 0 then 'PASS' else 'FAIL' end,
     (select tables_without_rls from found) || ' table(s) WITHOUT rls -- any table here is readable by anyone with the anon key'),

    ('Policies present',
     case when (select policies from found) >= 45 then 'PASS' else 'FAIL' end,
     (select policies from found) || ' policies'),

    ('Security functions present',
     case when (select functions from found) = 9 then 'PASS' else 'FAIL' end,
     (select functions from found) || ' of 9 -- assign_role missing means migration 1400 did not run'),

    ('Sign-up trigger installed',
     case when (select auth_trigger from found) > 0 then 'PASS' else 'FAIL' end,
     'on_auth_user_created'),

    ('Privilege escalation closed',
     case when exists (
       select 1 from pg_trigger t
        where t.tgname = 'profiles_protect_privileges'
          and (t.tgtype & 4) > 0   -- fires on INSERT
          and (t.tgtype & 16) > 0  -- fires on UPDATE
     ) then 'PASS' else 'FAIL' end,
     'profiles_protect_privileges must cover INSERT and UPDATE, not UPDATE alone'),

    ('Realtime enabled for notifications',
     case when (select realtime_notifications from found) > 0 then 'PASS' else 'WARN' end,
     'without this the notification bell never updates live'),

    ('Storage buckets created',
     case when (select storage_buckets from found) = 2 then 'PASS' else 'WARN' end,
     (select storage_buckets from found) || ' of 2 -- only needed once file upload is built'),

    ('Seed data loaded',
     case when (select competencies from found) >= 14 and (select retention_rules from found) >= 4
          then 'PASS' else 'FAIL' end,
     (select competencies from found) || ' competencies, ' || (select retention_rules from found) || ' retention rules'),

    ('An administrator exists',
     case when (select super_admins from found) > 0 then 'PASS' else 'ACTION NEEDED' end,
     case when (select super_admins from found) > 0
          then (select super_admins from found) || ' super_admin account(s)'
          else 'no super_admin yet -- promote your account, see supabase/README.md' end)
) as checks(check_name, status, detail);
