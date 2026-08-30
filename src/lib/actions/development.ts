'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import {
    attendanceSchema,
    checkInReviewSchema,
    checkInSchema,
    concernSchema,
    evaluationSchema,
    feedbackSchema,
    learningGoalSchema,
    leaveRequestSchema,
} from '@/lib/validation/schemas';
import { action, simpleAction } from './helpers';

/**
 * Submit a weekly check-in.
 *
 * `internship_check_ins` is unique on (placement_id, period_start, period_end), so a
 * resubmitted week updates the existing reflection instead of failing with a
 * constraint-violation message. A reviewed week is closed to further edits.
 */
export async function submitCheckIn(input: unknown) {
    return action({ permission: 'checkin:submit', schema: checkInSchema, input }, async (data, session) => {
        const supabase = await createServerSupabase();

        const { data: placement, error: placementError } = await supabase
            .from('placements')
            .select('id, intern_id')
            .eq('id', data.placement_id)
            .maybeSingle();
        if (placementError) throw placementError;
        if (placement?.intern_id !== session.userId) {
            throw new Error('You can only submit check-ins for your own placement.');
        }

        const { data: existing } = await supabase
            .from('internship_check_ins')
            .select('id, status')
            .eq('placement_id', data.placement_id)
            .eq('period_start', data.period_start)
            .eq('period_end', data.period_end)
            .maybeSingle();
        if (existing?.status === 'reviewed') {
            throw new Error('Your mentor has already reviewed that week.');
        }

        const { error } = await supabase.from('internship_check_ins').upsert(
            { ...data, status: 'submitted', submitted_at: new Date().toISOString() },
            { onConflict: 'placement_id,period_start,period_end' },
        );
        if (error) throw error;

        revalidatePath('/dashboard/check-ins');
        return true;
    });
}

export async function reviewCheckIn(input: unknown) {
    return action({ permission: 'checkin:review', schema: checkInReviewSchema, input }, async (data, session) => {
        const supabase = await createServerSupabase();
        const { error } = await supabase
            .from('internship_check_ins')
            .update({
                mentor_feedback: data.mentor_feedback,
                mentor_focus: data.mentor_focus ?? null,
                status: 'reviewed',
                reviewed_by: session.userId,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', data.check_in_id)
            // Only a submitted check-in can be reviewed; a draft has not been shared yet.
            .eq('status', 'submitted');
        if (error) throw error;
        revalidatePath('/dashboard/check-ins');
        return true;
    });
}

export async function saveLearningGoal(input: unknown) {
    return action({ schema: learningGoalSchema, input }, async (data, session) => {
        const supabase = await createServerSupabase();
        const { error } = await supabase.from('learning_goals').insert({ ...data, created_by: session.userId });
        if (error) throw error;
        revalidatePath('/dashboard/development');
        return true;
    });
}

export async function giveFeedback(input: unknown) {
    return action({ permission: 'feedback:give', schema: feedbackSchema, input }, async (data, session) => {
        const supabase = await createServerSupabase();
        const { error } = await supabase.from('feedback_entries').insert({ ...data, author_id: session.userId });
        if (error) throw error;
        revalidatePath('/dashboard/check-ins');
        revalidatePath('/dashboard/people');
        return true;
    });
}

/**
 * Record a rubric evaluation and its per-criterion scores together.
 *
 * The overall score is the mean of the criterion scores rather than a separately typed
 * number, so the headline and the detail cannot disagree. It is written as `draft`:
 * submitting it to the intern is a second, deliberate step.
 */
export async function recordEvaluation(input: unknown) {
    return action({ permission: 'evaluation:author', schema: evaluationSchema, input }, async (data, session) => {
        const supabase = await createServerSupabase();
        const overall = data.scores.reduce((sum, entry) => sum + entry.score, 0) / data.scores.length;

        const { data: evaluation, error } = await supabase
            .from('evaluations')
            .insert({
                placement_id: data.placement_id,
                rubric_id: data.rubric_id,
                evaluator_id: session.userId,
                evaluation_type: data.evaluation_type,
                source: data.source,
                status: 'draft',
                overall_score: Number(overall.toFixed(2)),
                strengths: data.strengths,
                development_areas: data.development_areas,
                recommendation: data.recommendation ?? null,
                evidence_summary: data.evidence_summary ?? null,
            })
            .select('id')
            .single();
        if (error) throw error;

        const { error: scoresError } = await supabase.from('evaluation_scores').insert(
            data.scores.map((entry) => ({
                evaluation_id: evaluation.id,
                criterion_id: entry.criterion_id,
                score: entry.score,
                comment: entry.comment,
            })),
        );
        if (scoresError) throw scoresError;

        revalidatePath('/dashboard/performance');
        return evaluation.id;
    });
}

/** Share a drafted evaluation with the intern. Separate from authoring it. */
export async function submitEvaluation(evaluationId: string) {
    return simpleAction('evaluation:author', async (session) => {
        const supabase = await createServerSupabase();
        const { error } = await supabase
            .from('evaluations')
            .update({ status: 'submitted', submitted_at: new Date().toISOString() })
            .eq('id', evaluationId)
            .eq('status', 'draft')
            .eq('evaluator_id', session.userId);
        if (error) throw error;
        revalidatePath('/dashboard/performance');
        return true;
    });
}

export async function recordAttendance(input: unknown) {
    return action({ permission: 'attendance:record', schema: attendanceSchema, input }, async (data) => {
        const supabase = await createServerSupabase();
        const { error } = await supabase
            .from('attendance_records')
            .upsert(data, { onConflict: 'placement_id,record_date' });
        if (error) throw error;
        revalidatePath('/dashboard/operations');
        return true;
    });
}

export async function requestLeave(input: unknown) {
    return action({ schema: leaveRequestSchema, input }, async (data) => {
        const supabase = await createServerSupabase();
        const { error } = await supabase.from('leave_requests').insert({ ...data, status: 'pending' });
        if (error) throw error;
        revalidatePath('/dashboard/operations');
        return true;
    });
}

export async function decideLeave(leaveId: string, approve: boolean) {
    return simpleAction('leave:approve', async (session) => {
        const supabase = await createServerSupabase();
        const { error } = await supabase
            .from('leave_requests')
            .update({
                status: approve ? 'approved' : 'rejected',
                decided_by: session.userId,
                decided_at: new Date().toISOString(),
            })
            .eq('id', leaveId)
            .eq('status', 'pending');
        if (error) throw error;
        revalidatePath('/dashboard/operations');
        return approve;
    });
}

/**
 * Raise a concern.
 *
 * Anonymous reports deliberately store no reporter id — not a hidden one. If the row
 * carried the reporter and merely hid them in the interface, the promise of anonymity
 * would be false to anyone with database access.
 */
export async function raiseConcern(input: unknown) {
    return action({ schema: concernSchema, input }, async (data, session) => {
        const supabase = await createServerSupabase();
        const { error } = await supabase.from('programme_concerns').insert({
            category: data.category,
            summary: data.summary,
            details: data.details ?? null,
            is_anonymous: data.is_anonymous,
            reported_by: data.is_anonymous ? null : session.userId,
            status: 'open',
        });
        if (error) throw error;
        revalidatePath('/dashboard/support');
        return true;
    });
}
