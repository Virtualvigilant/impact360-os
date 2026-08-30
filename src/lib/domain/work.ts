/**
 * Delivery rules.
 *
 * Pure, and deliberately free of any `server-only` import: the board renders these in
 * the browser to decide which buttons to offer, and the server action enforces the same
 * table before writing. One definition, two callers, no drift — and importing a
 * server-only module from a client component would fail the build anyway.
 */
import type { Enums } from '@/types/database';

export type TaskStatus = Enums<'task_status'>;

/** The board, left to right. `cancelled` is deliberately not a column. */
export const TASK_COLUMNS: readonly TaskStatus[] = [
    'backlog',
    'assigned',
    'in_progress',
    'submitted',
    'under_review',
    'changes_requested',
    'approved',
    'completed',
] as const;

/**
 * What each side may do.
 *
 * The old board let any status be set from the client: an intern could mark their own
 * task `approved`, and a supervisor could push reviewed work back to `backlog`.
 * Delivery and review are separate authorities here.
 */
export const INTERN_TRANSITIONS: Partial<Record<TaskStatus, readonly TaskStatus[]>> = {
    assigned: ['in_progress'],
    in_progress: ['submitted'],
    changes_requested: ['in_progress'],
};

export const REVIEWER_TRANSITIONS: Partial<Record<TaskStatus, readonly TaskStatus[]>> = {
    backlog: ['assigned', 'cancelled'],
    assigned: ['in_progress', 'backlog', 'cancelled'],
    in_progress: ['under_review', 'changes_requested', 'cancelled'],
    submitted: ['under_review', 'changes_requested'],
    under_review: ['approved', 'changes_requested'],
    changes_requested: ['under_review'],
    approved: ['completed'],
};

export function canTransition(from: TaskStatus, to: TaskStatus, asReviewer: boolean): boolean {
    const table = asReviewer ? REVIEWER_TRANSITIONS : INTERN_TRANSITIONS;
    return table[from]?.includes(to) ?? false;
}
