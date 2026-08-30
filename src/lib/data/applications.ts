import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';
export { nextStage, PIPELINE_STAGES, TERMINAL_STAGES, type ApplicationStatus } from '@/lib/domain/pipeline';
import { PIPELINE_STAGES, TERMINAL_STAGES, type ApplicationStatus } from '@/lib/domain/pipeline';
import { guard, pageBounds, sanitizeSearch, toPage, unwrap, type Loaded, type Page, type PageRequest } from './query';

export interface ApplicationRow extends Tables<'applications'> {
    opportunity: Pick<Tables<'opportunities'>, 'id' | 'title' | 'slug'> | null;
}

export interface ApplicationFilters extends PageRequest {
    search?: string;
    status?: ApplicationStatus;
    opportunityId?: string;
}

export async function listApplications(filters: ApplicationFilters = {}): Promise<Loaded<Page<ApplicationRow>>> {
    const bounds = pageBounds(filters);
    return guard(toPage<ApplicationRow>([], 0, bounds), async () => {
        const supabase = await createServerSupabase();
        let query = supabase
            .from('applications')
            .select('*, opportunity:opportunities(id, title, slug)', { count: 'exact' })
            .order('submitted_at', { ascending: false, nullsFirst: false })
            .range(bounds.from, bounds.to);

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.opportunityId) query = query.eq('opportunity_id', filters.opportunityId);
        if (filters.search?.trim()) {
            const term = sanitizeSearch(filters.search);
            query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,application_number.ilike.%${term}%`);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return toPage(data, count, bounds);
    });
}

/**
 * Counts per stage, computed by the database rather than by counting a fetched page.
 * A funnel that only reflects page one is worse than no funnel.
 */
export async function pipelineCounts(opportunityId?: string): Promise<Loaded<Record<ApplicationStatus, number>>> {
    const zeroed = Object.fromEntries(
        [...PIPELINE_STAGES, ...TERMINAL_STAGES].map((stage) => [stage, 0]),
    ) as Record<ApplicationStatus, number>;

    return guard(zeroed, async () => {
        const supabase = await createServerSupabase();
        const stages = [...PIPELINE_STAGES, ...TERMINAL_STAGES];
        const results = await Promise.all(
            stages.map(async (stage) => {
                let query = supabase
                    .from('applications')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', stage);
                if (opportunityId) query = query.eq('opportunity_id', opportunityId);
                const { count, error } = await query;
                if (error) throw error;
                return [stage, count ?? 0] as const;
            }),
        );
        return { ...zeroed, ...Object.fromEntries(results) } as Record<ApplicationStatus, number>;
    });
}

export interface ApplicationDetail {
    application: ApplicationRow;
    documents: Tables<'application_documents'>[];
    reviews: Tables<'application_reviews'>[];
    interviews: Tables<'interviews'>[];
    offers: Tables<'offers'>[];
}

export async function getApplication(id: string): Promise<Loaded<ApplicationDetail | null>> {
    return guard<ApplicationDetail | null>(null, async () => {
        const supabase = await createServerSupabase();
        const applicationResult = await supabase
            .from('applications')
            .select('*, opportunity:opportunities(id, title, slug)')
            .eq('id', id)
            .maybeSingle();
        if (applicationResult.error) throw applicationResult.error;
        if (!applicationResult.data) return null;

        const [documents, reviews, interviews, offers] = await Promise.all([
            supabase.from('application_documents').select('*').eq('application_id', id),
            supabase.from('application_reviews').select('*').eq('application_id', id).order('created_at', { ascending: false }),
            supabase.from('interviews').select('*').eq('application_id', id).order('scheduled_at', { ascending: false }),
            supabase.from('offers').select('*').eq('application_id', id).order('created_at', { ascending: false }),
        ]);

        return {
            application: applicationResult.data,
            documents: unwrap(documents) ?? [],
            reviews: unwrap(reviews) ?? [],
            interviews: unwrap(interviews) ?? [],
            offers: unwrap(offers) ?? [],
        };
    });
}

export interface SelectionBoard {
    interviews: (Tables<'interviews'> & { application: Pick<Tables<'applications'>, 'full_name' | 'application_number'> | null })[];
    offers: (Tables<'offers'> & { application: Pick<Tables<'applications'>, 'full_name' | 'application_number'> | null })[];
}

export async function getSelectionBoard(): Promise<Loaded<SelectionBoard>> {
    return guard<SelectionBoard>({ interviews: [], offers: [] }, async () => {
        const supabase = await createServerSupabase();
        const [interviews, offers] = await Promise.all([
            supabase
                .from('interviews')
                .select('*, application:applications(full_name, application_number)')
                .order('scheduled_at', { ascending: false })
                .limit(100),
            supabase
                .from('offers')
                .select('*, application:applications(full_name, application_number)')
                .order('created_at', { ascending: false })
                .limit(100),
        ]);
        return {
            interviews: unwrap(interviews) ?? [],
            offers: unwrap(offers) ?? [],
        };
    });
}
