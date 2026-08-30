import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';
import { guard, pageBounds, toPage, unwrap, type Loaded, type Page, type PageRequest } from './query';

export interface GoalRow extends Tables<'learning_goals'> {
    competency: Pick<Tables<'competencies'>, 'id' | 'name' | 'category'> | null;
    placement: { intern: Pick<Tables<'profiles'>, 'id' | 'full_name'> | null } | null;
}

export async function listLearningGoals(
    filters: PageRequest & { placementId?: string } = {},
): Promise<Loaded<Page<GoalRow>>> {
    const bounds = pageBounds({ pageSize: 50, ...filters });
    return guard(toPage<GoalRow>([], 0, bounds), async () => {
        const supabase = await createServerSupabase();
        let query = supabase
            .from('learning_goals')
            .select(
                '*, competency:competencies(id, name, category), placement:placements(intern:profiles!placements_intern_id_fkey(id, full_name))',
                { count: 'exact' },
            )
            .order('target_date', { ascending: true, nullsFirst: false })
            .range(bounds.from, bounds.to);
        if (filters.placementId) query = query.eq('placement_id', filters.placementId);
        const { data, error, count } = await query;
        if (error) throw error;
        return toPage(data, count, bounds);
    });
}

export interface CheckInRow extends Tables<'internship_check_ins'> {
    placement: {
        intern: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'avatar_url'> | null;
        mentor: Pick<Tables<'profiles'>, 'id' | 'full_name'> | null;
    } | null;
    reviewer: Pick<Tables<'profiles'>, 'id' | 'full_name'> | null;
}

export async function listCheckIns(
    filters: PageRequest & { placementId?: string; status?: Tables<'internship_check_ins'>['status'] } = {},
): Promise<Loaded<Page<CheckInRow>>> {
    const bounds = pageBounds({ pageSize: 20, ...filters });
    return guard(toPage<CheckInRow>([], 0, bounds), async () => {
        const supabase = await createServerSupabase();
        let query = supabase
            .from('internship_check_ins')
            .select(
                `*, placement:placements(
                    intern:profiles!placements_intern_id_fkey(id, full_name, avatar_url),
                    mentor:profiles!placements_primary_mentor_id_fkey(id, full_name)
                 ), reviewer:profiles!internship_check_ins_reviewed_by_fkey(id, full_name)`,
                { count: 'exact' },
            )
            .order('period_end', { ascending: false })
            .range(bounds.from, bounds.to);
        if (filters.placementId) query = query.eq('placement_id', filters.placementId);
        if (filters.status) query = query.eq('status', filters.status);
        const { data, error, count } = await query;
        if (error) throw error;
        return toPage(data, count, bounds);
    });
}

export interface LearningResourceRow extends Tables<'learning_resources'> {
    track: Pick<Tables<'programme_tracks'>, 'id' | 'name'> | null;
    competency: Pick<Tables<'competencies'>, 'id' | 'name'> | null;
}

export async function listLearningResources(
    filters: PageRequest & { trackId?: string; competencyId?: string } = {},
): Promise<Loaded<Page<LearningResourceRow>>> {
    const bounds = pageBounds({ pageSize: 50, ...filters });
    return guard(toPage<LearningResourceRow>([], 0, bounds), async () => {
        const supabase = await createServerSupabase();
        let query = supabase
            .from('learning_resources')
            .select('*, track:programme_tracks(id, name), competency:competencies(id, name)', { count: 'exact' })
            .eq('is_published', true)
            .order('is_required', { ascending: false })
            .order('created_at', { ascending: false })
            .range(bounds.from, bounds.to);
        if (filters.trackId) query = query.eq('track_id', filters.trackId);
        if (filters.competencyId) query = query.eq('competency_id', filters.competencyId);
        const { data, error, count } = await query;
        if (error) throw error;
        return toPage(data, count, bounds);
    });
}

export interface EvaluationRow extends Tables<'evaluations'> {
    evaluator: Pick<Tables<'profiles'>, 'id' | 'full_name'> | null;
    placement: { intern: Pick<Tables<'profiles'>, 'id' | 'full_name'> | null } | null;
    rubric: Pick<Tables<'rubrics'>, 'id' | 'name'> | null;
}

export async function listEvaluations(
    filters: PageRequest & { placementId?: string } = {},
): Promise<Loaded<Page<EvaluationRow>>> {
    const bounds = pageBounds({ pageSize: 25, ...filters });
    return guard(toPage<EvaluationRow>([], 0, bounds), async () => {
        const supabase = await createServerSupabase();
        let query = supabase
            .from('evaluations')
            .select(
                `*, evaluator:profiles!evaluations_evaluator_id_fkey(id, full_name),
                 placement:placements(intern:profiles!placements_intern_id_fkey(id, full_name)),
                 rubric:rubrics(id, name)`,
                { count: 'exact' },
            )
            .order('created_at', { ascending: false })
            .range(bounds.from, bounds.to);
        if (filters.placementId) query = query.eq('placement_id', filters.placementId);
        const { data, error, count } = await query;
        if (error) throw error;
        return toPage(data, count, bounds);
    });
}

/** A rubric plus its criteria, for rendering a scoring form. */
export async function getRubric(rubricId: string): Promise<Loaded<{ rubric: Tables<'rubrics'>; criteria: Tables<'rubric_criteria'>[] } | null>> {
    return guard<{ rubric: Tables<'rubrics'>; criteria: Tables<'rubric_criteria'>[] } | null>(null, async () => {
        const supabase = await createServerSupabase();
        const rubricResult = await supabase.from('rubrics').select('*').eq('id', rubricId).maybeSingle();
        if (rubricResult.error) throw rubricResult.error;
        if (!rubricResult.data) return null;
        const criteria = await supabase
            .from('rubric_criteria')
            .select('*')
            .eq('rubric_id', rubricId)
            .order('display_order');
        return { rubric: rubricResult.data, criteria: unwrap(criteria) ?? [] };
    });
}
