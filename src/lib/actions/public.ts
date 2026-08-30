'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { applicationSchema } from '@/lib/validation/schemas';
import { fail, ok, readableError, type ActionResult } from '@/lib/errors';

/**
 * The public application form.
 *
 * The only write path in the application that does not require a session — anyone may
 * apply. It is therefore the one that most needs validating before it reaches the
 * database. Three things it deliberately does not do:
 *
 *   - It never sets `status`, `fit_score` or `retention_until`. The
 *     `protect_application_system_fields` trigger overwrites those for non-staff
 *     callers, and sending them here would suggest they were the applicant's to choose.
 *   - It records consent against a specific privacy-notice version and timestamp,
 *     because "they agreed" is not a record; "they agreed to v3 on this date" is.
 *   - It checks the opportunity is genuinely open before writing, so a stale or guessed
 *     link cannot file an application against a closed intake.
 */
export async function submitApplication(input: unknown): Promise<ActionResult<string>> {
    const parsed = applicationSchema.safeParse(input);
    if (!parsed.success) {
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of parsed.error.issues) {
            const key = issue.path.join('.') || '_form';
            (fieldErrors[key] ??= []).push(issue.message);
        }
        return fail('Please correct the highlighted fields.', fieldErrors);
    }

    const data = parsed.data;

    try {
        const supabase = await createServerSupabase();

        const { data: opportunity, error: lookupError } = await supabase
            .from('opportunities')
            .select('id, status, opens_at, closes_at')
            .eq('id', data.opportunity_id)
            .eq('status', 'published')
            .maybeSingle();
        if (lookupError) throw lookupError;
        if (!opportunity) return fail('That opportunity is no longer open for applications.');

        const now = Date.now();
        if (opportunity.opens_at && Date.parse(opportunity.opens_at) > now) {
            return fail('Applications for this opportunity have not opened yet.');
        }
        if (opportunity.closes_at && Date.parse(opportunity.closes_at) < now) {
            return fail('Applications for this opportunity have closed.');
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { privacy_consent, ...applicationFields } = data;
        void privacy_consent; // Recorded as a timestamp below, not as a column of its own.

        const { data: created, error } = await supabase
            .from('applications')
            .insert({
                ...applicationFields,
                applicant_user_id: user?.id ?? null,
                privacy_consent_at: new Date().toISOString(),
            })
            .select('application_number')
            .single();
        if (error) throw error;

        revalidatePath('/dashboard/applications');
        return ok(created.application_number);
    } catch (error) {
        return fail(readableError(error as Error, 'Your application could not be submitted.'));
    }
}
