-- ITEK Internship OS migration: enable Realtime for the tables the interface subscribes to.
--
-- WHY THIS IS REQUIRED, NOT OPTIONAL
--   `src/lib/hooks/use-notifications.ts` opens a `postgres_changes` subscription on
--   `public.notifications`. Postgres only publishes changes for tables that belong to
--   the `supabase_realtime` publication. Without this migration the notification bell
--   still renders (it is seeded by the server) but never updates until a page reload —
--   the subscription connects and silently receives nothing.
--
--   Row-level security still applies to Realtime, so `notifications_own` keeps each
--   person's stream to their own rows.

begin;

-- A new Supabase project normally ships this publication, but do not assume it.
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- `alter publication ... add table` errors if the table is already a member, so add
-- only what is missing. This keeps the migration re-runnable.
do $$
declare
  target text;
begin
  foreach target in array array['notifications'] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = target
    ) then
      execute format('alter publication supabase_realtime add table public.%I', target);
    end if;
  end loop;
end $$;

commit;
