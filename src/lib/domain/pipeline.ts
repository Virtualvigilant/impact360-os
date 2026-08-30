/**
 * Recruitment pipeline rules. Pure — shared by the funnel, the row controls and the
 * server action that records a decision.
 */
import type { Enums } from '@/types/database';

export type ApplicationStatus = Enums<'application_status'>;

/** The pipeline, in the order a candidate moves through it. */
export const PIPELINE_STAGES: readonly ApplicationStatus[] = [
    'submitted',
    'under_review',
    'shortlisted',
    'interview',
    'assessment',
    'selected',
] as const;

export const TERMINAL_STAGES: readonly ApplicationStatus[] = ['waitlisted', 'rejected', 'withdrawn'] as const;

/**
 * The stage a candidate may advance to next.
 *
 * A lookup rather than "index + 1": rejection and waitlisting are not positions on a
 * line, and `selected` is the end of this function's authority — turning a selection
 * into a placement is a separate, audited decision.
 */
export function nextStage(current: ApplicationStatus): ApplicationStatus | null {
    const index = PIPELINE_STAGES.indexOf(current);
    if (index === -1 || index === PIPELINE_STAGES.length - 1) return null;
    return PIPELINE_STAGES[index + 1];
}
