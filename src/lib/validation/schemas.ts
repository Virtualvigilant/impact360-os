import { z } from 'zod';
import { APP_ROLES } from '@/lib/auth/roles';

/** Trim before validating, so "   " fails `min(1)` instead of passing it. */
const text = (max = 500) => z.string().trim().max(max);
const requiredText = (label: string, max = 500) =>
    text(max).min(1, `${label} is required`);

const isoDate = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date picker')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'That is not a real date');

const isoDateTime = z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'That is not a real date and time');

const optional = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess((value) => (value === '' || value == null ? undefined : value), schema.optional());

export const uuid = z.string().uuid('Expected a record id');

/**
 * A Postgres `text[]` column edited as a textarea: one entry per line.
 * Blank lines are dropped rather than stored as empty strings.
 */
const lines = (max: number) =>
    z
        .preprocess(
            (value) =>
                typeof value === 'string'
                    ? value.split('\n').map((line) => line.trim()).filter(Boolean)
                    : (value ?? []),
            z.array(text(500)).max(max, `At most ${max} entries`),
        )
        .default([]);

/** A code used in URLs and references: uppercase, no spaces. */
const code = requiredText('Code', 24)
    .regex(/^[A-Z0-9][A-Z0-9-]*$/, 'Use capital letters, numbers and hyphens only');

// ─── Programme design ────────────────────────────────────────────────────────

export const programmeSchema = z
    .object({
        name: requiredText('Programme name', 160),
        code,
        cohort_label: requiredText('Cohort label', 60),
        description: optional(text(2000)),
        start_date: isoDate,
        end_date: isoDate,
        slots: z.coerce.number().int().min(1, 'At least one slot').max(1000),
        expected_hours_per_week: z.coerce.number().int().min(1).max(60),
        work_arrangement: z.enum(['onsite', 'hybrid', 'remote']),
        status: z.enum(['draft', 'planned', 'open', 'active', 'paused', 'completed', 'archived']).default('draft'),
    })
    .refine((value) => value.end_date > value.start_date, {
        message: 'The programme must end after it starts',
        path: ['end_date'],
    });

export const opportunitySchema = z
    .object({
        programme_id: uuid,
        track_id: optional(uuid),
        title: requiredText('Title', 160),
        summary: requiredText('Summary', 1000),
        // Stored as text[]: one item per line, so a job ad renders as a real list.
        responsibilities: lines(20),
        qualifications: lines(20),
        expected_competencies: lines(20),
        work_arrangement: z.enum(['onsite', 'hybrid', 'remote']),
        location: optional(text(160)),
        slots: z.coerce.number().int().min(1).max(500),
        opens_at: optional(isoDateTime),
        closes_at: optional(isoDateTime),
    })
    .refine((value) => !value.opens_at || !value.closes_at || value.closes_at > value.opens_at, {
        message: 'Applications must close after they open',
        path: ['closes_at'],
    });

// ─── Recruitment ─────────────────────────────────────────────────────────────

/**
 * The public application form.
 *
 * Deliberately has no `status`, `fit_score` or `retention_until` field. Those are
 * system decisions; the `protect_application_system_fields` trigger overwrites them on
 * insert regardless, and accepting them here would imply they were negotiable.
 */
export const applicationSchema = z.object({
    opportunity_id: uuid,
    full_name: requiredText('Full name', 160),
    email: z.string().trim().email('Enter a valid email address'),
    phone: optional(text(40)),
    location: optional(text(160)),
    institution: optional(text(160)),
    academic_programme: optional(text(160)),
    academic_level: optional(text(60)),
    expected_graduation_date: optional(isoDate),
    skills: lines(25),
    technologies: lines(25),
    career_interests: lines(15),
    project_summary: requiredText('Tell us about something you have built', 4000),
    portfolio_url: optional(z.string().trim().url('Enter a full URL, including https://')),
    github_url: optional(z.string().trim().url('Enter a full URL, including https://')),
    linkedin_url: optional(z.string().trim().url('Enter a full URL, including https://')),
    preferred_duration_weeks: optional(z.coerce.number().int().min(1).max(104)),
    available_from: optional(isoDate),
    school_requirements: optional(text(2000)),
    preferred_arrangement: optional(z.enum(['onsite', 'hybrid', 'remote'])),

    // Consent is recorded per application, against a specific notice version, and must
    // be given actively. `screening_consent` is a separate, genuinely optional choice —
    // bundling it into one checkbox would not be freely given consent.
    privacy_notice_version: requiredText('Privacy notice version', 40),
    privacy_consent: z.literal(true, { message: 'You must accept the privacy notice to apply' }),
    screening_consent: z.coerce.boolean().default(false),
});

export const applicationDecisionSchema = z.object({
    application_id: uuid,
    status: z.enum([
        'under_review',
        'shortlisted',
        'interview',
        'assessment',
        'selected',
        'waitlisted',
        'rejected',
    ]),
    // A decision without a reason is not a reviewable decision.
    reason: requiredText('Reason', 2000),
});

export const applicationReviewSchema = z.object({
    application_id: uuid,
    // `application_reviews.recommendation` is the stage the reviewer recommends, so the
    // recommendation and the decision speak the same vocabulary.
    recommendation: z.enum([
        'under_review',
        'shortlisted',
        'interview',
        'assessment',
        'selected',
        'waitlisted',
        'rejected',
    ]),
    notes: requiredText('Notes', 2000),
    score: optional(z.coerce.number().min(0).max(100)),
    is_final: z.coerce.boolean().default(false),
});

export const interviewSchema = z.object({
    application_id: uuid,
    interview_type: requiredText('Interview type', 60),
    scheduled_at: isoDateTime,
    duration_minutes: z.coerce.number().int().min(10).max(480),
    location_or_link: optional(text(500)),
});

// ─── Work ────────────────────────────────────────────────────────────────────

export const taskSchema = z.object({
    placement_id: optional(uuid),
    project_id: optional(uuid),
    milestone_id: optional(uuid),
    title: requiredText('Title', 200),
    objective: optional(text(2000)),
    // Stored as text[]: one criterion per line, so review is checkable item by item.
    acceptance_criteria: z
        .preprocess(
            (value) =>
                typeof value === 'string'
                    ? value.split('\n').map((line) => line.trim()).filter(Boolean)
                    : (value ?? []),
            z.array(text(500)).max(20, 'Twenty criteria is plenty'),
        )
        .default([]),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    estimated_hours: optional(z.coerce.number().min(0).max(1000)),
    due_at: optional(isoDateTime),
});

export const taskTransitionSchema = z.object({
    task_id: uuid,
    to_status: z.enum([
        'backlog',
        'assigned',
        'in_progress',
        'submitted',
        'under_review',
        'changes_requested',
        'approved',
        'completed',
        'cancelled',
    ]),
    note: optional(text(2000)),
});

export const evidenceSchema = z.object({
    task_id: optional(uuid),
    placement_id: uuid,
    evidence_type: z.enum([
        'repository', 'commit', 'pull_request', 'design', 'prototype', 'document',
        'dataset', 'notebook', 'experiment', 'demo', 'report', 'certificate', 'other',
    ]),
    title: requiredText('Title', 200),
    description: optional(text(2000)),
    url: optional(z.string().trim().url('Enter a full URL, including https://')),
    storage_path: optional(text(500)),
}).refine((value) => Boolean(value.url || value.storage_path), {
    message: 'Provide a link or attach a file',
    path: ['url'],
});

export const projectSchema = z.object({
    programme_id: optional(uuid),
    name: requiredText('Project name', 160),
    code,
    objective: requiredText('Objective', 2000),
    description: optional(text(4000)),
    project_lead_id: optional(uuid),
    start_date: optional(isoDate),
    target_end_date: optional(isoDate),
    status: z.enum(['planned', 'active', 'on_hold', 'completed', 'cancelled']).default('planned'),
});

// ─── Development ─────────────────────────────────────────────────────────────

export const checkInSchema = z
    .object({
        placement_id: uuid,
        period_start: isoDate,
        period_end: isoDate,
        achievements: requiredText('Achievements', 4000),
        learning: requiredText('Learning', 4000),
        blockers: optional(text(4000)),
        next_steps: requiredText('Next steps', 4000),
        support_needed: optional(text(4000)),
        wellbeing_rating: z.coerce.number().int().min(1, 'Rate 1–5').max(5, 'Rate 1–5'),
    })
    .refine((value) => value.period_end >= value.period_start, {
        message: 'The period must end on or after it starts',
        path: ['period_end'],
    });

export const checkInReviewSchema = z.object({
    check_in_id: uuid,
    mentor_feedback: requiredText('Feedback', 4000),
    mentor_focus: optional(text(1000)),
});

export const learningGoalSchema = z
    .object({
        placement_id: uuid,
        competency_id: optional(uuid),
        title: requiredText('Goal', 200),
        success_measure: requiredText('How success is measured', 1000),
        target_date: optional(isoDate),
        progress: z.coerce.number().int().min(0).max(100).default(0),
        status: z.enum(['not_started', 'in_progress', 'achieved', 'at_risk', 'cancelled']).default('not_started'),
    })
    .refine((value) => value.status !== 'achieved' || value.progress === 100, {
        message: 'An achieved goal should be at 100%',
        path: ['progress'],
    });

export const feedbackSchema = z.object({
    placement_id: uuid,
    project_id: optional(uuid),
    task_id: optional(uuid),
    competency_id: optional(uuid),
    source: z.enum(['mentor', 'supervisor', 'peer', 'self', 'project_lead', 'client', 'programme_admin']),
    rating: optional(z.coerce.number().min(1).max(5)),
    strengths: requiredText('Strengths', 2000),
    development_areas: requiredText('Development areas', 2000),
    // Feedback that names no next action is a verdict, not development.
    next_action: requiredText('Next action', 2000),
    is_visible_to_intern: z.coerce.boolean().default(true),
});

// ─── Performance and operations ──────────────────────────────────────────────

export const evaluationSchema = z.object({
    placement_id: uuid,
    rubric_id: uuid,
    evaluation_type: z.enum(['baseline', 'midpoint', 'final', 'project', 'ad_hoc']),
    source: z.enum(['mentor', 'supervisor', 'peer', 'self', 'project_lead', 'client', 'programme_admin']),
    strengths: requiredText('Strengths', 4000),
    development_areas: requiredText('Development areas', 4000),
    recommendation: optional(text(2000)),
    evidence_summary: optional(text(4000)),
    scores: z
        .array(
            z.object({
                criterion_id: uuid,
                score: z.coerce.number().min(0).max(5),
                // Every score carries its justification: `evaluation_scores.comment`
                // is NOT NULL precisely so a number can never stand on its own.
                comment: requiredText('Comment', 1000),
            }),
        )
        .min(1, 'Score at least one criterion'),
});

export const attendanceSchema = z.object({
    placement_id: uuid,
    record_date: isoDate,
    status: z.enum(['present', 'remote', 'late', 'excused', 'absent']),
    hours_logged: z.coerce.number().min(0).max(24).default(0),
    notes: optional(text(500)),
});

export const leaveRequestSchema = z
    .object({
        placement_id: uuid,
        leave_type: requiredText('Leave type', 60),
        start_date: isoDate,
        end_date: isoDate,
        reason: requiredText('Reason', 1000),
    })
    .refine((value) => value.end_date >= value.start_date, {
        message: 'Leave must end on or after it starts',
        path: ['end_date'],
    });

export const concernSchema = z.object({
    category: z.enum([
        'workload', 'conduct', 'safety', 'harassment', 'supervision',
        'access', 'discrimination', 'wellbeing', 'privacy', 'other',
    ]),
    summary: requiredText('Summary', 2000),
    details: optional(text(4000)),
    is_anonymous: z.coerce.boolean().default(false),
});

// ─── Governance ──────────────────────────────────────────────────────────────

export const assignRoleSchema = z.object({
    profile_id: uuid,
    role: z.enum(APP_ROLES),
    reason: requiredText('Reason', 500),
});

export const profileSchema = z.object({
    full_name: requiredText('Full name', 160),
    phone: optional(text(40)),
    timezone: optional(text(60)),
    locale: optional(text(20)),
    avatar_url: optional(z.string().trim().url('Enter a full URL, including https://')),
});

export type ProgrammeInput = z.infer<typeof programmeSchema>;
export type OpportunityInput = z.infer<typeof opportunitySchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type EvaluationInput = z.infer<typeof evaluationSchema>;
