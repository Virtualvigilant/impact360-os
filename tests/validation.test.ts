import { describe, expect, it } from 'vitest';
import {
    applicationSchema,
    applicationDecisionSchema,
    checkInSchema,
    concernSchema,
    evaluationSchema,
    leaveRequestSchema,
    opportunitySchema,
    programmeSchema,
    taskSchema,
} from '@/lib/validation/schemas';

const uuid = '11111111-1111-4111-8111-111111111111';

const validApplication = {
    opportunity_id: uuid,
    full_name: 'Amina Wanjiru',
    email: 'amina@example.com',
    project_summary: 'I built a class-timetable app for my college and rewrote the clash detection.',
    privacy_notice_version: '2026.1',
    privacy_consent: true,
};

describe('application form', () => {
    it('accepts a complete application', () => {
        expect(applicationSchema.safeParse(validApplication).success).toBe(true);
    });

    it('refuses to record consent that was not given', () => {
        const result = applicationSchema.safeParse({ ...validApplication, privacy_consent: false });
        expect(result.success).toBe(false);
    });

    it('keeps screening consent optional and separate', () => {
        // Bundling it with the privacy notice would make it not freely given.
        const result = applicationSchema.safeParse(validApplication);
        expect(result.success && result.data.screening_consent).toBe(false);
    });

    it('rejects whitespace as a name', () => {
        expect(applicationSchema.safeParse({ ...validApplication, full_name: '   ' }).success).toBe(false);
    });

    it('rejects a malformed email', () => {
        expect(applicationSchema.safeParse({ ...validApplication, email: 'amina@' }).success).toBe(false);
    });

    it('has no field for status, score or retention', () => {
        // These are system decisions. Accepting them here would imply they are the
        // applicant's to set, and the database trigger overwrites them regardless.
        const result = applicationSchema.safeParse({
            ...validApplication,
            status: 'selected',
            fit_score: 100,
            retention_until: '2099-01-01',
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).not.toHaveProperty('status');
            expect(result.data).not.toHaveProperty('fit_score');
            expect(result.data).not.toHaveProperty('retention_until');
        }
    });

    it('splits a textarea into a text[] and drops blank lines', () => {
        const result = applicationSchema.safeParse({
            ...validApplication,
            skills: 'TypeScript\n\n  React  \n\nPostgres\n',
        });
        expect(result.success && result.data.skills).toEqual(['TypeScript', 'React', 'Postgres']);
    });

    it('rejects a portfolio link that is not a URL', () => {
        expect(applicationSchema.safeParse({ ...validApplication, portfolio_url: 'github.com/me' }).success).toBe(false);
    });
});

describe('programme', () => {
    const base = {
        name: 'Software Development Internship',
        code: 'SDI-2026',
        cohort_label: 'January 2026',
        start_date: '2026-01-12',
        end_date: '2026-04-10',
        slots: 12,
        expected_hours_per_week: 40,
        work_arrangement: 'hybrid',
    };

    it('accepts a well-formed programme', () => {
        expect(programmeSchema.safeParse(base).success).toBe(true);
    });

    it('refuses a programme that ends before it starts', () => {
        const result = programmeSchema.safeParse({ ...base, end_date: '2026-01-01' });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].path).toEqual(['end_date']);
        }
    });

    it('refuses a lowercase or spaced code', () => {
        expect(programmeSchema.safeParse({ ...base, code: 'sdi 2026' }).success).toBe(false);
    });

    it('requires at least one slot', () => {
        expect(programmeSchema.safeParse({ ...base, slots: 0 }).success).toBe(false);
    });
});

describe('opportunity', () => {
    const base = {
        programme_id: uuid,
        title: 'Software Development Intern',
        summary: 'Work on the internal scheduling platform alongside two engineers.',
        work_arrangement: 'hybrid',
        slots: 3,
    };

    it('refuses to close applications before they open', () => {
        const result = opportunitySchema.safeParse({
            ...base,
            opens_at: '2026-03-01T09:00',
            closes_at: '2026-02-01T09:00',
        });
        expect(result.success).toBe(false);
    });

    it('accepts an open-ended opportunity', () => {
        expect(opportunitySchema.safeParse(base).success).toBe(true);
    });
});

describe('check-in', () => {
    const base = {
        placement_id: uuid,
        period_start: '2026-02-02',
        period_end: '2026-02-08',
        achievements: 'Shipped the clash-detection fix.',
        learning: 'Learned how to profile a slow query.',
        next_steps: 'Add tests around the timetable importer.',
        wellbeing_rating: 4,
    };

    it('accepts a single-day period', () => {
        expect(checkInSchema.safeParse({ ...base, period_end: base.period_start }).success).toBe(true);
    });

    it('refuses a period that ends before it starts', () => {
        expect(checkInSchema.safeParse({ ...base, period_end: '2026-01-01' }).success).toBe(false);
    });

    it('holds wellbeing to the 1–5 scale', () => {
        expect(checkInSchema.safeParse({ ...base, wellbeing_rating: 0 }).success).toBe(false);
        expect(checkInSchema.safeParse({ ...base, wellbeing_rating: 6 }).success).toBe(false);
    });

    it('requires the parts a mentor actually acts on', () => {
        expect(checkInSchema.safeParse({ ...base, next_steps: '' }).success).toBe(false);
        expect(checkInSchema.safeParse({ ...base, achievements: '' }).success).toBe(false);
    });
});

describe('decisions and evaluations', () => {
    it('will not record a pipeline decision without a reason', () => {
        expect(
            applicationDecisionSchema.safeParse({ application_id: uuid, status: 'rejected', reason: '' }).success,
        ).toBe(false);
        expect(
            applicationDecisionSchema.safeParse({ application_id: uuid, status: 'rejected', reason: '   ' }).success,
        ).toBe(false);
    });

    it('will not accept a bare number as a criterion score', () => {
        // `evaluation_scores.comment` is NOT NULL for exactly this reason.
        const result = evaluationSchema.safeParse({
            placement_id: uuid,
            rubric_id: uuid,
            evaluation_type: 'midpoint',
            source: 'mentor',
            strengths: 'Reliable and communicates early.',
            development_areas: 'Needs to write tests before asking for review.',
            scores: [{ criterion_id: uuid, score: 4, comment: '' }],
        });
        expect(result.success).toBe(false);
    });

    it('requires at least one criterion', () => {
        const result = evaluationSchema.safeParse({
            placement_id: uuid,
            rubric_id: uuid,
            evaluation_type: 'final',
            source: 'supervisor',
            strengths: 'Strong ownership.',
            development_areas: 'Estimation.',
            scores: [],
        });
        expect(result.success).toBe(false);
    });
});

describe('operations', () => {
    it('refuses leave that ends before it starts', () => {
        expect(
            leaveRequestSchema.safeParse({
                placement_id: uuid,
                leave_type: 'Sick',
                start_date: '2026-02-10',
                end_date: '2026-02-01',
                reason: 'Unwell',
            }).success,
        ).toBe(false);
    });

    it('defaults a concern to attributed rather than anonymous', () => {
        const result = concernSchema.safeParse({ category: 'workload', summary: 'Too many parallel tasks.' });
        expect(result.success && result.data.is_anonymous).toBe(false);
    });
});

describe('task', () => {
    it('splits acceptance criteria into checkable items', () => {
        const result = taskSchema.safeParse({
            title: 'Add importer tests',
            acceptance_criteria: 'Handles empty file\nRejects duplicate rows\n\n',
        });
        expect(result.success && result.data.acceptance_criteria).toEqual([
            'Handles empty file',
            'Rejects duplicate rows',
        ]);
    });

    it('defaults priority to medium', () => {
        const result = taskSchema.safeParse({ title: 'Something' });
        expect(result.success && result.data.priority).toBe('medium');
    });
});
