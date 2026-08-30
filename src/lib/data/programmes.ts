import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import { publicSupabase } from '@/lib/supabase/public';
import type { Enums, Tables } from '@/types/database';
import { guard, pageBounds, sanitizeSearch, toPage, unwrap, type Loaded, type Page, type PageRequest } from './query';

export async function listProgrammes(
    filters: PageRequest & { search?: string; status?: Enums<'programme_status'> } = {},
): Promise<Loaded<Page<Tables<'internship_programmes'>>>> {
    const bounds = pageBounds(filters);
    return guard(toPage<Tables<'internship_programmes'>>([], 0, bounds), async () => {
        const supabase = await createServerSupabase();
        let query = supabase
            .from('internship_programmes')
            .select('*', { count: 'exact' })
            .order('start_date', { ascending: false })
            .range(bounds.from, bounds.to);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.search?.trim()) {
            const term = sanitizeSearch(filters.search);
            query = query.or(`name.ilike.%${term}%,code.ilike.%${term}%,cohort_label.ilike.%${term}%`);
        }
        const { data, error, count } = await query;
        if (error) throw error;
        return toPage(data, count, bounds);
    });
}

/** Programmes an admin may attach new records to. */
export async function listOpenProgrammes(): Promise<Tables<'internship_programmes'>[]> {
    const supabase = await createServerSupabase();
    const { data } = await supabase
        .from('internship_programmes')
        .select('*')
        .in('status', ['draft', 'planned', 'open', 'active'])
        .order('start_date', { ascending: false });
    return data ?? [];
}

export interface ProgrammeDetail {
    programme: Tables<'internship_programmes'>;
    tracks: Tables<'programme_tracks'>[];
    competencies: (Tables<'programme_competencies'> & { competency: Pick<Tables<'competencies'>, 'id' | 'name' | 'category'> | null })[];
    opportunities: Tables<'opportunities'>[];
}

export async function getProgramme(id: string): Promise<Loaded<ProgrammeDetail | null>> {
    return guard<ProgrammeDetail | null>(null, async () => {
        const supabase = await createServerSupabase();
        const programmeResult = await supabase.from('internship_programmes').select('*').eq('id', id).maybeSingle();
        if (programmeResult.error) throw programmeResult.error;
        if (!programmeResult.data) return null;

        const [tracks, competencies, opportunities] = await Promise.all([
            supabase.from('programme_tracks').select('*').eq('programme_id', id).order('name'),
            supabase
                .from('programme_competencies')
                .select('*, competency:competencies(id, name, category)')
                .eq('programme_id', id),
            supabase.from('opportunities').select('*').eq('programme_id', id).order('created_at', { ascending: false }),
        ]);

        return {
            programme: programmeResult.data,
            tracks: unwrap(tracks) ?? [],
            competencies: unwrap(competencies) ?? [],
            opportunities: unwrap(opportunities) ?? [],
        };
    });
}

export interface OpportunityRow extends Tables<'opportunities'> {
    programme: Pick<Tables<'internship_programmes'>, 'id' | 'name' | 'cohort_label'> | null;
    track: Pick<Tables<'programme_tracks'>, 'id' | 'name'> | null;
}

export async function listOpportunities(
    filters: PageRequest & { search?: string; status?: Enums<'opportunity_status'> } = {},
): Promise<Loaded<Page<OpportunityRow>>> {
    const bounds = pageBounds(filters);
    return guard(toPage<OpportunityRow>([], 0, bounds), async () => {
        const supabase = await createServerSupabase();
        let query = supabase
            .from('opportunities')
            .select('*, programme:internship_programmes(id, name, cohort_label), track:programme_tracks(id, name)', {
                count: 'exact',
            })
            .order('created_at', { ascending: false })
            .range(bounds.from, bounds.to);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.search?.trim()) {
            const term = sanitizeSearch(filters.search);
            query = query.or(`title.ilike.%${term}%,summary.ilike.%${term}%,location.ilike.%${term}%`);
        }
        const { data, error, count } = await query;
        if (error) throw error;
        return toPage(data, count, bounds);
    });
}

/** The public catalogue. Only published rows; RLS enforces the same rule. */
export async function listPublishedOpportunities(): Promise<Loaded<OpportunityRow[]>> {
    return guard<OpportunityRow[]>([], async () => {
        const { data, error } = await publicSupabase
            .from('opportunities')
            .select('*, programme:internship_programmes(id, name, cohort_label), track:programme_tracks(id, name)')
            .eq('status', 'published')
            .order('closes_at', { ascending: true, nullsFirst: false });
        if (error) throw error;
        return data ?? [];
    });
}

/** Whether the form should be open, decided once at load rather than during render. */
export type ApplicationWindow = 'open' | 'not_yet_open' | 'closed';

export interface PublicOpportunity {
    opportunity: OpportunityRow;
    window: ApplicationWindow;
}

export async function getPublishedOpportunity(slug: string): Promise<Loaded<PublicOpportunity | null>> {
    return guard<PublicOpportunity | null>(null, async () => {
        const { data, error } = await publicSupabase
            .from('opportunities')
            .select('*, programme:internship_programmes(id, name, cohort_label), track:programme_tracks(id, name)')
            .eq('slug', slug)
            .eq('status', 'published')
            .maybeSingle();
        if (error) throw error;
        if (!data) return null;

        // Computed here, at request time. Deciding it inside the component would bake
        // "open" into the cached HTML and keep the form live past the closing date.
        const now = Date.now();
        const window: ApplicationWindow =
            data.opens_at && Date.parse(data.opens_at) > now
                ? 'not_yet_open'
                : data.closes_at && Date.parse(data.closes_at) < now
                  ? 'closed'
                  : 'open';

        return { opportunity: data, window };
    });
}

export type ProgrammeEvent = Tables<'programme_events'> & {
    programme: Pick<Tables<'internship_programmes'>, 'id' | 'name'> | null;
};

/** Split at load time so the page body stays a pure function of its input. */
export interface EventCalendar {
    upcoming: ProgrammeEvent[];
    past: ProgrammeEvent[];
}

export async function listProgrammeEvents(programmeId?: string): Promise<Loaded<EventCalendar>> {
    return guard<EventCalendar>({ upcoming: [], past: [] }, async () => {
        const supabase = await createServerSupabase();
        const now = Date.now();

        let query = supabase
            .from('programme_events')
            .select('*, programme:internship_programmes(id, name)')
            .gte('ends_at', new Date(now - 30 * 86_400_000).toISOString())
            .order('starts_at');
        if (programmeId) query = query.eq('programme_id', programmeId);

        const { data, error } = await query;
        if (error) throw error;

        const events = data ?? [];
        return {
            upcoming: events.filter((event) => Date.parse(event.starts_at) >= now),
            past: events.filter((event) => Date.parse(event.starts_at) < now).reverse(),
        };
    });
}
