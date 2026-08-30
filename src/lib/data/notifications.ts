import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';

/**
 * The first page of a person's notifications, loaded during the server render so the
 * bell arrives already populated. A failure here returns an empty list rather than
 * throwing: an unreachable notifications table must not take down the whole shell.
 */
export async function listOwnNotifications(userId: string, limit = 20): Promise<Tables<'notifications'>[]> {
    try {
        const supabase = await createServerSupabase();
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data ?? [];
    } catch (error) {
        console.error('[notifications] initial load failed', error);
        return [];
    }
}
