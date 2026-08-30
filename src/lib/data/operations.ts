import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';
import { guard, unwrap, type Loaded } from './query';

export interface OperationsBoard {
    attendance: Tables<'attendance_records'>[];
    leave: (Tables<'leave_requests'> & { placement: { intern: Pick<Tables<'profiles'>, 'id' | 'full_name'> | null } | null })[];
    documents: Tables<'intern_documents'>[];
    concerns: Tables<'programme_concerns'>[];
    assets: (Tables<'asset_assignments'> & { asset: Pick<Tables<'assets'>, 'id' | 'name' | 'category'> | null })[];
    access: (Tables<'access_assignments'> & { resource: Pick<Tables<'system_access_resources'>, 'id' | 'name'> | null })[];
    stipends: Tables<'stipend_payments'>[];
}

const EMPTY: OperationsBoard = {
    attendance: [],
    leave: [],
    documents: [],
    concerns: [],
    assets: [],
    access: [],
    stipends: [],
};

/**
 * Operations, scoped by RLS to what the caller may see.
 *
 * Attendance is capped at the trailing window the rate is computed over rather than
 * "everything ever recorded", so this stays a fixed-cost query as cohorts accumulate.
 */
export async function getOperationsBoard(placementId?: string): Promise<Loaded<OperationsBoard>> {
    return guard(EMPTY, async () => {
        const supabase = await createServerSupabase();
        const since = new Date();
        since.setDate(since.getDate() - 90);
        const sinceDate = since.toISOString().slice(0, 10);

        const scope = <T extends { eq: (column: string, value: string) => T }>(query: T) =>
            placementId ? query.eq('placement_id', placementId) : query;

        const [attendance, leave, documents, concerns, assets, access, stipends] = await Promise.all([
            scope(
                supabase
                    .from('attendance_records')
                    .select('*')
                    .gte('record_date', sinceDate)
                    .order('record_date', { ascending: false }),
            ),
            scope(
                supabase
                    .from('leave_requests')
                    .select('*, placement:placements(intern:profiles!placements_intern_id_fkey(id, full_name))')
                    .order('created_at', { ascending: false }),
            ),
            scope(supabase.from('intern_documents').select('*').order('created_at', { ascending: false })),
            supabase
                .from('programme_concerns')
                .select('*')
                .not('status', 'in', '("resolved","closed")')
                .order('created_at', { ascending: false }),
            scope(
                supabase
                    .from('asset_assignments')
                    .select('*, asset:assets(id, name, category)')
                    .order('issued_at', { ascending: false, nullsFirst: false }),
            ),
            scope(
                supabase
                    .from('access_assignments')
                    .select('*, resource:system_access_resources(id, name)')
                    .order('requested_at', { ascending: false }),
            ),
            scope(supabase.from('stipend_payments').select('*').order('period_end', { ascending: false })),
        ]);

        return {
            attendance: unwrap(attendance) ?? [],
            leave: unwrap(leave) ?? [],
            documents: unwrap(documents) ?? [],
            concerns: unwrap(concerns) ?? [],
            assets: unwrap(assets) ?? [],
            access: unwrap(access) ?? [],
            stipends: unwrap(stipends) ?? [],
        };
    });
}

export { attendanceRate } from '@/lib/domain/metrics';
