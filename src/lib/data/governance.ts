import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type { Tables, Views } from '@/types/database';
import { guard, unwrap, type Loaded } from './query';

export interface IntelligenceBoard {
    health: Views<'programme_health'>[];
    risks: (Tables<'risk_signals'> & { placement: { intern: Pick<Tables<'profiles'>, 'id' | 'full_name'> | null } | null })[];
    insights: Tables<'ai_insights'>[];
}

/**
 * Programme intelligence.
 *
 * Risk signals and AI insights are kept as separate lists rather than merged into one
 * feed with a `record_kind` discriminator, as the previous implementation did. They are
 * different things: a risk signal is a rule that fired against a source record, an
 * insight is a model output awaiting human review, and the interface should not
 * flatten that distinction.
 */
export async function getIntelligenceBoard(): Promise<Loaded<IntelligenceBoard>> {
    return guard<IntelligenceBoard>({ health: [], risks: [], insights: [] }, async () => {
        const supabase = await createServerSupabase();
        const [health, risks, insights] = await Promise.all([
            supabase.from('programme_health').select('*').order('name'),
            supabase
                .from('risk_signals')
                .select('*, placement:placements(intern:profiles!placements_intern_id_fkey(id, full_name))')
                .is('resolved_at', null)
                .order('detected_at', { ascending: false })
                .limit(50),
            supabase.from('ai_insights').select('*').order('generated_at', { ascending: false }).limit(25),
        ]);
        return {
            health: unwrap(health) ?? [],
            risks: unwrap(risks) ?? [],
            insights: unwrap(insights) ?? [],
        };
    });
}

export interface GovernanceBoard {
    policies: Tables<'policies'>[];
    dataRequests: Tables<'data_subject_requests'>[];
    retention: Tables<'data_retention_policies'>[];
    audits: Tables<'audit_logs'>[];
    staff: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'email' | 'role' | 'is_active' | 'last_seen_at'>[];
}

const EMPTY_GOVERNANCE: GovernanceBoard = {
    policies: [],
    dataRequests: [],
    retention: [],
    audits: [],
    staff: [],
};

export async function getGovernanceBoard(): Promise<Loaded<GovernanceBoard>> {
    return guard(EMPTY_GOVERNANCE, async () => {
        const supabase = await createServerSupabase();
        const [policies, dataRequests, retention, audits, staff] = await Promise.all([
            supabase.from('policies').select('*').order('effective_from', { ascending: false }),
            supabase.from('data_subject_requests').select('*').order('created_at', { ascending: false }).limit(50),
            supabase.from('data_retention_policies').select('*').order('record_category'),
            supabase.from('audit_logs').select('*').order('occurred_at', { ascending: false }).limit(100),
            supabase
                .from('profiles')
                .select('id, full_name, email, role, is_active, last_seen_at')
                .order('role')
                .order('full_name')
                .limit(200),
        ]);
        return {
            policies: unwrap(policies) ?? [],
            dataRequests: unwrap(dataRequests) ?? [],
            retention: unwrap(retention) ?? [],
            audits: unwrap(audits) ?? [],
            staff: unwrap(staff) ?? [],
        };
    });
}

export interface OutcomesBoard {
    outcomes: (Tables<'internship_outcomes'> & {
        placement: {
            intern: Pick<Tables<'profiles'>, 'id' | 'full_name'> | null;
            programme: Pick<Tables<'internship_programmes'>, 'id' | 'name'> | null;
        } | null;
    })[];
    requirements: Tables<'completion_requirements'>[];
    certificates: Tables<'certificates'>[];
}

export async function getOutcomesBoard(): Promise<Loaded<OutcomesBoard>> {
    return guard<OutcomesBoard>({ outcomes: [], requirements: [], certificates: [] }, async () => {
        const supabase = await createServerSupabase();
        const [outcomes, requirements, certificates] = await Promise.all([
            supabase
                .from('internship_outcomes')
                .select(
                    `*, placement:placements(
                        intern:profiles!placements_intern_id_fkey(id, full_name),
                        programme:internship_programmes(id, name)
                     )`,
                )
                .order('created_at', { ascending: false }),
            supabase.from('completion_requirements').select('*'),
            supabase.from('certificates').select('*').order('issued_at', { ascending: false }),
        ]);
        return {
            outcomes: unwrap(outcomes) ?? [],
            requirements: unwrap(requirements) ?? [],
            certificates: unwrap(certificates) ?? [],
        };
    });
}

export { completionProgress } from '@/lib/domain/metrics';
