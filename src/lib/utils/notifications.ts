import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type { AppRole } from '@/lib/auth/roles';
import type { TablesInsert } from '@/types/database';

/**
 * In-app notifications.
 *
 * The previous helper took an untyped `supabase: any`, targeted `role in ('admin',
 * 'mentor')` — `admin` is not a role in this schema, so it silently notified nobody —
 * and swallowed every error. These are typed, and a failure to notify never takes down
 * the action that triggered it: an intern's check-in must still save if the mentor's
 * notification could not be written.
 */
export interface NotificationDraft {
    title: string;
    message: string;
    /** Matches `notifications.type`, e.g. 'check_in', 'task_review', 'application'. */
    type: string;
    relatedType?: string;
    relatedId?: string;
    actionUrl?: string;
}

async function insert(rows: TablesInsert<'notifications'>[]): Promise<void> {
    if (rows.length === 0) return;
    try {
        const supabase = await createServerSupabase();
        const { error } = await supabase.from('notifications').insert(rows);
        if (error) console.error('[notifications] insert failed', error.message);
    } catch (error) {
        console.error('[notifications] insert threw', error);
    }
}

export async function notifyUsers(userIds: string[], draft: NotificationDraft): Promise<void> {
    const unique = [...new Set(userIds.filter(Boolean))];
    await insert(
        unique.map((userId) => ({
            user_id: userId,
            title: draft.title,
            message: draft.message,
            type: draft.type,
            related_type: draft.relatedType ?? null,
            related_id: draft.relatedId ?? null,
            action_url: draft.actionUrl ?? null,
        })),
    );
}

export async function notifyRoles(roles: readonly AppRole[], draft: NotificationDraft): Promise<void> {
    try {
        const supabase = await createServerSupabase();
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .in('role', [...roles])
            .eq('is_active', true);
        if (error) throw error;
        await notifyUsers((data ?? []).map((row) => row.id), draft);
    } catch (error) {
        console.error('[notifications] role lookup failed', error);
    }
}

/** The people accountable for one placement: its mentor, supervisor and manager. */
export async function notifyPlacementSupervisors(placementId: string, draft: NotificationDraft): Promise<void> {
    try {
        const supabase = await createServerSupabase();
        const { data, error } = await supabase
            .from('placements')
            .select('primary_mentor_id, supervisor_id, programme_manager_id')
            .eq('id', placementId)
            .maybeSingle();
        if (error) throw error;
        if (!data) return;
        await notifyUsers(
            [data.primary_mentor_id, data.supervisor_id, data.programme_manager_id].filter(
                (id): id is string => Boolean(id),
            ),
            draft,
        );
    } catch (error) {
        console.error('[notifications] placement lookup failed', error);
    }
}
