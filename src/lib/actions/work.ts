'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { canTransition, type TaskStatus } from '@/lib/domain/work';
import { evidenceSchema, projectSchema, taskSchema, taskTransitionSchema } from '@/lib/validation/schemas';
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
