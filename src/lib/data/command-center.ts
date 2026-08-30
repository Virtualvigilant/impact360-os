import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type { Tables, Views } from '@/types/database';
import { inGroup, type AppRole } from '@/lib/auth/roles';
import { guard, unwrap, type Loaded } from './query';

/**
 * The command center loads exactly what the signed-in role needs.
 *
 * The previous version issued every query for every role and discarded most of the
 * results — an intern's dashboard fetched the full application pipeline, mentor
 * capacity and programme health, then rendered none of it. Each shape below is a
 * separate contract so a role's dashboard cannot silently depend on data it never
 * requested.
 */

export interface InternDashboard {
    kind: 'intern';
    placement: Tables<'placements'> | null;
    summary: Views<'intern_operating_summary'> | null;
    tasks: Tables<'tasks'>[];
    goals: Tables<'learning_goals'>[];
    feedback: Tables<'feedback_entries'>[];
    events: Tables<'programme_events'>[];
    latestCheckIn: Tables<'internship_check_ins'> | null;
    documentsOutstanding: number;
}

export interface SupervisionDashboard {
    kind: 'supervision';
    interns: Views<'intern_operating_summary'>[];
    checkInsAwaitingReview: number;
    tasksAwaitingReview: number;
    openRisks: Tables<'risk_signals'>[];
    events: Tables<'programme_events'>[];
}

export interface TalentDashboard {
    kind: 'talent';
    submitted: number;
    inReview: number;
    interviewing: number;
    selected: number;
    upcomingInterviews: (Tables<'interviews'> & { application: Pick<Tables<'applications'>, 'full_name'> | null })[];
    openOpportunities: Tables<'opportunities'>[];
}

export interface LeadershipDashboard {
    kind: 'leadership';
    health: Views<'programme_health'>[];
    mentorLoad: Views<'mentor_capacity'>[];
    openConcerns: number;
    atRiskInterns: Views<'intern_operating_summary'>[];
}

export interface AlumniDashboard {
    kind: 'alumni';
    profile: Tables<'alumni_profiles'> | null;
    openOpportunities: Tables<'opportunities'>[];
}

export type Dashboard =
    | InternDashboard
    | SupervisionDashboard
    | TalentDashboard
    | LeadershipDashboard
    | AlumniDashboard;

const horizon = () => new Date(Date.now() + 30 * 86_400_000).toISOString();
const now = () => new Date().toISOString();

async function internDashboard(internId: string): Promise<InternDashboard> {
    const supabase = await createServerSupabase();

    const placementResult = await supabase
        .from('placements')
        .select('*')
        .eq('intern_id', internId)
        .in('status', ['preboarding', 'onboarding', 'active', 'paused', 'completing'])
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (placementResult.error) throw placementResult.error;
    const placement = placementResult.data;

    if (!placement) {
        const events = await supabase
            .from('programme_events')
            .select('*')
            .gte('starts_at', now())
            .lte('starts_at', horizon())
            .order('starts_at')
            .limit(5);
        return {
            kind: 'intern',
            placement: null,
            summary: null,
            tasks: [],
            goals: [],
            feedback: [],
            events: unwrap(events) ?? [],
            latestCheckIn: null,
            documentsOutstanding: 0,
        };
    }

    const [summary, tasks, goals, feedback, events, checkIn, documents] = await Promise.all([
        supabase.from('intern_operating_summary').select('*').eq('placement_id', placement.id).maybeSingle(),
        supabase
            .from('tasks')
            .select('*')
            .eq('placement_id', placement.id)
            .not('status', 'in', '("completed","cancelled")')
            .order('due_at', { nullsFirst: false })
            .limit(10),
        supabase.from('learning_goals').select('*').eq('placement_id', placement.id).order('target_date', { nullsFirst: false }),
        supabase
            .from('feedback_entries')
            .select('*')
            .eq('placement_id', placement.id)
            .order('created_at', { ascending: false })
            .limit(5),
        supabase
            .from('programme_events')
            .select('*')
            .gte('starts_at', now())
            .lte('starts_at', horizon())
            .order('starts_at')
            .limit(5),
        supabase
            .from('internship_check_ins')
            .select('*')
            .eq('placement_id', placement.id)
            .order('period_end', { ascending: false })
            .limit(1)
            .maybeSingle(),
        supabase
            .from('intern_documents')
            .select('id', { count: 'exact', head: true })
            .eq('placement_id', placement.id)
            .in('status', ['required', 'rejected', 'expired']),
    ]);

    return {
        kind: 'intern',
        placement,
        summary: unwrap(summary),
        tasks: unwrap(tasks) ?? [],
        goals: unwrap(goals) ?? [],
        feedback: unwrap(feedback) ?? [],
        events: unwrap(events) ?? [],
        latestCheckIn: unwrap(checkIn),
        documentsOutstanding: documents.count ?? 0,
    };
}

async function supervisionDashboard(): Promise<SupervisionDashboard> {
    const supabase = await createServerSupabase();
    const [interns, checkIns, tasks, risks, events] = await Promise.all([
        supabase
            .from('intern_operating_summary')
            .select('*')
            .order('risk_level', { ascending: false })
            .order('full_name')
            .limit(50),
        supabase.from('internship_check_ins').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'under_review']),
        supabase.from('risk_signals').select('*').is('resolved_at', null).order('detected_at', { ascending: false }).limit(10),
        supabase
            .from('programme_events')
            .select('*')
            .gte('starts_at', now())
            .lte('starts_at', horizon())
            .order('starts_at')
            .limit(5),
    ]);

    return {
        kind: 'supervision',
        interns: unwrap(interns) ?? [],
        checkInsAwaitingReview: checkIns.count ?? 0,
        tasksAwaitingReview: tasks.count ?? 0,
        openRisks: unwrap(risks) ?? [],
        events: unwrap(events) ?? [],
    };
}

async function talentDashboard(): Promise<TalentDashboard> {
    const supabase = await createServerSupabase();
    const countOf = (status: Tables<'applications'>['status']) =>
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', status);

    const [submitted, inReview, interviewing, selected, interviews, opportunities] = await Promise.all([
        countOf('submitted'),
        countOf('under_review'),
        countOf('interview'),
        countOf('selected'),
        supabase
            .from('interviews')
            .select('*, application:applications(full_name)')
            .eq('status', 'scheduled')
            .gte('scheduled_at', now())
            .order('scheduled_at')
            .limit(8),
        supabase.from('opportunities').select('*').eq('status', 'published').order('closes_at', { nullsFirst: false }).limit(10),
    ]);

    return {
        kind: 'talent',
        submitted: submitted.count ?? 0,
        inReview: inReview.count ?? 0,
        interviewing: interviewing.count ?? 0,
        selected: selected.count ?? 0,
        upcomingInterviews: unwrap(interviews) ?? [],
        openOpportunities: unwrap(opportunities) ?? [],
    };
}

async function leadershipDashboard(): Promise<LeadershipDashboard> {
    const supabase = await createServerSupabase();
    const [health, mentors, concerns, atRisk] = await Promise.all([
        supabase.from('programme_health').select('*').order('name'),
        supabase.from('mentor_capacity').select('*').order('active_interns', { ascending: false }).limit(20),
        supabase
            .from('programme_concerns')
            .select('id', { count: 'exact', head: true })
            .not('status', 'in', '("resolved","closed")'),
        supabase
            .from('intern_operating_summary')
            .select('*')
            .in('risk_level', ['high', 'critical'])
            .order('full_name')
            .limit(20),
    ]);

    return {
        kind: 'leadership',
        health: unwrap(health) ?? [],
        mentorLoad: unwrap(mentors) ?? [],
        openConcerns: concerns.count ?? 0,
        atRiskInterns: unwrap(atRisk) ?? [],
    };
}

async function alumniDashboard(profileId: string): Promise<AlumniDashboard> {
    const supabase = await createServerSupabase();
    const [profile, opportunities] = await Promise.all([
        supabase.from('alumni_profiles').select('*').eq('profile_id', profileId).maybeSingle(),
        supabase.from('opportunities').select('*').eq('status', 'published').order('closes_at', { nullsFirst: false }).limit(10),
    ]);
    return { kind: 'alumni', profile: unwrap(profile), openOpportunities: unwrap(opportunities) ?? [] };
}

/** Pick the dashboard the role actually needs, then load only that. */
export async function loadCommandCenter(profileId: string, role: AppRole): Promise<Loaded<Dashboard>> {
    const fallback: Dashboard =
        role === 'intern'
            ? { kind: 'intern', placement: null, summary: null, tasks: [], goals: [], feedback: [], events: [], latestCheckIn: null, documentsOutstanding: 0 }
            : { kind: 'supervision', interns: [], checkInsAwaitingReview: 0, tasksAwaitingReview: 0, openRisks: [], events: [] };

    return guard(fallback, async () => {
        if (role === 'intern') return internDashboard(profileId);
        if (role === 'alumni') return alumniDashboard(profileId);
        if (role === 'recruiter') return talentDashboard();
        if (inGroup(role, 'programmeLeaders')) return leadershipDashboard();
        return supervisionDashboard();
    });
}
