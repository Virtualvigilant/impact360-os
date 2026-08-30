import { describe, expect, it } from 'vitest';
import { canTransition, INTERN_TRANSITIONS, REVIEWER_TRANSITIONS, TASK_COLUMNS, type TaskStatus } from '@/lib/domain/work';
import { nextStage, PIPELINE_STAGES, TERMINAL_STAGES } from '@/lib/domain/pipeline';
import { attendanceRate, completionProgress } from '@/lib/domain/metrics';
import { pageBounds, sanitizeSearch, toPage, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/domain/paging';

describe('task transitions', () => {
    it('never lets an intern approve or complete their own work', () => {
        for (const from of TASK_COLUMNS) {
            expect(canTransition(from, 'approved', false), `${from} → approved`).toBe(false);
            expect(canTransition(from, 'completed', false), `${from} → completed`).toBe(false);
        }
    });

    it('never lets an intern cancel a task', () => {
        for (const from of TASK_COLUMNS) {
            expect(canTransition(from, 'cancelled', false)).toBe(false);
        }
    });

    it('lets an intern move work forward through delivery', () => {
        expect(canTransition('assigned', 'in_progress', false)).toBe(true);
        expect(canTransition('in_progress', 'submitted', false)).toBe(true);
        expect(canTransition('changes_requested', 'in_progress', false)).toBe(true);
    });

    it('does not let an intern skip review', () => {
        expect(canTransition('assigned', 'submitted', false)).toBe(false);
        expect(canTransition('in_progress', 'under_review', false)).toBe(false);
        expect(canTransition('submitted', 'approved', false)).toBe(false);
    });

    it('makes a reviewer approve before completing', () => {
        expect(canTransition('under_review', 'approved', true)).toBe(true);
        expect(canTransition('approved', 'completed', true)).toBe(true);
        expect(canTransition('under_review', 'completed', true)).toBe(false);
    });

    it('lets a reviewer send work back', () => {
        expect(canTransition('under_review', 'changes_requested', true)).toBe(true);
        expect(canTransition('submitted', 'changes_requested', true)).toBe(true);
    });

    it('has no transition out of a terminal state', () => {
        for (const table of [INTERN_TRANSITIONS, REVIEWER_TRANSITIONS]) {
            expect(table.completed).toBeUndefined();
            expect(table.cancelled).toBeUndefined();
        }
    });

    it('only ever targets a real status', () => {
        const valid = new Set<TaskStatus>([...TASK_COLUMNS, 'cancelled']);
        for (const table of [INTERN_TRANSITIONS, REVIEWER_TRANSITIONS]) {
            for (const [from, targets] of Object.entries(table)) {
                expect(valid.has(from as TaskStatus), from).toBe(true);
                for (const target of targets ?? []) {
                    expect(valid.has(target), `${from} → ${target}`).toBe(true);
                    expect(target).not.toBe(from);
                }
            }
        }
    });
});

describe('application pipeline', () => {
    it('advances exactly one stage at a time', () => {
        expect(nextStage('submitted')).toBe('under_review');
        expect(nextStage('under_review')).toBe('shortlisted');
        expect(nextStage('shortlisted')).toBe('interview');
        expect(nextStage('interview')).toBe('assessment');
        expect(nextStage('assessment')).toBe('selected');
    });

    it('stops at selection rather than creating a placement', () => {
        expect(nextStage('selected')).toBeNull();
    });

    it('has no next stage from a terminal outcome', () => {
        for (const stage of TERMINAL_STAGES) {
            expect(nextStage(stage), stage).toBeNull();
        }
        expect(nextStage('draft')).toBeNull();
    });

    it('keeps terminal outcomes out of the pipeline order', () => {
        for (const stage of TERMINAL_STAGES) {
            expect(PIPELINE_STAGES).not.toContain(stage);
        }
    });
});

describe('attendance rate', () => {
    const record = (status: string) => ({ status }) as Parameters<typeof attendanceRate>[0][number];

    it('returns null rather than a misleading zero when nothing is recorded', () => {
        expect(attendanceRate([])).toBeNull();
    });

    it('excludes excused absence from the denominator', () => {
        // Two present, one excused → 100%, not 67%. Penalising approved absence
        // would make the number an attendance-policy trap rather than a measure.
        expect(attendanceRate([record('present'), record('present'), record('excused')])).toBe(100);
    });

    it('returns null when every record is excused', () => {
        expect(attendanceRate([record('excused'), record('excused')])).toBeNull();
    });

    it('counts remote and late as attended', () => {
        expect(attendanceRate([record('remote'), record('late')])).toBe(100);
        expect(attendanceRate([record('present'), record('absent')])).toBe(50);
    });
});

describe('completion progress', () => {
    const requirement = (placementId: string, complete: boolean) =>
        ({ placement_id: placementId, is_complete: complete }) as Parameters<typeof completionProgress>[0][number];

    it('counts only the requirements for that placement', () => {
        const requirements = [
            requirement('a', true),
            requirement('a', false),
            requirement('b', true),
        ];
        expect(completionProgress(requirements, 'a')).toEqual({ met: 1, total: 2, percent: 50 });
        expect(completionProgress(requirements, 'b')).toEqual({ met: 1, total: 1, percent: 100 });
    });

    it('does not divide by zero when nothing is required', () => {
        expect(completionProgress([], 'a')).toEqual({ met: 0, total: 0, percent: 0 });
    });
});

describe('paging', () => {
    it('caps a crafted page size', () => {
        expect(pageBounds({ pageSize: 100_000 }).pageSize).toBe(MAX_PAGE_SIZE);
        expect(pageBounds({ pageSize: -5 }).pageSize).toBe(DEFAULT_PAGE_SIZE);
        expect(pageBounds({ pageSize: 0 }).pageSize).toBe(DEFAULT_PAGE_SIZE);
    });

    it('never produces a negative range', () => {
        expect(pageBounds({ page: -3 }).from).toBe(0);
        expect(pageBounds({ page: 0 }).page).toBe(1);
    });

    it('computes a range Postgres can use', () => {
        expect(pageBounds({ page: 2, pageSize: 25 })).toMatchObject({ from: 25, to: 49 });
    });

    it('reports at least one page even when empty', () => {
        expect(toPage([], 0, { page: 1, pageSize: 25 }).pageCount).toBe(1);
    });

    it('rounds the page count up', () => {
        expect(toPage([], 51, { page: 1, pageSize: 25 }).pageCount).toBe(3);
    });
});

describe('search sanitising', () => {
    it('strips characters that would change a PostgREST or filter', () => {
        // `or(...)` is comma- and paren-delimited; leaving these in lets a search box
        // rewrite the filter expression.
        expect(sanitizeSearch('a,b')).not.toContain(',');
        expect(sanitizeSearch('a)or(b')).not.toContain(')');
        expect(sanitizeSearch('a(b')).not.toContain('(');
    });

    it('escapes the LIKE wildcard so % is searched for, not matched with', () => {
        expect(sanitizeSearch('100%')).toBe('100\\%');
    });

    it('bounds the length', () => {
        expect(sanitizeSearch('x'.repeat(500)).length).toBeLessThanOrEqual(120);
    });
});
