'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { canTransition, type TaskStatus } from '@/lib/domain/work';
import {
    assignProjectMemberSchema,
    evidenceSchema,
    projectSchema,
    removeProjectMemberSchema,
    taskSchema,
    taskTransitionSchema,
} from '@/lib/validation/schemas';
import { can } from '@/lib/auth/roles';
import { action } from './helpers';

export async function createTask(input: unknown) {
    return action({ permission: 'task:assign', schema: taskSchema, input }, async (data, session) => {
        const supabase = await createServerSupabase();
        const { data: task, error } = await supabase
            .from('tasks')
            .insert({
                ...data,
                assigned_by: session.userId,
                // A task with an owner is assigned; without one it is still backlog.
                status: data.placement_id ? 'assigned' : 'backlog',
            })
            .select('id')
            .single();
        if (error) throw error;
        revalidatePath('/dashboard/tasks');
        revalidatePath('/dashboard/work');
        return task.id;
    });
}

/**
 * Move a task along the board.
 *
 * The transition table is consulted server-side against the task's *current* status
 * read from the database, not the status the browser claims it has. That closes two
 * holes in the old board: an intern approving their own work, and a stale tab
 * overwriting a review decision made in another session.
 */
export async function transitionTask(input: unknown) {
    return action({ schema: taskTransitionSchema, input }, async (data, session) => {
        const supabase = await createServerSupabase();

        const { data: task, error: readError } = await supabase
            .from('tasks')
            .select('id, status, placement_id, placement:placements(intern_id)')
            .eq('id', data.task_id)
            .maybeSingle();
        if (readError) throw readError;
        if (!task) throw new Error('That task no longer exists.');

        const isReviewer = can(session.role, 'task:review');
        const isOwner = task.placement?.intern_id === session.userId;
        if (!isReviewer && !isOwner) throw new Error('That task is not assigned to you.');

        if (!canTransition(task.status as TaskStatus, data.to_status, isReviewer)) {
            throw new Error(
                `A task cannot move from ${task.status.replaceAll('_', ' ')} to ${data.to_status.replaceAll('_', ' ')}.`,
            );
        }

        const timestamps: { submitted_at?: string; reviewed_at?: string; completed_at?: string } = {};
        if (data.to_status === 'submitted') timestamps.submitted_at = new Date().toISOString();
        if (data.to_status === 'approved' || data.to_status === 'changes_requested') {
            timestamps.reviewed_at = new Date().toISOString();
        }
        if (data.to_status === 'completed') timestamps.completed_at = new Date().toISOString();

        const { error } = await supabase
            .from('tasks')
            .update({ status: data.to_status, ...timestamps })
            .eq('id', data.task_id)
            // Optimistic concurrency: reject the write if someone changed it first.
            .eq('status', task.status);
        if (error) throw error;

        if (data.note?.trim()) {
            await supabase.from('task_comments').insert({
                task_id: data.task_id,
                author_id: session.userId,
                body: data.note,
            });
        }

        revalidatePath('/dashboard/tasks');
        revalidatePath('/dashboard/work');
        revalidatePath(`/dashboard/tasks/${data.task_id}`);
        return data.to_status;
    });
}

export async function attachEvidence(input: unknown) {
    return action({ schema: evidenceSchema, input }, async (data, session) => {
        const supabase = await createServerSupabase();
        const { error } = await supabase.from('work_evidence').insert({ ...data, submitted_by: session.userId });
        if (error) throw error;
        revalidatePath('/dashboard/work');
        if (data.task_id) revalidatePath(`/dashboard/tasks/${data.task_id}`);
        return true;
    });
}

export async function createProject(input: unknown) {
    return action({ permission: 'project:manage', schema: projectSchema, input }, async (data) => {
        const supabase = await createServerSupabase();
        const { data: project, error } = await supabase.from('projects').insert(data).select('id').single();
        if (error) throw error;
        revalidatePath('/dashboard/projects');
        return project.id;
    });
}

export async function assignProjectMember(input: unknown) {
    return action({ permission: 'project:manage', schema: assignProjectMemberSchema, input }, async (data) => {
        const supabase = await createServerSupabase();

        // 1. Fetch project info
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id, programme_id, start_date, target_end_date')
            .eq('id', data.project_id)
            .maybeSingle();
        if (projectError) throw projectError;
        if (!project) throw new Error('Project not found');

        // 2. Look for existing placement for this intern
        let placementId: string | null = null;
        if (project.programme_id) {
            const { data: existingPlacement } = await supabase
                .from('placements')
                .select('id')
                .eq('intern_id', data.intern_id)
                .eq('programme_id', project.programme_id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            if (existingPlacement) {
                placementId = existingPlacement.id;
            }
        }

        if (!placementId) {
            const { data: anyPlacement } = await supabase
                .from('placements')
                .select('id')
                .eq('intern_id', data.intern_id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            if (anyPlacement) {
                placementId = anyPlacement.id;
            }
        }

        // 3. If still no placement, create one
        if (!placementId) {
            let programmeId = project.programme_id;
            if (!programmeId) {
                const { data: latestProgramme } = await supabase
                    .from('internship_programmes')
                    .select('id')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                programmeId = latestProgramme?.id ?? null;
            }

            if (!programmeId) {
                throw new Error('No internship programme found. Please create a programme first before assigning interns.');
            }

            const today = new Date().toISOString().slice(0, 10);
            const futureDate = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);

            const { data: newPlacement, error: placementError } = await supabase
                .from('placements')
                .insert({
                    intern_id: data.intern_id,
                    programme_id: programmeId,
                    start_date: project.start_date ?? today,
                    end_date: project.target_end_date ?? futureDate,
                    status: 'active',
                    current_phase: 'in_progress',
                    risk_level: 'low',
                })
                .select('id')
                .single();

            if (placementError) throw placementError;
            placementId = newPlacement.id;
        }

        // 4. Upsert into project_members
        const { error: memberError } = await supabase
            .from('project_members')
            .upsert(
                {
                    project_id: data.project_id,
                    placement_id: placementId,
                    role_title: data.role_title?.trim() || 'Contributor',
                    allocation_percent: data.allocation_percent ?? 100,
                    joined_at: new Date().toISOString(),
                    left_at: null,
                },
                { onConflict: 'project_id,placement_id' },
            );

        if (memberError) throw memberError;

        revalidatePath(`/dashboard/projects/${data.project_id}`);
        revalidatePath('/dashboard/projects');
        revalidatePath('/dashboard/work');
        return { project_id: data.project_id, placement_id: placementId };
    });
}

export async function removeProjectMember(input: unknown) {
    return action({ permission: 'project:manage', schema: removeProjectMemberSchema, input }, async (data) => {
        const supabase = await createServerSupabase();
        const { error } = await supabase
            .from('project_members')
            .delete()
            .eq('project_id', data.project_id)
            .eq('placement_id', data.placement_id);
        if (error) throw error;
        revalidatePath(`/dashboard/projects/${data.project_id}`);
        revalidatePath('/dashboard/projects');
        revalidatePath('/dashboard/work');
        return true;
    });
}

