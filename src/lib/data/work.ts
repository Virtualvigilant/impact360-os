import 'server-only';

import { createServerSupabase } from '@/lib/supabase/server';
import type { Enums, Tables } from '@/types/database';
export { canTransition, INTERN_TRANSITIONS, REVIEWER_TRANSITIONS, TASK_COLUMNS, type TaskStatus } from '@/lib/domain/work';
import type { TaskStatus } from '@/lib/domain/work';
import { guard, pageBounds, sanitizeSearch, toPage, unwrap, type Loaded, type Page, type PageRequest } from './query';

export interface TaskRow extends Tables<'tasks'> {
    project: Pick<Tables<'projects'>, 'id' | 'name' | 'code'> | null;
    placement: { intern: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'avatar_url'> | null } | null;
}

export interface TaskFilters extends PageRequest {
    search?: string;
    status?: TaskStatus;
    projectId?: string;
    placementId?: string;
    priority?: Enums<'priority_level'>;
}

export async function listTasks(filters: TaskFilters = {}): Promise<Loaded<Page<TaskRow>>> {
    const bounds = pageBounds({ pageSize: 100, ...filters });
    return guard(toPage<TaskRow>([], 0, bounds), async () => {
        const supabase = await createServerSupabase();
        let query = supabase
            .from('tasks')
            .select(
                '*, project:projects(id, name, code), placement:placements(intern:profiles!placements_intern_id_fkey(id, full_name, avatar_url))',
                { count: 'exact' },
            )
            .order('due_at', { ascending: true, nullsFirst: false })
            .range(bounds.from, bounds.to);

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.projectId) query = query.eq('project_id', filters.projectId);
        if (filters.placementId) query = query.eq('placement_id', filters.placementId);
        if (filters.priority) query = query.eq('priority', filters.priority);
        if (filters.search?.trim()) {
            const term = sanitizeSearch(filters.search);
            query = query.or(`title.ilike.%${term}%,objective.ilike.%${term}%`);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return toPage(data, count, bounds);
    });
}

export interface TaskDetail {
    task: TaskRow;
    evidence: Tables<'work_evidence'>[];
    comments: (Tables<'task_comments'> & { author: Pick<Tables<'profiles'>, 'full_name' | 'avatar_url'> | null })[];
    competencies: (Tables<'task_competencies'> & { competency: Pick<Tables<'competencies'>, 'name' | 'category'> | null })[];
}

export async function getTask(id: string): Promise<Loaded<TaskDetail | null>> {
    return guard<TaskDetail | null>(null, async () => {
        const supabase = await createServerSupabase();
        const taskResult = await supabase
            .from('tasks')
            .select(
                '*, project:projects(id, name, code), placement:placements(intern:profiles!placements_intern_id_fkey(id, full_name, avatar_url))',
            )
            .eq('id', id)
            .maybeSingle();
        if (taskResult.error) throw taskResult.error;
        if (!taskResult.data) return null;

        const [evidence, comments, competencies] = await Promise.all([
            supabase.from('work_evidence').select('*').eq('task_id', id).order('created_at', { ascending: false }),
            supabase
                .from('task_comments')
                .select('*, author:profiles(full_name, avatar_url)')
                .eq('task_id', id)
                .order('created_at'),
            supabase
                .from('task_competencies')
                .select('*, competency:competencies(name, category)')
                .eq('task_id', id),
        ]);

        return {
            task: taskResult.data,
            evidence: unwrap(evidence) ?? [],
            comments: unwrap(comments) ?? [],
            competencies: unwrap(competencies) ?? [],
        };
    });
}

export interface ProjectRow extends Tables<'projects'> {
    programme: Pick<Tables<'internship_programmes'>, 'id' | 'name' | 'cohort_label'> | null;
    lead: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'avatar_url'> | null;
}

export async function listProjects(filters: PageRequest & { search?: string; status?: Enums<'project_status'> } = {}): Promise<Loaded<Page<ProjectRow>>> {
    const bounds = pageBounds(filters);
    return guard(toPage<ProjectRow>([], 0, bounds), async () => {
        const supabase = await createServerSupabase();
        let query = supabase
            .from('projects')
            .select(
                '*, programme:internship_programmes(id, name, cohort_label), lead:profiles!projects_project_lead_id_fkey(id, full_name, avatar_url)',
                { count: 'exact' },
            )
            .order('created_at', { ascending: false })
            .range(bounds.from, bounds.to);

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.search?.trim()) {
            const term = sanitizeSearch(filters.search);
            query = query.or(`name.ilike.%${term}%,code.ilike.%${term}%,summary.ilike.%${term}%`);
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return toPage(data, count, bounds);
    });
}

export interface ProjectDetail {
    project: ProjectRow;
    // project_members joins a *placement*, not a profile: membership belongs to the
    // internship, so it ends when the placement ends.
    members: (Tables<'project_members'> & {
        placement: { intern: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'avatar_url'> | null } | null;
    })[];
    milestones: Tables<'milestones'>[];
    tasks: TaskRow[];
}

export async function getProject(id: string): Promise<Loaded<ProjectDetail | null>> {
    return guard<ProjectDetail | null>(null, async () => {
        const supabase = await createServerSupabase();
        const projectResult = await supabase
            .from('projects')
            .select(
                '*, programme:internship_programmes(id, name, cohort_label), lead:profiles!projects_project_lead_id_fkey(id, full_name, avatar_url)',
            )
            .eq('id', id)
            .maybeSingle();
        if (projectResult.error) throw projectResult.error;
        if (!projectResult.data) return null;

        const [members, milestones, tasks] = await Promise.all([
            supabase
                .from('project_members')
                .select('*, placement:placements(intern:profiles!placements_intern_id_fkey(id, full_name, avatar_url))')
                .eq('project_id', id),
            supabase.from('milestones').select('*').eq('project_id', id).order('due_date'),
            supabase
                .from('tasks')
                .select(
                    '*, project:projects(id, name, code), placement:placements(intern:profiles!placements_intern_id_fkey(id, full_name, avatar_url))',
                )
                .eq('project_id', id)
                .order('due_at', { nullsFirst: false }),
        ]);

        return {
            project: projectResult.data,
            members: unwrap(members) ?? [],
            milestones: unwrap(milestones) ?? [],
            tasks: unwrap(tasks) ?? [],
        };
    });
}
