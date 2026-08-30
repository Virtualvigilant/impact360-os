'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { nextStage, PIPELINE_STAGES, TERMINAL_STAGES } from '@/lib/domain/pipeline';
import {
    applicationDecisionSchema,
    applicationReviewSchema,
    interviewSchema,
    opportunitySchema,
    programmeSchema,
} from '@/lib/validation/schemas';
import { action, simpleAction } from './helpers';

export async function createProgramme(input: unknown) {
    return action({ permission: 'programme:create', schema: programmeSchema, input }, async (data) => {
        const supabase = await createServerSupabase();
        const { data: programme, error } = await supabase
            .from('internship_programmes')
            .insert(data)
            .select('id')
            .single();
        if (error) throw error;
        revalidatePath('/dashboard/programmes');
        return programme.id;
    });
}

/**
 * URL slug for a published opportunity.
 *
 * The old version appended `Date.now().toString(36)` to guarantee uniqueness, which
 * produced unreadable, unstable public URLs. This tries the clean slug first and only
 * adds a numeric suffix when one is genuinely taken.
 */
async function uniqueSlug(title: string): Promise<string> {
    const base =
        title
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .slice(0, 60) || 'opportunity';

    const supabase = await createServerSupabase();
    const { data } = await supabase.from('opportunities').select('slug').like('slug', `${base}%`);
    const taken = new Set((data ?? []).map((row) => row.slug));
    if (!taken.has(base)) return base;
    for (let suffix = 2; suffix < 200; suffix += 1) {
        const candidate = `${base}-${suffix}`;
        if (!taken.has(candidate)) return candidate;
    }
    return `${base}-${Date.now().toString(36)}`;
}

export async function createOpportunity(input: unknown) {
    return action({ permission: 'opportunity:manage', schema: opportunitySchema, input }, async (data) => {
        const supabase = await createServerSupabase();
        const { data: opportunity, error } = await supabase
            .from('opportunities')
            .insert({ ...data, slug: await uniqueSlug(data.title), status: 'draft' })
            .select('id')
            .single();
        if (error) throw error;
        revalidatePath('/dashboard/opportunities');
        return opportunity.id;
    });
}

export async function publishOpportunity(opportunityId: string, publish: boolean) {
    return simpleAction('opportunity:manage', async () => {
        const supabase = await createServerSupabase();
        const { error } = await supabase
            .from('opportunities')
            .update({
                status: publish ? 'published' : 'draft',
                published_at: publish ? new Date().toISOString() : null,
            })
            .eq('id', opportunityId);
        if (error) throw error;
        revalidatePath('/dashboard/opportunities');
        revalidatePath('/opportunities');
        return publish;
    });
}

/**
 * Record a pipeline decision.
 *
 * Two rules the previous "advance" button did not enforce:
 *
 *   - Every decision carries a written reason, stored as an `application_reviews` row.
 *     A pipeline you cannot audit is not a defensible selection process.
 *   - Stages move one step at a time, or to an explicit terminal outcome. Skipping from
 *     `submitted` straight to `selected` was previously a single crafted request.
 */
export async function decideApplication(input: unknown) {
    return action({ permission: 'application:decide', schema: applicationDecisionSchema, input }, async (data, session) => {
        const supabase = await createServerSupabase();

        const { data: application, error: readError } = await supabase
            .from('applications')
            .select('id, status')
            .eq('id', data.application_id)
            .maybeSingle();
        if (readError) throw readError;
        if (!application) throw new Error('That application no longer exists.');

        const isTerminal = TERMINAL_STAGES.includes(data.status);
        const isNextStep = nextStage(application.status) === data.status;
        if (!isTerminal && !isNextStep) {
            const from = application.status.replaceAll('_', ' ');
            const to = data.status.replaceAll('_', ' ');
            throw new Error(`An application moves one stage at a time — ${from} cannot jump to ${to}.`);
        }
        if (!PIPELINE_STAGES.includes(application.status) && !isTerminal) {
            throw new Error('That application has already left the active pipeline.');
        }

        const { error } = await supabase
            .from('applications')
            .update({ status: data.status })
            .eq('id', data.application_id)
            // Optimistic concurrency: if another reviewer moved it first, this write
            // matches no row rather than silently overwriting their decision.
            .eq('status', application.status);
        if (error) throw error;

        // `application_reviews` is unique on (application_id, reviewer_id): one standing
        // position per reviewer, updated rather than duplicated.
        const { error: reviewError } = await supabase.from('application_reviews').upsert(
            {
                application_id: data.application_id,
                reviewer_id: session.userId,
                recommendation: data.status,
                notes: data.reason,
                is_final: isTerminal || data.status === 'selected',
            },
            { onConflict: 'application_id,reviewer_id' },
        );
        if (reviewError) throw reviewError;

        revalidatePath('/dashboard/applications');
        return data.status;
    });
}

export async function recordApplicationReview(input: unknown) {
    return action({ permission: 'application:review', schema: applicationReviewSchema, input }, async (data, session) => {
        const supabase = await createServerSupabase();
        const { error } = await supabase.from('application_reviews').upsert(
            {
                application_id: data.application_id,
                reviewer_id: session.userId,
                recommendation: data.recommendation,
                notes: data.notes,
                score: data.score ?? null,
                is_final: data.is_final,
            },
            { onConflict: 'application_id,reviewer_id' },
        );
        if (error) throw error;
        revalidatePath('/dashboard/applications');
        return true;
    });
}

export async function scheduleInterview(input: unknown) {
    return action({ permission: 'interview:schedule', schema: interviewSchema, input }, async (data, session) => {
        const supabase = await createServerSupabase();
        const { error } = await supabase
            .from('interviews')
            .insert({ ...data, created_by: session.userId, status: 'scheduled' });
        if (error) throw error;
        revalidatePath('/dashboard/selection');
        return true;
    });
}
