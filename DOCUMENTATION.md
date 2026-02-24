# Impact360 OS — Platform Documentation

> **Impact360 OS** is a full-stack developer training & team management platform that takes beginners through a structured pipeline—from intake to client-ready deployment—using real projects, evaluations, gamification, and mentorship.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Developer Pipeline](#developer-pipeline)
6. [Learning Tracks](#learning-tracks)
7. [Feature Reference](#feature-reference)
8. [Database Schema](#database-schema)
9. [Project Structure](#project-structure)
10. [Environment Variables](#environment-variables)
11. [Deployment](#deployment)
12. [SQL Migrations](#sql-migrations)
13. [Contributing](#contributing)

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Virtualvigilant/impact360-os.git
cd impact360-os

# 2. Install dependencies
npm install

# 3. Copy environment file and fill in your Supabase credentials
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | **Next.js 16** (App Router) | Server-side rendering, routing, API |
| UI Library | **React 19** | Component-based UI |
| Language | **TypeScript 5** | Type-safe development |
| Styling | **Tailwind CSS 4** | Utility-first CSS |
| Component Kit | **shadcn/ui** (Radix primitives) | Accessible, composable UI components |
| Icons | **Lucide React** | 1,000+ consistent SVG icons |
| Charts | **Recharts** | Analytics visualizations |
| Backend/DB | **Supabase** (PostgreSQL + Auth + Realtime) | Authentication, database, row-level security, real-time subscriptions |
| Toasts | **Sonner** | Notification toasts |
| Theming | **next-themes** | Light/dark mode toggle |
| Date Utils | **date-fns** | Date formatting & manipulation |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Next.js App Router                 │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  (auth)   │  │ (dashboard)  │  │  Landing Page │  │
│  │ sign-in   │  │  14 sections │  │   / (public)  │  │
│  │ sign-up   │  │  role-gated  │  │               │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────┤
│                   Component Layer                    │
│  admin/ · auth/ · teams/ · notifications/            │
│  layout/ · charts/ · evaluations/ · onboarding/      │
│  ui/ (18 shadcn components)                          │
├─────────────────────────────────────────────────────┤
│                    Hooks & Utils                     │
│  useAuth · useMembers · useNotifications · useProjects│
│  format · badges · constants · notifications          │
├─────────────────────────────────────────────────────┤
│                  Supabase (Backend)                   │
│  PostgreSQL · Auth · Realtime · RLS Policies          │
│  12 tables · 6 enums · Row-Level Security             │
└─────────────────────────────────────────────────────┘
```

---

## User Roles & Permissions

| Role | Description | Key Capabilities |
|------|-------------|-----------------|
| **Admin** | Program manager / CEO | Create cohorts, projects, teams; assign tasks; evaluate submissions; manage members; view analytics; promote/demote users |
| **Mentor** | Senior developer / guide | View teams & members; review submissions; assist with evaluations; limited admin access |
| **Member** | Learner / developer-in-training | View assigned projects/tasks; submit work; track progress; earn badges; update profile |

**Row-Level Security (RLS)** enforces these permissions at the database level—every Supabase query is automatically filtered based on the authenticated user's role.

---

## Developer Pipeline

Members progress through a **6-stage pipeline** that mirrors a real developer career path:

```
┌─────────┐    ┌──────────┐    ┌──────────────────┐    ┌────────────┐    ┌──────────────┐    ┌──────────┐
│  INTAKE  │ →  │ TRAINING │ →  │ INTERNAL PROJECTS│ →  │ EVALUATION │ →  │ CLIENT READY │ →  │ DEPLOYED │
│ (Gray)   │    │ (Blue)   │    │ (Purple)         │    │ (Yellow)   │    │ (Green)      │    │(Emerald) │
└─────────┘    └──────────┘    └──────────────────┘    └────────────┘    └──────────────┘    └──────────┘
```

| Stage | What Happens |
|-------|-------------|
| **Intake** | New member joins, completes onboarding wizard, selects track & experience level |
| **Training** | Works through curriculum modules for their chosen track |
| **Internal Projects** | Assigned real projects (solo or team), builds deliverables |
| **Evaluation** | Submissions are graded on 6 criteria (code quality, architecture, problem solving, communication, teamwork, reliability) |
| **Client Ready** | Passed evaluation—ready for client-facing work |
| **Deployed** | Actively working on client/production projects |

---

## Learning Tracks

Each member selects a specialization track:

| Track | Key Skills |
|-------|-----------|
| 🌐 **Web Development** | HTML/CSS, JavaScript, TypeScript, React, Next.js, Node.js, SQL, REST APIs, Tailwind CSS, Git |
| 🤖 **AI & Machine Learning** | Python, NumPy, Pandas, TensorFlow, PyTorch, NLP, Computer Vision, LLMs, Deep Learning |
| 🎨 **UI/UX Design** | Figma, Adobe XD, Wireframing, Prototyping, Design Systems, Typography, Color Theory, Accessibility |
| 📱 **Mobile Development** | React Native, Flutter, Swift, Kotlin, Firebase, App Store Publishing, Push Notifications |
| ⚙️ **DevOps Engineering** | Linux, Docker, Kubernetes, AWS/GCP/Azure, CI/CD, Terraform, Monitoring, Shell Scripting |

---

## Feature Reference

### 🏠 Dashboard (`/dashboard`)
The main hub — displays:
- Welcome message with user's name and role
- Stats cards (total members, active projects, pending submissions, completion rate)
- Pipeline distribution chart (how many members at each stage)
- Recent activity feed
- Quick-action buttons (role-dependent)

### 👥 Members (`/dashboard/members`)
- **Admin view**: Full member list with search, filter by stage/track/cohort, and bulk actions
- **Member profiles**: Click through to see detailed profile, assigned projects, progress, and badges
- **Pipeline management**: Admins can promote members through stages

### 📁 Projects (`/dashboard/projects`, `/dashboard/all-projects`)
- **Create projects**: Title, description, difficulty, track, tech stack, deliverables, deadlines, milestones
- **Assign projects**: Admins assign projects to individual members or teams via `AssignProjectDialogue`
- **Track status**: Not Started → In Progress → Submitted → Under Review → Completed/Rejected
- **Milestones**: JSONB-based milestone tracking within each project

### 👨‍👩‍👧‍👦 Teams (`/dashboard/teams`, `/dashboard/teams/[id]`)
- **Create teams**: Name + add members via `TeamDialog`
- **Team detail page**: Shows team members, active projects, and the **Team Tasks** section
- **Team tasks**: Admins assign granular tasks to individual members within teams

### ✅ My Tasks (`/dashboard/my-tasks`)
- **Member-only view**: See all assigned tasks grouped by status
- **Status chips**: Not Started, In Progress, Submitted, Completed, Rejected
- **Actions**: Mark as "In Progress", submit work (GitHub URL, demo URL, notes)
- **Admin feedback bubble**: After review, members see the admin's written review on their task card (green for approved, red for rejected)

### 📨 Submissions (`/dashboard/submissions`)
- **Project Submissions tab**: Lists all pending project submissions with evaluate buttons
- **Task Submissions tab**: Lists all team task submissions
  - **Review dialog**: Full submission details + admin review textarea + Approve/Reject buttons
  - Non-pending submissions can be viewed but not re-reviewed

### 📊 Evaluate (`/dashboard/evaluate/[id]`)
- Score submissions on **6 criteria** (1–10 scale each):
  - Code Quality, Architecture, Problem Solving, Communication, Teamwork, Reliability
- Written feedback field
- Auto-calculates average score

### 🏅 Achievements (`/dashboard/achievements`)
- Badge system for gamification
- Badges awarded for milestones (first project, first eval, streak completions, etc.)
- XP and level progression

### 📈 Analytics (`/dashboard/analytics`)
- Charts powered by **Recharts**
- Pipeline distribution, project completion rates, submission frequency
- Role-filtered views (admins see org-wide, members see personal)

### 📚 Curriculum (`/dashboard/curriculum`)
- Module-based learning content organized by track
- Topics list, duration, and resource links per module
- Ordered progression (`order_index`)

### 🎓 Cohorts (`/dashboard/cohorts`)
- Group members into time-bound learning cohorts
- Each cohort is tied to a track with start/end dates
- Mentor assignment per cohort

### 🧭 Track Selection (`/dashboard/track`)
- Visual track picker (Web Dev, AI/ML, Design, Mobile, DevOps)
- Updates member profile with chosen specialization

### 🚀 Deployments (`/dashboard/deployments`)
- Track deployed members and their client assignments

### ⚙️ Settings (`/dashboard/settings`)
- User preferences and profile updates

### 👤 Profile (`/dashboard/profile`)
- View/edit personal information, bio, skills, social links
- Experience level and interests

### 🔔 Notifications (Header dropdown)
- **Real-time** via Supabase Realtime subscriptions
- Toast alerts for new notifications
- Mark as read (individual or all)
- **Delete individual** notifications (hover × button)
- **Clear all** notifications at once
- Notification types: project assignments, evaluations, stage changes, task reviews

---

## Database Schema

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User identity (synced with Supabase Auth) | `id`, `email`, `full_name`, `role`, `avatar_url` |
| `member_profiles` | Extended member data | `current_stage`, `track`, `cohort_id`, `skills[]`, `level`, `experience_points`, `is_client_ready`, `completed_module_ids[]` |
| `cohorts` | Learning groups | `name`, `track`, `start_date`, `end_date`, `is_active`, `mentor_ids[]` |
| `projects` | Assignable projects | `title`, `description`, `difficulty`, `track`, `tech_stack[]`, `deliverables[]`, `milestones` (JSONB) |
| `teams` | Collaboration groups | `name`, `project_id`, `created_by` |
| `team_members` | Team membership | `team_id`, `user_id`, `role` (leader/member) |
| `project_assignments` | Project ↔ Member link | `project_id`, `member_id`, `team_id`, `status`, `milestone_progress` |
| `submissions` | Work submitted for review | `assignment_id`, `github_url`, `demo_url`, `notes` |
| `team_tasks` | Granular tasks within teams | `team_id`, `title`, `assigned_to`, `status`, `admin_review`, `reviewed_at` |
| `team_task_submissions` | Task submission data | `task_id`, `member_id`, `github_url`, `demo_url`, `notes` |
| `evaluations` | Graded assessments | `submission_id`, `evaluator_id`, 6 criteria scores, `average_score`, `feedback` |
| `badges` | Achievement definitions | `name`, `description`, `icon`, `criteria` (JSONB) |
| `notifications` | User alerts | `user_id`, `title`, `message`, `type`, `is_read`, `related_id` |
| `curriculum_modules` | Learning content | `track`, `title`, `topics[]`, `duration`, `order_index`, `resources[]` |

### Enums

| Enum | Values |
|------|--------|
| `user_role` | `member`, `mentor`, `admin` |
| `pipeline_stage` | `intake`, `training`, `internal_projects`, `evaluation`, `client_ready`, `deployed` |
| `track_type` | `web_development`, `ai_ml`, `design`, `mobile`, `devops` |
| `project_status` | `not_started`, `in_progress`, `submitted`, `under_review`, `completed`, `rejected` |
| `project_difficulty` | `beginner`, `intermediate`, `advanced` |
| `experience_level` | `beginner`, `intermediate`, `advanced` |
| `task_status` | `not_started`, `in_progress`, `submitted`, `completed`, `rejected` |

---

## Project Structure

```
impact360-os/
├── public/                          # Static assets
├── scripts/                         # SQL migration files
│   ├── team_tasks_migration.sql
│   └── team_tasks_add_review_columns.sql
├── src/
│   ├── app/
│   │   ├── (auth)/                  # Auth pages (sign-in, sign-up)
│   │   ├── (dashboard)/             # Protected dashboard pages
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx         # Main dashboard
│   │   │   │   ├── achievements/
│   │   │   │   ├── all-projects/
│   │   │   │   ├── analytics/
│   │   │   │   ├── cohorts/
│   │   │   │   ├── curriculum/
│   │   │   │   ├── deployments/
│   │   │   │   ├── evaluate/
│   │   │   │   ├── members/
│   │   │   │   ├── my-tasks/
│   │   │   │   ├── profile/
│   │   │   │   ├── projects/
│   │   │   │   ├── settings/
│   │   │   │   ├── submissions/
│   │   │   │   ├── teams/
│   │   │   │   └── track/
│   │   │   └── layout.tsx           # Dashboard shell (sidebar + header)
│   │   ├── globals.css              # Tailwind imports + theme tokens
│   │   ├── layout.tsx               # Root layout (fonts, metadata)
│   │   └── page.tsx                 # Landing page (public)
│   ├── components/
│   │   ├── admin/                   # Admin-only dialogs
│   │   │   ├── AssignProjectDialogue.tsx
│   │   │   ├── AssignTeamTaskDialog.tsx
│   │   │   ├── CohortDialog.tsx
│   │   │   ├── ProjectDialog.tsx
│   │   │   ├── TaskReviewDialog.tsx
│   │   │   └── TeamDialog.tsx
│   │   ├── auth/                    # Auth forms & guards
│   │   ├── charts/                  # Recharts visualizations
│   │   ├── evaluations/             # Evaluation form components
│   │   ├── layout/                  # Header & Sidebar
│   │   ├── notifications/           # NotificationDropdown
│   │   ├── onboarding/              # OnboardingWizard
│   │   ├── teams/                   # SubmitTaskDialog + team components
│   │   └── ui/                      # 18 shadcn/ui primitives
│   ├── lib/
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.ts           # Auth state & role helpers
│   │   │   ├── useMembers.ts        # Member CRUD
│   │   │   ├── useNotifications.ts  # Real-time notifications
│   │   │   └── useProjects.ts       # Project queries
│   │   ├── supabase/                # Supabase client setup
│   │   └── utils/
│   │       ├── badges.ts            # Badge definitions & logic
│   │       ├── constants.ts         # Labels, colors, skill lists
│   │       ├── format.ts            # Date formatting helpers
│   │       └── notifications.ts     # Notification helpers
│   └── types/
│       └── database.types.ts        # Full TypeScript schema (12 tables)
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

---

## Environment Variables

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

These are obtained from your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API.

---

## Deployment

### Vercel (Recommended)

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy — Vercel auto-detects Next.js

### Build Locally

```bash
npm run build   # Production build
npm run start   # Start production server
```

---

## SQL Migrations

Run these in **Supabase Dashboard → SQL Editor**, in order:

| # | File | Purpose |
|---|------|---------|
| 1 | `scripts/team_tasks_migration.sql` | Creates `team_tasks` + `team_task_submissions` tables with RLS policies |
| 2 | `scripts/team_tasks_add_review_columns.sql` | Adds `admin_review` and `reviewed_at` columns to `team_tasks` |

> **Note**: Both scripts are idempotent — safe to re-run.

---

## Contributing

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature`
3. **Code** your changes following existing patterns
4. **Test** locally with `npm run dev`
5. **Build check**: `npm run build` must pass
6. **Pull request** with a clear description

### Code Conventions

- TypeScript strict mode
- All Supabase queries cast through `as any` to avoid schema cache conflicts
- Components use shadcn/ui primitives from `@/components/ui/`
- Hooks live in `@/lib/hooks/`
- Database types are defined in `@/types/database.types.ts`
- Role checks use the `useAuth()` hook (`isAdmin`, `isMentor`)

---

## License

Private — Virtualvigilant / Impact360 OS

---

*Built with ❤️ by the Impact360 team.*
