# ITEK Internship OS

The system of record for ITEK's internship programme: planning, selection, supervision,
development, evaluation, completion, and the talent network afterwards.

```
Opportunity → Application → Selection → Offer → Placement → Learning + Work
           → Feedback → Evaluation → Completion → Alumni / Next opportunity
```

The governing question is not "what did the intern finish?" It is: who is this person,
why were they selected, what should they learn, who owns their supervision, what
meaningful work did they do, what evidence did they produce, what feedback did they
receive, what capabilities changed, and what are they ready for next.

## Getting started

```bash
cp .env.example .env.local     # fill in from Supabase → Project settings → API
npm install
npm run dev
```

Then apply the database — see [`supabase/README.md`](supabase/README.md). Until the
migrations are run, every module renders a notice saying so rather than a generic error.

## Verifying a change

```bash
npm run verify        # typecheck + lint + tests
npm run build
```

| Command | Does |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint, with `no-explicit-any` as an error |
| `npm test` | Vitest — access control, workflow rules, validation, schema contract |
| `npm run db:types` | Regenerates `src/types/database.ts` from `supabase/migrations` |

CI runs all of these plus a check that the committed types still match the migrations.

## Architecture

```
src/
  app/                    Routes. Server Components by default.
    (auth)/               Sign in, sign up
    (dashboard)/          Authenticated shell; layout resolves the session once
    opportunities/        Public catalogue and application form
    api/                  Route handlers (session-gated, rate limited)
  components/
    shell/                Header, sidebar, command palette, session provider
    primitives/           PageHeader, StatCard, StatusBadge, FilterBar, Pagination,
                          ActionForm — the shared vocabulary every module uses
    <domain>/             Module-specific components
  lib/
    auth/                 roles, permissions, route access, server session
    domain/               Pure business rules — transitions, pipeline, metrics, paging
    data/                 Typed read queries, one module per domain (server only)
    actions/              Server actions: authenticate → authorise → validate → write
    validation/           Zod schemas
    utils/                Formatting, notifications
  types/database.ts       Generated from the migrations — do not edit by hand
supabase/
  migrations/             Ordered, transactional schema
  seed.sql                Competency framework and retention policies
```

### The rules that hold everything together

**The database is the security boundary.** Row-level security applies to all 55 tables.
The permission checks in `lib/auth/roles.ts` decide what the interface *offers*; they are
defence in depth, not the boundary. A test asserts every table created by a migration
appears in the RLS enable list.

**Roles are assigned, never claimed.** No account can create itself as anything but an
intern. Role changes go through `public.assign_role`, which only a programme
administrator may call and which writes an audit entry with a stated reason.

**Reads are paged in Postgres.** Every list query takes a bounded range and filters
server-side. Page size is clamped, and search terms are escaped before they reach a
PostgREST filter expression.

**Writes are validated server-side.** Every mutation is a server action that
authenticates, checks a named permission, parses a Zod schema, then writes — returning
field-level errors the form renders in place.

**Workflow rules live in one place.** Task transitions and pipeline stages are pure
functions in `lib/domain/`, imported by both the component that renders the buttons and
the action that enforces them, so the interface cannot offer a move the server rejects.

**Consequential decisions carry a reason.** A pipeline decision without a written
rationale is refused. A criterion score without a comment is refused. Anonymous concern
reports store no reporter id — not a hidden one.

**AI assists; it does not decide.** Every risk signal states the rule that fired. Every
model insight stores its evidence, confidence, model reference and human-review status.

## Roles

| Role | Owns |
| --- | --- |
| `super_admin` | Platform governance and final authority |
| `programme_admin` | Programmes, placements, operations, outcomes, governance |
| `recruiter` | Opportunities, applications, interviews, offers |
| `mentor` | Learning, reflection, feedback, development |
| `supervisor` | Work assignment, delivery review, performance evidence |
| `intern` | Own placement, work, development, feedback, operations |
| `alumni` | Own professional record and consent-based opportunity network |
| `external_reviewer` | Explicitly scoped evaluation participation |

## Governance boundary

The schema provides configurable records for industrial-attachment permissions, named
supervision, completion certificates, applicant consent, retention and data-subject
requests. These help ITEK operate its policy. They are not a substitute for reviewing
the exact programme against current Kenyan legal advice — confirm which intakes fall
within the Industrial Training Act framework before production.
