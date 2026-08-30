import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type { Tables, Views } from '@/types/database';
import { guard, pageBounds, sanitizeSearch, toPage, unwrap, type Loaded, type Page, type PageRequest } from './query';

export type InternSummary = Views<'intern_operating_summary'>;
export type MentorCapacity = Views<'mentor_capacity'>;

export interface InternFilters extends PageRequest {
    search?: string;
    risk?: InternSummary['risk_level'];
    status?: InternSummary['status'];
    programmeId?: string;
    mentorId?: string;
}

/**
 * The intern register.
 *
 * Reads the `intern_operating_summary` view so headline numbers stay derived from
 * source records. Filtering and paging happen in Postgres — the previous
 * implementation fetched every row and ran `JSON.stringify(row).includes(query)` in the
 * browser.
 */
export async function listInterns(filters: InternFilters = {}): Promise<Loaded<Page<InternSummary>>> {
    const bounds = pageBounds(filters);
    return guard(toPage<InternSummary>([], 0, bounds), async () => {
        const supabase = await createServerSupabase();
        let query = supabase
            .from('intern_operating_summary')
            .select('*', { count: 'exact' })
            .order('risk_level', { ascending: false })
            .order('full_name')
            .range(bounds.from, bounds.to);

        if (filters.risk) query = query.eq('risk_level', filters.risk);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.programmeId) query = query.eq('programme_id', filters.programmeId);
        if (filters.mentorId) query = query.eq('primary_mentor_id', filters.mentorId);
        if (filters.search?.trim()) {
            const term = sanitizeSearch(filters.search);
            query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,track_name.ilike.%${term}%`);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return toPage(data, count, bounds);
    });
}

export interface InternRecord {
    summary: InternSummary;
    placement: Tables<'placements'> | null;
    goals: Tables<'learning_goals'>[];
    tasks: Tables<'tasks'>[];
    checkIns: Tables<'internship_check_ins'>[];
    feedback: Tables<'feedback_entries'>[];
    evaluations: Tables<'evaluations'>[];
    attendance: Tables<'attendance_records'>[];
    documents: Tables<'intern_documents'>[];
    risks: Tables<'risk_signals'>[];
}

/** One intern's full operating record, assembled in a single round trip fan-out. */
export async function getInternRecord(placementId: string): Promise<Loaded<InternRecord | null>> {
    return guard<InternRecord | null>(null, async () => {
        const supabase = await createServerSupabase();

        const summaryResult = await supabase
            .from('intern_operating_summary')
            .select('*')
            .eq('placement_id', placementId)
            .maybeSingle();
        if (summaryResult.error) throw summaryResult.error;
        if (!summaryResult.data) return null;

        const [placement, goals, tasks, checkIns, feedback, evaluations, attendance, documents, risks] =
            await Promise.all([
                supabase.from('placements').select('*').eq('id', placementId).maybeSingle(),
                supabase.from('learning_goals').select('*').eq('placement_id', placementId).order('target_date'),
                supabase.from('tasks').select('*').eq('placement_id', placementId).order('due_at').limit(50),
                supabase.from('internship_check_ins').select('*').eq('placement_id', placementId).order('period_end', { ascending: false }).limit(12),
                supabase.from('feedback_entries').select('*').eq('placement_id', placementId).order('created_at', { ascending: false }).limit(20),
                supabase.from('evaluations').select('*').eq('placement_id', placementId).order('created_at', { ascending: false }),
                supabase.from('attendance_records').select('*').eq('placement_id', placementId).order('record_date', { ascending: false }).limit(60),
                supabase.from('intern_documents').select('*').eq('placement_id', placementId).order('created_at', { ascending: false }),
                supabase.from('risk_signals').select('*').eq('placement_id', placementId).is('resolved_at', null).order('detected_at', { ascending: false }),
            ]);

        return {
            summary: summaryResult.data,
            placement: unwrap(placement),
            goals: unwrap(goals) ?? [],
            tasks: unwrap(tasks) ?? [],
            checkIns: unwrap(checkIns) ?? [],
            feedback: unwrap(feedback) ?? [],
            evaluations: unwrap(evaluations) ?? [],
            attendance: unwrap(attendance) ?? [],
            documents: unwrap(documents) ?? [],
            risks: unwrap(risks) ?? [],
        };
    });
}

/** Supervision load, so nobody is assigned a tenth intern by accident. */
export async function listMentorCapacity(): Promise<Loaded<MentorCapacity[]>> {
    return guard<MentorCapacity[]>([], async () => {
        const supabase = await createServerSupabase();
        const { data, error } = await supabase
            .from('mentor_capacity')
            .select('*')
            .order('active_interns', { ascending: false });
        if (error) throw error;
        return data ?? [];
    });
}

/** The signed-in intern's own active placement, if they have one. */
export async function getOwnPlacement(internId: string): Promise<Tables<'placements'> | null> {
    const supabase = await createServerSupabase();
    const { data } = await supabase
        .from('placements')
        .select('*')
        .eq('intern_id', internId)
        .in('status', ['preboarding', 'onboarding', 'active', 'paused', 'completing'])
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();
    return data ?? null;
}
