# ITEK Internship OS — database

The schema is versioned as ordered migrations. Run them in filename order; each file is
wrapped in its own transaction.

```
20260829000000_drop_legacy_impact360.sql   destructive: removes the old Impact360 model
20260829000100_enums.sql                   39 domain enums
20260829000200_identity_and_programme.sql  profiles, departments, programmes, tracks
20260829000300_recruitment.sql             opportunities → applications → interviews → offers
20260829000400_placement_and_learning.sql  placements, onboarding, competencies, learning goals
20260829000500_work_and_evidence.sql       projects, milestones, tasks, evidence, comments
20260829000600_development_and_attendance.sql check-ins, feedback, attendance, leave, events
20260829000700_performance_and_operations.sql rubrics, evaluations, documents, concerns, assets
20260829000800_outcomes_and_governance.sql completion, certificates, alumni, policies, audit
20260829000900_indexes.sql                 hot-path indexes
20260829001000_functions_and_triggers.sql  updated-at, new-user, application guards
20260829001100_roles_and_audit.sql         role helpers and the immutable audit trail
20260829001200_views.sql                   intern_operating_summary, mentor_capacity, programme_health
20260829001300_row_level_security.sql      RLS on all 55 tables
20260829001400_harden_role_assignment.sql  closes the sign-up privilege escalation
20260829001500_realtime.sql                publishes `notifications` for live updates
20260829001600_storage.sql                 private buckets for evidence and documents
```

The first file is destructive by design, but it is written entirely as
`drop ... if exists`, so on a brand-new project it is a no-op and safe to run in order
with the rest.

Then `supabase/seed.sql` for the competency framework and retention policies. The seed is
idempotent.

## Applying them

With the Supabase CLI against a linked project:

```bash
supabase db push
supabase db seed
```

Without the CLI, paste each file into the SQL Editor **in filename order**.

## First administrator

No account can create itself as an administrator — `20260829001400` closes that path.
Promote the first one from the SQL Editor, which runs as `postgres` and bypasses the guard:

```sql
update public.profiles set role = 'super_admin' where email = 'you@itek.co.ke';
```

Every subsequent role change should go through the audited function:

```sql
select public.assign_role('<profile-uuid>', 'programme_admin', 'Programme lead for 2026 intake');
```

## The old reset script

`scripts/reset_itek_internship_os.sql` is retained as the historical record of the greenfield
design. It is superseded by these migrations — do not run both.

## Verifying the push

After applying every migration and the seed, run [`verify.sql`](verify.sql) in the SQL
Editor. It changes nothing and returns a PASS/FAIL row per check — table and enum counts,
RLS coverage, the security functions and triggers, Realtime, storage buckets, seed data,
and whether an administrator exists yet.

Expect one row to read `ACTION NEEDED` on a fresh database: no `super_admin` exists until
you promote an account, which is the next step.

## What is not in the migrations

Two things cannot be, and must be done by hand:

1. **Promote the first administrator.** No account can create itself as one — that path
   is deliberately closed. Sign up through the app first, then run the `update` in the
   section above from the SQL Editor, which runs as `postgres` and bypasses the guard.

2. **Auth settings.** Email confirmation, password policy, the site URL and redirect
   allow-list live in the Supabase dashboard under Authentication, not in SQL. Set the
   site URL before sending anyone a sign-up link, or the confirmation email will point at
   `localhost`.
